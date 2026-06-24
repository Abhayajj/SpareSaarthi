const express = require('express');
const router = express.Router();
const {
  getOffers,
  getAllOffersAdmin,
  createOffer,
  toggleOffer,
  deleteOffer,
} = require('../controllers/offerController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getOffers);                              // Public — mechanics see active offers
router.get('/admin', protect, admin, getAllOffersAdmin); // Admin sees all
router.post('/', protect, admin, createOffer);
router.put('/:id/toggle', protect, admin, toggleOffer);
router.delete('/:id', protect, admin, deleteOffer);

module.exports = router;
