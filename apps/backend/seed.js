/**
 * seed.js — Demo data for CommerceOS
 * Run: npm run seed --workspace=apps/backend
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Business = require('./models/Business');
const Store = require('./models/Store');
const Product = require('./models/Product');
const Sale = require('./models/Sale');
const Order = require('./models/Order');

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

const PRODUCTS = [
  { name: 'Rice', category: 'Groceries', price: 60, quantity: 200, sold: 85 },
  { name: 'Sugar', category: 'Groceries', price: 45, quantity: 150, sold: 60 },
  { name: 'Milk', category: 'Beverages', price: 25, quantity: 100, sold: 95 },
  { name: 'Tea', category: 'Beverages', price: 180, quantity: 60, sold: 30 },
  { name: 'Floor Cleaner', category: 'Household', price: 90, quantity: 15, sold: 18 },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/commerceos');
    console.log('✅ Connected to MongoDB');

    await Promise.all([
      User.deleteMany({}),
      Business.deleteMany({}),
      Store.deleteMany({}),
      Product.deleteMany({}),
      Sale.deleteMany({}),
      Order.deleteMany({}),
    ]);

    const superAdmin = await User.create({
      name: 'Platform Admin',
      email: 'super@commerceos.app',
      password: 'admin123',
      role: 'super_admin',
    });

    const businessAdmin = await User.create({
      name: 'Demo Merchant',
      email: 'merchant@commerceos.app',
      password: 'merchant123',
      role: 'business_admin',
      storeName: 'Demo Mart',
    });

    const business = await Business.create({
      name: 'Demo Mart Pvt Ltd',
      slug: 'demo-mart',
      ownerId: businessAdmin._id,
    });

    const store = await Store.create({
      businessId: business._id,
      name: 'Demo Mart Store',
      slug: 'demo-mart-store',
      isPublished: true,
    });

    businessAdmin.businessId = business._id;
    await businessAdmin.save();

    const products = await Product.insertMany(
      PRODUCTS.map((p) => ({ ...p, businessId: business._id, storeId: store._id }))
    );

    await Sale.insertMany(
      Array.from({ length: 10 }, () => {
        const product = products[rand(0, products.length - 1)];
        const qty = rand(1, 3);
        return {
          storeId: store._id,
          productId: product._id,
          productName: product.name,
          quantitySold: qty,
          totalAmount: qty * product.price,
          createdAt: daysAgo(rand(0, 7)),
        };
      })
    );

    await User.create({
      name: 'Demo Customer',
      email: 'customer@commerceos.app',
      password: 'customer123',
      role: 'customer',
    });

    console.log('\n✅ CommerceOS seed complete');
    console.log('   super_admin    → super@commerceos.app / admin123');
    console.log('   business_admin → merchant@commerceos.app / merchant123');
    console.log('   customer       → customer@commerceos.app / customer123');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
