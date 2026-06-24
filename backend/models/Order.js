const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  orderItems: [
    {
      name: { type: String, required: true },
      qty: { type: Number, required: true },
      price: { type: Number, required: true },
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
    }
  ],
  totalAmount: {
    type: Number,
    required: true,
    default: 0.0,
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending Payment', 'Confirmed', 'Self Pickup', 'Delivered'],
    default: 'Pending Payment',
  },
  coinsEarned: {
    type: Number,
    default: 0,
  },
  coinsRedeemed: {
    type: Number,
    default: 0,
  },
  deliveryPartner: {
    type: String,
    default: '',
  },
  trackingNumber: {
    type: String,
    default: '',
  }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
