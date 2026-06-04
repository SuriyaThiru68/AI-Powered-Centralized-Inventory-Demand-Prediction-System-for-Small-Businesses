const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/inventory_db')
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => console.log('❌ MongoDB connection error:', err));

// Routes - all imported here cleanly
const productRoutes = require('./routes/productRoutes');
const salesRoutes   = require('./routes/salesRoutes');
const agentRoutes   = require('./routes/agentRoutes');
const authRoutes    = require('./routes/authRoutes');
const orderRoutes   = require('./routes/orderRoutes');

app.use('/api/products', productRoutes);
app.use('/api/sales',    salesRoutes);
app.use('/api/agent',    agentRoutes);
app.use('/api/auth',     authRoutes);
app.use('/api/orders',   orderRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', routes: ['/api/products', '/api/sales', '/api/agent', '/api/auth'] });
});

// Error Handling — catches multer errors (file too large, wrong type, etc.)
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ success: false, message: 'File is too large. Maximum allowed size is 500 MB.' });
  }
  if (err.name === 'MulterError') {
    return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
  }
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Auth routes active: POST /api/auth/register | POST /api/auth/login`);
});
