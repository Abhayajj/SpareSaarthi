const Offer = require('../models/Offer');

// @desc    Get all active offers
// @route   GET /api/offers
// @access  Public
const getOffers = async (req, res) => {
  try {
    const offers = await Offer.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get ALL offers (including inactive) for admin
// @route   GET /api/offers/admin
// @access  Private/Admin
const getAllOffersAdmin = async (req, res) => {
  try {
    const offers = await Offer.find({}).sort({ createdAt: -1 });
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new offer
// @route   POST /api/offers
// @access  Private/Admin
const createOffer = async (req, res) => {
  try {
    const { title, description, badgeText, discountPercent, bgColor, validUntil, applicableCategory } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required.' });
    }

    const offer = await Offer.create({
      title,
      description,
      badgeText: badgeText || 'LIMITED OFFER',
      discountPercent: discountPercent || 0,
      bgColor: bgColor || '#ea580c',
      validUntil: validUntil ? new Date(validUntil) : null,
      applicableCategory: applicableCategory || 'All Products',
      isActive: true,
    });

    res.status(201).json(offer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle offer active/inactive
// @route   PUT /api/offers/:id/toggle
// @access  Private/Admin
const toggleOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ message: 'Offer not found' });
    offer.isActive = !offer.isActive;
    await offer.save();
    res.json(offer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete offer
// @route   DELETE /api/offers/:id
// @access  Private/Admin
const deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ message: 'Offer not found' });
    await offer.deleteOne();
    res.json({ message: 'Offer removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getOffers, getAllOffersAdmin, createOffer, toggleOffer, deleteOffer };
