const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrders,
  updateOrderStatus,
  createCheckoutSession,
  confirmPayment,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createOrder)
  .get(protect, admin, getOrders);

router.post('/checkout-session', protect, createCheckoutSession);
router.post('/:id/confirm-payment', protect, confirmPayment);

router.route('/myorders')
  .get(protect, getMyOrders);

router.route('/:id/status')
  .put(protect, admin, updateOrderStatus);

module.exports = router;
