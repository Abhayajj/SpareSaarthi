const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  badgeText: {
    type: String,
    default: 'LIMITED OFFER',
  },
  discountPercent: {
    type: Number,
    default: 0,
  },
  bgColor: {
    type: String,
    default: '#ea580c',
  },
  validUntil: {
    type: Date,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  applicableCategory: {
    type: String,
    default: 'All Products',
  },
}, { timestamps: true });

const Offer = mongoose.model('Offer', offerSchema);
module.exports = Offer;
