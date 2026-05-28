const Product = require('../models/Product');
const Category = require('../models/Category');

// @desc    Get all products (with optional filtering by category/brand)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { category, brand, isHotDeal } = req.query;
    
    let filter = {};
    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (isHotDeal === 'true') filter.isHotDeal = true;

    const products = await Product.find(filter).populate('category', 'name icon');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name icon');
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product (Admin only)
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    // Basic implementation for now
    const product = new Product({
      name: req.body.name,
      price: req.body.price,
      originalPrice: req.body.originalPrice,
      discount: req.body.discount,
      brand: req.body.brand,
      category: req.body.category,
      image: req.body.image || 'https://via.placeholder.com/150',
      stock: req.body.stock || 10,
      isHotDeal: req.body.isHotDeal || false,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  getCategories,
};
