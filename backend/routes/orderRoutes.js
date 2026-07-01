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

router.get('/sandbox-checkout', async (req, res) => {
  try {
    const { session_id, orderId } = req.query;
    const Order = require('../models/Order');
    const order = await Order.findById(orderId).populate('user');
    
    if (!order) {
      return res.status(404).send('Order not found');
    }

    res.send(`
      <html>
        <head>
          <title>SpareSaarthi Safe Sandbox Payment</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #0f172a;
              color: #f8fafc;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
            }
            .container {
              background: #1e293b;
              border-radius: 20px;
              box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
              width: 100%;
              max-width: 440px;
              padding: 30px;
              box-sizing: border-box;
              border: 1px solid #334155;
            }
            .header {
              text-align: center;
              margin-bottom: 24px;
            }
            .badge {
              background: #ea580c;
              color: white;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 11px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.8px;
              display: inline-block;
              margin-bottom: 8px;
            }
            h1 {
              font-size: 20px;
              margin: 0;
              font-weight: 800;
            }
            .order-box {
              background: #111827;
              border-radius: 12px;
              padding: 16px;
              margin-bottom: 24px;
              border: 1px solid #1f2937;
            }
            .row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
              font-size: 14px;
            }
            .row:last-child {
              margin-bottom: 0;
            }
            .label {
              color: #94a3b8;
            }
            .value {
              font-weight: 600;
            }
            .total-row {
              border-top: 1px dashed #334155;
              padding-top: 10px;
              margin-top: 10px;
            }
            .total-val {
              color: #ea580c;
              font-size: 18px;
              font-weight: 800;
            }
            .options-title {
              font-size: 12px;
              font-weight: 700;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 12px;
            }
            .pay-btn {
              background-color: #ea580c;
              color: white;
              border: none;
              padding: 14px;
              border-radius: 12px;
              font-size: 15px;
              font-weight: 700;
              width: 100%;
              cursor: pointer;
              transition: background-color 0.2s;
              margin-bottom: 12px;
            }
            .pay-btn:hover {
              background-color: #d97706;
            }
            .cancel-btn {
              background-color: transparent;
              color: #94a3b8;
              border: 1.5px solid #475569;
              padding: 13px;
              border-radius: 12px;
              font-size: 15px;
              font-weight: 600;
              width: 100%;
              cursor: pointer;
              transition: border-color 0.2s, color 0.2s;
            }
            .cancel-btn:hover {
              border-color: #94a3b8;
              color: white;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <span class="badge">TEST SANDBOX</span>
              <h1>Simulate Safe Payment</h1>
            </div>

            <div class="order-box">
              <div class="row">
                <span class="label">Merchant</span>
                <span class="value">SpareSaarthi Commerce</span>
              </div>
              <div class="row">
                <span class="label">Customer</span>
                <span class="value">${order.user?.name || 'Retailer'}</span>
              </div>
              <div class="row">
                <span class="label">Order ID</span>
                <span class="value">#${order._id.toString().substring(18).toUpperCase()}</span>
              </div>
              <div class="row total-row">
                <span class="label" style="font-weight:700;">Amount Payable</span>
                <span class="total-val">₹${order.totalAmount}</span>
              </div>
            </div>

            <div class="options-title">Sandbox Controls</div>
            <button class="pay-btn" onclick="window.location.href='/api/orders/OrderSuccess?session_id=${session_id}&orderId=${orderId}'">
              Simulate Successful Payment (Pay)
            </button>
            <button class="cancel-btn" onclick="window.location.href='/api/orders/OrderCancel'">
              Simulate Cancelled Checkout (Cancel)
            </button>
          </div>
        </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send('Error loading sandbox environment.');
  }
});

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
