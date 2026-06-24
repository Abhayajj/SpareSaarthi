const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  purchasePrice: {
    type: Number,
    default: 0,
  },
  originalPrice: {
    type: Number,
    required: true,
  },
  discount: {
    type: String,
  },
  image: {
    type: String,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
  },
  isHotDeal: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
