/**
 * seed.js — Populates the database with realistic demo data
 * Run: node seed.js
 *
 * Creates:
 *  - 2 users  (admin + seller)
 *  - 20 products with simple everyday names
 *  - 30 sales records spread across the last 14 days
 *  - 5 purchase orders
 */

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const dotenv   = require('dotenv');
dotenv.config();

// ── Models ────────────────────────────────────────────────────────────────────
const User    = require('./models/User');
const Product = require('./models/Product');
const Sale    = require('./models/Sale');
const Order   = require('./models/Order');

// ── Helpers ───────────────────────────────────────────────────────────────────
const rand  = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d; };

// ── Seed data ─────────────────────────────────────────────────────────────────

const PRODUCTS = [
  // Groceries
  { name: 'Rice',          category: 'Groceries',    price: 60,  quantity: 200, sold: 85  },
  { name: 'Sugar',         category: 'Groceries',    price: 45,  quantity: 150, sold: 60  },
  { name: 'Salt',          category: 'Groceries',    price: 20,  quantity: 300, sold: 120 },
  { name: 'Wheat Flour',   category: 'Groceries',    price: 55,  quantity: 180, sold: 70  },
  { name: 'Cooking Oil',   category: 'Groceries',    price: 130, quantity: 90,  sold: 45  },
  // Beverages
  { name: 'Milk',          category: 'Beverages',    price: 25,  quantity: 100, sold: 95  },
  { name: 'Tea',           category: 'Beverages',    price: 180, quantity: 60,  sold: 30  },
  { name: 'Coffee',        category: 'Beverages',    price: 250, quantity: 40,  sold: 20  },
  { name: 'Cold Drink',    category: 'Beverages',    price: 40,  quantity: 120, sold: 75  },
  { name: 'Water Bottle',  category: 'Beverages',    price: 20,  quantity: 200, sold: 110 },
  // Snacks
  { name: 'Biscuits',      category: 'Snacks',       price: 30,  quantity: 80,  sold: 55  },
  { name: 'Chips',         category: 'Snacks',       price: 20,  quantity: 100, sold: 80  },
  { name: 'Bread',         category: 'Snacks',       price: 45,  quantity: 60,  sold: 50  },
  { name: 'Chocolate',     category: 'Snacks',       price: 50,  quantity: 70,  sold: 40  },
  // Personal Care
  { name: 'Soap',          category: 'Personal Care',price: 35,  quantity: 120, sold: 65  },
  { name: 'Shampoo',       category: 'Personal Care',price: 120, quantity: 50,  sold: 25  },
  { name: 'Toothpaste',    category: 'Personal Care',price: 80,  quantity: 90,  sold: 45  },
  // Household
  { name: 'Detergent',     category: 'Household',   price: 150, quantity: 70,  sold: 30  },
  { name: 'Floor Cleaner', category: 'Household',   price: 90,  quantity: 15,  sold: 18  }, // low stock
  { name: 'Dish Soap',     category: 'Household',   price: 60,  quantity: 8,   sold: 22  }, // low stock
];

const SUPPLIERS = ['Fresh Mart Suppliers', 'City Whole Sale', 'Daily Needs Co.', 'Quick Stock Ltd.'];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // ── Clear existing data ──────────────────────────────────────────────
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Sale.deleteMany({}),
      Order.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // ── Create users ─────────────────────────────────────────────────────
    const adminUser = await User.create({
      name:         'Admin User',
      email:        'admin@store.com',
      password:     'admin123',
      role:         'admin',
      storeName:    'SuperMart',
      headquarters: 'Chennai, TN',
      contact:      '+91 98765 43210',
    });

    const sellerUser = await User.create({
      name:         'Shop Owner',
      email:        'seller@store.com',
      password:     'seller123',
      role:         'seller',
      storeName:    'Corner Store',
      headquarters: 'Coimbatore, TN',
      contact:      '+91 91234 56789',
    });

    console.log('👤 Created 2 users');
    console.log('   Admin  → admin@store.com  / admin123');
    console.log('   Seller → seller@store.com / seller123');

    // ── Create products for admin ─────────────────────────────────────────
    const insertedProducts = await Product.insertMany(
      PRODUCTS.map(p => ({ ...p, storeId: adminUser._id }))
    );
    console.log(`📦 Created ${insertedProducts.length} products`);

    // ── Create products for seller too (subset) ───────────────────────────
    await Product.insertMany(
      PRODUCTS.slice(0, 10).map(p => ({
        ...p,
        storeId:  sellerUser._id,
        quantity: rand(20, 120),
        sold:     rand(5, 50),
      }))
    );
    console.log('📦 Created seller store products');

    // ── Create sales records (last 14 days) for admin ─────────────────────
    const salesData = [];
    for (let i = 0; i < 30; i++) {
      const product = insertedProducts[rand(0, insertedProducts.length - 1)];
      const qty     = rand(1, 5);
      salesData.push({
        storeId:     adminUser._id,
        productId:   product._id,
        productName: product.name,
        quantitySold: qty,
        totalAmount: qty * product.price,
        createdAt:   daysAgo(rand(0, 13)),
        updatedAt:   daysAgo(rand(0, 13)),
      });
    }
    await Sale.insertMany(salesData);
    console.log(`🛒 Created ${salesData.length} sales records`);

    // ── Create purchase orders ────────────────────────────────────────────
    const orders = [
      {
        storeId:     adminUser._id,
        poNumber:    'PO-20260414-1001',
        supplier:    SUPPLIERS[0],
        productName: 'Rice',
        quantity:    500,
        unitPrice:   58,
        totalAmount: 29000,
        status:      'Ordered',
        expectedDate: daysAgo(-3), // 3 days from now
      },
      {
        storeId:     adminUser._id,
        poNumber:    'PO-20260414-1002',
        supplier:    SUPPLIERS[1],
        productName: 'Floor Cleaner',
        quantity:    100,
        unitPrice:   85,
        totalAmount: 8500,
        status:      'In Transit',
        expectedDate: daysAgo(-1),
        notes:       'Low stock — urgent reorder',
      },
      {
        storeId:     adminUser._id,
        poNumber:    'PO-20260414-1003',
        supplier:    SUPPLIERS[2],
        productName: 'Dish Soap',
        quantity:    150,
        unitPrice:   55,
        totalAmount: 8250,
        status:      'Arriving Today',
        expectedDate: new Date(),
      },
      {
        storeId:     adminUser._id,
        poNumber:    'PO-20260413-1004',
        supplier:    SUPPLIERS[3],
        productName: 'Milk',
        quantity:    200,
        unitPrice:   24,
        totalAmount: 4800,
        status:      'Received',
        expectedDate: daysAgo(2),
      },
      {
        storeId:     adminUser._id,
        poNumber:    'PO-20260412-1005',
        supplier:    SUPPLIERS[0],
        productName: 'Cooking Oil',
        quantity:    100,
        unitPrice:   125,
        totalAmount: 12500,
        status:      'Draft',
        expectedDate: daysAgo(-7),
      },
    ];
    await Order.insertMany(orders);
    console.log(`📋 Created ${orders.length} purchase orders`);

    console.log('\n✅ Seeding complete! Login with:');
    console.log('   👑 Admin  → admin@store.com  / admin123');
    console.log('   🏪 Seller → seller@store.com / seller123');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
