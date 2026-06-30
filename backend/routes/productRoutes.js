const express = require('express');
const router = express.Router();

router.get('/seed-db', async (req, res) => {
  if (req.query.secret !== process.env.JWT_SECRET && req.query.secret !== 'sparesaarthiseed123') {
    return res.status(401).send('Unauthorized');
  }
  try {
    const Product = require('../models/Product');
    const Category = require('../models/Category');
    const User = require('../models/User');

    await Product.deleteMany();
    await Category.deleteMany();
    await User.deleteMany({ email: 'admin@sparesaarthi.com' });

    await User.create({
      name: 'Admin Owner',
      email: 'admin@sparesaarthi.com',
      password: 'adminpassword123',
      businessName: 'SpareSaarthi Warehouse',
      address: 'HQ Warehouse Delhi',
      role: 'admin',
      coins: 0
    });

    const categories = await Category.insertMany([
      { name: 'Engine Oil', icon: '🛢️' },
      { name: 'Brake Shoe', icon: '🛑' },
      { name: 'Spark Plug', icon: '⚡' },
      { name: 'Air Filter', icon: '🌬️' },
      { name: 'Battery', icon: '🔋' },
      { name: 'Chain Sprocket', icon: '⚙️' },
    ]);

    const catMap = categories.reduce((map, cat) => {
      map[cat.name] = cat._id;
      return map;
    }, {});

    const products = [
      {
        name: 'Hero Splendor Brake Shoe (Genuine)',
        brand: 'Hero',
        category: catMap['Brake Shoe'],
        price: 180,
        originalPrice: 250,
        discount: '28% Off',
        image: 'https://placehold.co/150x150/ef4444/ffffff/png?text=Brake+Shoe',
        stock: 50,
        isHotDeal: true,
      },
      {
        name: 'Hero Passion Pro Air Filter',
        brand: 'Hero',
        category: catMap['Air Filter'],
        price: 140,
        originalPrice: 200,
        discount: '30% Off',
        image: 'https://placehold.co/150x150/ef4444/ffffff/png?text=Air+Filter',
        stock: 45,
        isHotDeal: false,
      },
      {
        name: 'Hero HF Deluxe Chain Sprocket Kit',
        brand: 'Hero',
        category: catMap['Chain Sprocket'],
        price: 650,
        originalPrice: 850,
        discount: '23% Off',
        image: 'https://placehold.co/150x150/ef4444/ffffff/png?text=Sprocket',
        stock: 20,
        isHotDeal: true,
      },
      {
        name: 'Honda Activa Brake Shoe Set',
        brand: 'Honda',
        category: catMap['Brake Shoe'],
        price: 195,
        originalPrice: 260,
        discount: '25% Off',
        image: 'https://placehold.co/150x150/dc2626/ffffff/png?text=Brake+Shoe',
        stock: 60,
        isHotDeal: true,
      },
      {
        name: 'Honda Shine Spark Plug (NGK)',
        brand: 'Honda',
        category: catMap['Spark Plug'],
        price: 85,
        originalPrice: 110,
        discount: '22% Off',
        image: 'https://placehold.co/150x150/dc2626/ffffff/png?text=Spark+Plug',
        stock: 120,
        isHotDeal: false,
      },
      {
        name: 'Honda Activa Air Filter Element',
        brand: 'Honda',
        category: catMap['Air Filter'],
        price: 160,
        originalPrice: 220,
        discount: '27% Off',
        image: 'https://placehold.co/150x150/dc2626/ffffff/png?text=Air+Filter',
        stock: 80,
        isHotDeal: false,
      },
      {
        name: 'Bajaj Pulsar 150 Front Brake Pads',
        brand: 'Bajaj',
        category: catMap['Brake Shoe'],
        price: 240,
        originalPrice: 320,
        discount: '25% Off',
        image: 'https://placehold.co/150x150/2563eb/ffffff/png?text=Brake+Pad',
        stock: 40,
        isHotDeal: true,
      },
      {
        name: 'Bajaj Pulsar Spark Plug (DTS-i Dual)',
        brand: 'Bajaj',
        category: catMap['Spark Plug'],
        price: 130,
        originalPrice: 170,
        discount: '23% Off',
        image: 'https://placehold.co/150x150/2563eb/ffffff/png?text=Spark+Plug',
        stock: 100,
        isHotDeal: false,
      },
      {
        name: 'Bajaj Platina Air Filter',
        brand: 'Bajaj',
        category: catMap['Air Filter'],
        price: 110,
        originalPrice: 150,
        discount: '26% Off',
        image: 'https://placehold.co/150x150/2563eb/ffffff/png?text=Air+Filter',
        stock: 90,
        isHotDeal: false,
      },
      {
        name: 'TVS Apache RTR Front Brake Pads',
        brand: 'TVS',
        category: catMap['Brake Shoe'],
        price: 280,
        originalPrice: 380,
        discount: '26% Off',
        image: 'https://placehold.co/150x150/1e3a8a/ffffff/png?text=Brake+Pad',
        stock: 35,
        isHotDeal: true,
      },
      {
        name: 'TVS Jupiter Air Filter Element',
        brand: 'TVS',
        category: catMap['Air Filter'],
        price: 135,
        originalPrice: 180,
        discount: '25% Off',
        image: 'https://placehold.co/150x150/1e3a8a/ffffff/png?text=Air+Filter',
        stock: 75,
        isHotDeal: false,
      },
      {
        name: 'Exide Xplore 12V 4Ah Battery (XLTZ4)',
        brand: 'Exide',
        category: catMap['Battery'],
        price: 868,
        originalPrice: 1297,
        discount: '33% Off',
        image: 'https://placehold.co/150x150/eab308/ffffff/png?text=Battery+4Ah',
        stock: 30,
        isHotDeal: true,
      },
      {
        name: 'Exide Rider 12V 5Ah Battery (XLTZ5)',
        brand: 'Exide',
        category: catMap['Battery'],
        price: 1163,
        originalPrice: 1654,
        discount: '30% Off',
        image: 'https://placehold.co/150x150/eab308/ffffff/png?text=Battery+5Ah',
        stock: 25,
        isHotDeal: true,
      },
      {
        name: 'Motul 3000 4T 20W40 Engine Oil (1L)',
        brand: 'Motul',
        category: catMap['Engine Oil'],
        price: 360,
        originalPrice: 420,
        discount: '14% Off',
        image: 'https://placehold.co/150x150/0f172a/ffffff/png?text=Engine+Oil',
        stock: 150,
        isHotDeal: true,
      },
      {
        name: 'Castrol Activ 4T 20W40 Engine Oil (1L)',
        brand: 'Castrol',
        category: catMap['Engine Oil'],
        price: 380,
        originalPrice: 450,
        discount: '15% Off',
        image: 'https://placehold.co/150x150/166534/ffffff/png?text=Engine+Oil',
        stock: 120,
        isHotDeal: true,
      }
    ];

    await Product.insertMany(products);
    res.json({ message: 'Database seeded successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/debug-db', (req, res) => {
  const uri = process.env.MONGO_URI || '';
  const maskedUri = uri.replace(/:([^@]+)@/, ':******@');
  res.json({
    uri: maskedUri,
    readyState: require('mongoose').connection.readyState
  });
});
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
