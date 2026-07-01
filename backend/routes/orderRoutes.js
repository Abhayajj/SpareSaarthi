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

router.get('/OrderSuccess', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Order Success</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; text-align: center; padding: 40px 20px; background-color: #f1f5f9; color: #0f172a; }
          .card { background: white; padding: 30px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); max-width: 400px; margin: 0 auto; }
          .icon { font-size: 48px; margin-bottom: 16px; }
          h1 { margin: 0 0 10px 0; font-size: 24px; color: #10b981; }
          p { margin: 0 0 20px 0; color: #64748b; font-size: 15px; line-height: 1.5; }
          .btn { display: inline-block; background-color: #ea580c; color: white; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 15px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">🎉</div>
          <h1>Payment Successful!</h1>
          <p>Your payment was completed successfully. You can close this window to return to the app.</p>
          <a href="#" onclick="window.close(); return false;" class="btn">Close Window</a>
        </div>
      </body>
    </html>
  `);
});

router.get('/OrderCancel', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Order Cancelled</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; text-align: center; padding: 40px 20px; background-color: #f1f5f9; color: #0f172a; }
          .card { background: white; padding: 30px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); max-width: 400px; margin: 0 auto; }
          .icon { font-size: 48px; margin-bottom: 16px; }
          h1 { margin: 0 0 10px 0; font-size: 24px; color: #ef4444; }
          p { margin: 0 0 20px 0; color: #64748b; font-size: 15px; line-height: 1.5; }
          .btn { display: inline-block; background-color: #ea580c; color: white; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 15px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">❌</div>
          <h1>Payment Cancelled</h1>
          <p>The checkout session has been cancelled. You can close this window to return to your cart.</p>
          <a href="#" onclick="window.close(); return false;" class="btn">Close Window</a>
        </div>
      </body>
    </html>
  `);
});

module.exports = router;
