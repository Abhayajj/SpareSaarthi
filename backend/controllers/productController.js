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
    const { name, price, originalPrice, discount, brand, category, image, stock, isHotDeal } = req.body;

    if (!name || !price || !originalPrice || !brand || !category) {
      return res.status(400).json({ message: 'Name, price, original price, brand and category are required.' });
    }

    const product = new Product({
      name,
      price: Number(price),
      originalPrice: Number(originalPrice),
      discount: discount || '',
      brand,
      category,
      image: image || `https://placehold.co/150x150/ea580c/ffffff/png?text=${encodeURIComponent(brand)}`,
      stock: Number(stock) || 10,
      isHotDeal: isHotDeal || false,
    });

    const createdProduct = await product.save();
    const populated = await createdProduct.populate('category', 'name icon');
    res.status(201).json(populated);
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

// @desc    Update a product (Admin only)
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const { name, price, originalPrice, discount, stock, brand, isHotDeal, image } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.price = price !== undefined ? price : product.price;
      product.originalPrice = originalPrice !== undefined ? originalPrice : product.originalPrice;
      product.discount = discount !== undefined ? discount : product.discount;
      product.stock = stock !== undefined ? stock : product.stock;
      product.brand = brand || product.brand;
      product.isHotDeal = isHotDeal !== undefined ? isHotDeal : product.isHotDeal;
      if (image && image.trim() !== '') product.image = image.trim();

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk add stock to multiple products (Admin only)
// @route   PUT /api/products/bulk-stock
// @access  Private/Admin
const bulkUpdateStock = async (req, res) => {
  try {
    const { updates } = req.body; // [{ productId, addQty }]
    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ message: 'Please provide updates array.' });
    }

    const results = [];
    for (const u of updates) {
      if (!u.productId || u.addQty === undefined) continue;
      const product = await Product.findByIdAndUpdate(
        u.productId,
        { $inc: { stock: Number(u.addQty) } },
        { new: true }
      );
      if (product) results.push({ id: product._id, name: product.name, newStock: product.stock });
    }

    res.json({ message: `${results.length} product(s) stock updated.`, results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product (Admin only)
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    await product.deleteOne();
    res.json({ message: 'Product removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Process invoice PDF or image via Gemini AI
// @route   POST /api/products/process-invoice
// @access  Private/Admin
const processInvoice = async (req, res) => {
  try {
    const { fileData, mimeType } = req.body;
    if (!fileData || !mimeType) {
      return res.status(400).json({ message: 'fileData (base64) and mimeType are required.' });
    }

    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/jpg',
      'image/heic',
      'image/heif'
    ];

    if (!allowedMimeTypes.includes(mimeType)) {
      return res.status(400).json({ 
        message: 'Unsupported file format. Please select a PDF or an image file (PNG, JPEG, WEBP, HEIC).' 
      });
    }

    const categories = await Category.find({}, 'name');
    const products = await Product.find({}, 'name brand category price originalPrice stock');

    const apiKey = process.env.GEMINI_API_KEY;
    const isValidKey = apiKey && apiKey.trim().startsWith('AIzaSy');

    if (!isValidKey) {
      console.log('No valid GEMINI_API_KEY found (must start with AIzaSy), running in Mock mode.');
      
      const mockItems = [
        {
          name: "Hero Splendor Brake Shoe (Genuine)",
          brand: "Hero",
          qty: 25,
          purchasePrice: 120,
          matchedProductId: null,
          suggestedCategoryName: "Brake Shoe"
        },
        {
          name: "Motul 3000 4T 20W40 Engine Oil (1L)",
          brand: "Motul",
          qty: 50,
          purchasePrice: 280,
          matchedProductId: null,
          suggestedCategoryName: "Engine Oil"
        },
        {
          name: "Honda Activa Spark Plug (New Product)",
          brand: "Honda",
          qty: 15,
          purchasePrice: 65,
          matchedProductId: null,
          suggestedCategoryName: "Spark Plug"
        }
      ];

      // Try matching them to actual database products
      for (const item of mockItems) {
        const dbProduct = await Product.findOne({
          name: { $regex: new RegExp(item.name.replace(/ \(Genuine\)|\(New Product\)/i, '').split(' ')[1] || item.name.split(' ')[0], 'i') }
        });
        if (dbProduct) {
          item.matchedProductId = dbProduct._id;
          item.name = dbProduct.name;
        }
      }

      return res.json({
        isMock: true,
        message: apiKey
          ? 'Demo Mode (The GEMINI_API_KEY is invalid - standard keys start with "AIzaSy").'
          : 'Demo Mode (Add GEMINI_API_KEY to your backend .env for real AI OCR parsing).',
        items: mockItems
      });
    }

    // Call real Gemini API
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const prompt = `
    Analyze the provided invoice image or PDF.
    Extract the list of items/spare parts, their quantities (qty), and purchase prices (unit buying price).
    
    Here are our existing categories:
    ${JSON.stringify(categories.map(c => c.name))}
    
    Here are our existing products in the store:
    ${JSON.stringify(products.map(p => ({ id: p._id, name: p.name, brand: p.brand })))}
    
    Instructions:
    1. For each item in the invoice, check if it matches one of our existing products. If it is a clear match, set "matchedProductId" to the product's ID string.
    2. If there is no clear match, set "matchedProductId" to null, and suggest a brand name and a category name from our existing categories list.
    3. Return the response strictly as a JSON object of this structure:
    {
      "items": [
        {
          "name": "extracted item name",
          "brand": "brand name (e.g. Hero, Honda, Bajaj, TVS)",
          "qty": number,
          "purchasePrice": number,
          "matchedProductId": "ObjectId string or null",
          "suggestedCategoryName": "category name from list or null"
        }
      ]
    }
    
    Return raw JSON only. Do not include markdown code block formatting like \`\`\`json.
    `;

    const requestBody = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType,
                data: fileData
              }
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json"
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errTxt = await response.text();
      return res.status(502).json({ message: `Gemini API Error: ${errTxt}` });
    }

    const resJson = await response.json();
    const responseText = resJson.candidates[0].content.parts[0].text;
    const parsed = JSON.parse(responseText.trim());

    res.json({
      isMock: false,
      items: parsed.items || []
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Import/Confirm processed invoice items into DB
// @route   POST /api/products/import-invoice
// @access  Private/Admin
const importInvoice = async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No items provided for import.' });
    }

    const defaultCategory = await Category.findOne({});
    const defaultCategoryId = defaultCategory ? defaultCategory._id : null;

    const results = { updated: 0, created: 0 };

    for (const item of items) {
      const qty = Number(item.qty);
      const purchasePrice = Number(item.purchasePrice);

      if (isNaN(qty) || qty <= 0) {
        return res.status(400).json({ message: `Invalid quantity "${item.qty}" for item "${item.name}". Quantity must be a positive number.` });
      }
      if (isNaN(purchasePrice) || purchasePrice < 0) {
        return res.status(400).json({ message: `Invalid purchase price "${item.purchasePrice}" for item "${item.name}". Price must be a non-negative number.` });
      }

      if (item.matchedProductId) {
        // Update existing product stock & purchasePrice
        await Product.findByIdAndUpdate(item.matchedProductId, {
          $inc: { stock: qty },
          purchasePrice: purchasePrice
        });
        results.updated++;
      } else {
        // Suggest / Create new product
        let categoryId = defaultCategoryId;
        if (item.suggestedCategoryName) {
          const categoryDoc = await Category.findOne({ name: item.suggestedCategoryName });
          if (categoryDoc) categoryId = categoryDoc._id;
        }

        // Set selling price with default 30% markup, and MRP with 50% markup
        const purchaseVal = Number(item.purchasePrice);
        const priceVal = Math.round(purchaseVal * 1.30);
        const originalPriceVal = Math.round(purchaseVal * 1.50);

        const newProd = new Product({
          name: item.name,
          brand: item.brand || 'General',
          category: categoryId,
          price: priceVal,
          originalPrice: originalPriceVal,
          purchasePrice: purchaseVal,
          stock: Number(item.qty),
          image: `https://placehold.co/150x150/ea580c/ffffff/png?text=${encodeURIComponent(item.name)}`,
          discount: 'Special Deal',
        });
        await newProd.save();
        results.created++;
      }
    }

    res.json({
      message: `Inventory updated successfully. Updated ${results.updated} item(s) and created ${results.created} item(s).`,
      results
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  getCategories,
  updateProduct,
  bulkUpdateStock,
  deleteProduct,
  processInvoice,
  importInvoice,
};
