const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  getCategories,
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');

router.get('/categories', getCategories);
router.route('/').get(getProducts).post(protect, createProduct); // In a real app, post should be admin only
router.route('/:id').get(getProductById);

module.exports = router;
