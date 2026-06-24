const Order = require('../models/Order');
const User = require('../models/User');

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
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrders,
  updateOrderStatus,
};
