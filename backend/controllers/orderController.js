const Order = require('../models/Order');
const User = require('../models/User');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { orderItems, totalAmount, coinsRedeemed } = req.body;

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
      coinsRedeemed,
    });

    const createdOrder = await order.save();

    // Update user coins
    const user = await User.findById(req.user._id);
    user.coins = user.coins - coinsRedeemed + coinsEarned;
    await user.save();

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
};
