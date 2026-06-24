const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  getCategories,
  updateProduct,
  bulkUpdateStock,
  deleteProduct,
  processInvoice,
  importInvoice,
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/categories', getCategories);
router.post('/process-invoice', protect, admin, processInvoice);
router.post('/import-invoice', protect, admin, importInvoice);
router.put('/bulk-stock', protect, admin, bulkUpdateStock); // Must be before /:id
router.route('/').get(getProducts).post(protect, admin, createProduct);
router.route('/:id')
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

module.exports = router;
