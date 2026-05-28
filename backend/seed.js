const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const Category = require('./models/Category');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const importData = async () => {
  try {
    await Product.deleteMany();
    await Category.deleteMany();

    const categories = await Category.insertMany([
      { name: 'Engine Oil', icon: '🛢️' },
      { name: 'Brake Shoe', icon: '🛑' },
      { name: 'Spark Plug', icon: '⚡' },
      { name: 'Air Filter', icon: '🌬️' },
      { name: 'Battery', icon: '🔋' },
    ]);

    const catMap = categories.reduce((map, cat) => {
      map[cat.name] = cat._id;
      return map;
    }, {});

    const products = [
      {
        name: 'Z4A Exide Battery - 4 Amp',
        brand: 'Exide',
        category: catMap['Battery'],
        price: 868,
        originalPrice: 1297,
        discount: '33% Off',
        image: 'https://via.placeholder.com/150/ea580c/ffffff?text=Battery+4A',
        stock: 50,
        isHotDeal: true,
      },
      {
        name: 'Z5A Exide Battery',
        brand: 'Exide',
        category: catMap['Battery'],
        price: 1163,
        originalPrice: 1654,
        discount: '30% Off',
        image: 'https://via.placeholder.com/150/ea580c/ffffff?text=Battery+5A',
        stock: 40,
        isHotDeal: true,
      },
      {
        name: 'Motul 300V Engine Oil',
        brand: 'Motul',
        category: catMap['Engine Oil'],
        price: 950,
        originalPrice: 1100,
        discount: '13% Off',
        image: 'https://via.placeholder.com/150/0f172a/ffffff?text=Motul+Oil',
        stock: 100,
        isHotDeal: true,
      },
    ];

    await Product.insertMany(products);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
