const Order = require('../models/Order');
const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_secret_key');
const { sendPushNotification } = require('../utils/notificationService');
const { sendInvoiceEmail } = require('../utils/emailService');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { orderItems, totalAmount, coinsRedeemed } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: 'User not found, please log in again.' });
    }

    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    // Calculate coins earned (e.g., 2% of total amount)
    const coinsEarned = Math.floor(totalAmount * 0.02);

    const order = new Order({
      user: req.user._id,
      orderItems,
      totalAmount,
      coinsEarned,
      coinsRedeemed: coinsRedeemed || 0,
    });

    const createdOrder = await order.save();

    // Update user coins
    const user = await User.findById(req.user._id);
    if (user) {
      user.coins = Math.max(0, (user.coins || 0) - (coinsRedeemed || 0) + coinsEarned);
      await user.save();
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Error in createOrder:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not found, please log in again.' });
    }
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error in getMyOrders:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name businessName address email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error in getOrders:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status, deliveryPartner, trackingNumber } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
      order.status = status;
      if (deliveryPartner !== undefined) order.deliveryPartner = deliveryPartner;
      if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
      
      const updatedOrder = await order.save();

      // Send push notification to user on order status update
      try {
        const user = await User.findById(order.user);
        if (user && user.pushToken) {
          sendPushNotification(
            user.pushToken,
            `Order Status Updated: ${status} 📦`,
            `Your order #${updatedOrder._id.toString().substring(18)} is now: ${status}.`,
            { orderId: updatedOrder._id.toString() }
          );
        }
      } catch (notifyErr) {
        console.error('Error sending status update notification:', notifyErr);
      }

      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create Stripe checkout session
// @route   POST /api/orders/checkout-session
// @access  Private
const createCheckoutSession = async (req, res) => {
  try {
    const { orderItems, totalAmount, coinsRedeemed } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: 'User not found, please log in again.' });
    }

    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    // Calculate coins earned (2% of total amount)
    const coinsEarned = Math.floor(totalAmount * 0.02);

    // Save order in "Pending Payment" status
    const order = new Order({
      user: req.user._id,
      orderItems,
      totalAmount,
      coinsEarned,
      coinsRedeemed: coinsRedeemed || 0,
      status: 'Pending Payment',
    });

    const createdOrder = await order.save();

    // If STRIPE_SECRET_KEY is not configured or is a mock placeholder, simulate success directly (Fallback sandbox mode)
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('mock')) {
      console.log('Stripe key is not set. Falling back to sandbox checkout...');
      return res.json({
        id: 'sandbox_session_id_' + createdOrder._id,
        url: `https://sparesaarthi.netlify.app/OrderSuccess?session_id=sandbox_session_id_${createdOrder._id}&orderId=${createdOrder._id}`,
        isSandbox: true,
        orderId: createdOrder._id,
      });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: orderItems.map(item => ({
        price_data: {
          currency: 'inr',
          product_data: {
            name: item.name,
          },
          unit_amount: item.price * 100, // Stripe expects paise
        },
        quantity: item.qty,
      })),
      mode: 'payment',
      success_url: `${req.headers.origin || 'https://sparesaarthi.netlify.app'}/OrderSuccess?session_id={CHECKOUT_SESSION_ID}&orderId=${createdOrder._id}`,
      cancel_url: `${req.headers.origin || 'https://sparesaarthi.netlify.app'}/cart`,
      metadata: {
        orderId: createdOrder._id.toString(),
      },
    });

    res.json({ id: session.id, url: session.url, isSandbox: false, orderId: createdOrder._id });
  } catch (error) {
    console.error('Error in createCheckoutSession:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Confirm Stripe payment & complete order
// @route   POST /api/orders/:id/confirm-payment
// @access  Private
const confirmPayment = async (req, res) => {
  try {
    const { session_id } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order is already confirmed
    if (order.status !== 'Pending Payment') {
      return res.json(order);
    }

    let isPaid = false;

    if (session_id && session_id.startsWith('sandbox_session_id_')) {
      // Sandbox mode: Accept directly
      isPaid = true;
    } else if (session_id && process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('mock')) {
      // Verify payment with Stripe
      const session = await stripe.checkout.sessions.retrieve(session_id);
      if (session && session.payment_status === 'paid') {
        isPaid = true;
      }
    } else {
      // If no keys are configured, fallback to accepting directly for sandbox ease
      isPaid = true;
    }

    if (isPaid) {
      order.status = 'Confirmed';
      const updatedOrder = await order.save();

      // Update user coins
      const user = await User.findById(req.user._id);
      if (user) {
        user.coins = Math.max(0, (user.coins || 0) - (order.coinsRedeemed || 0) + order.coinsEarned);
        await user.save();
      }

      // Generate invoice & email it asynchronously
      if (user) {
        sendInvoiceEmail(updatedOrder, user);
      }

      // Send push notification asynchronously
      if (user && user.pushToken) {
        sendPushNotification(
          user.pushToken,
          'Order Confirmed! 🎉',
          `Your order #${updatedOrder._id.toString().substring(18)} of ₹${updatedOrder.totalAmount} has been confirmed.`,
          { orderId: updatedOrder._id.toString() }
        );
      }

      res.json(updatedOrder);
    } else {
      res.status(400).json({ message: 'Payment verification failed' });
    }
  } catch (error) {
    console.error('Error in confirmPayment:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrders,
  updateOrderStatus,
  createCheckoutSession,
  confirmPayment,
};
