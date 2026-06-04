const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/commerceos')
  .then(() => console.log('✅ MongoDB connected (CommerceOS)'))
  .catch((err) => console.log('❌ MongoDB connection error:', err));

const productRoutes = require('./routes/productRoutes');
const salesRoutes = require('./routes/salesRoutes');
const agentRoutes = require('./routes/agentRoutes');
const agentsRoutes = require('./routes/agentsRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const businessRoutes = require('./routes/businessRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    platform: 'CommerceOS',
    version: '1.0.0',
    routes: [
      '/api/auth',
      '/api/businesses',
      '/api/products',
      '/api/sales',
      '/api/orders',
      '/api/agent',
      '/api/payments',
    ],
  });
});

const alertRoutes = require('./routes/alertRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/agent', agentsRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/payments', paymentRoutes);

app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res
      .status(413)
      .json({ success: false, message: 'File is too large. Maximum allowed size is 500 MB.' });
  }
  if (err.name === 'MulterError') {
    return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
  }
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 CommerceOS API running on port ${PORT}`);
  console.log(`🤖 AI provider: ${
    process.env.OPENAI_API_KEY?.trim()   ? 'OpenAI  ✅' :
    process.env.GEMINI_API_KEY?.trim()   ? 'Gemini  ✅' :
                                           'Mock mode ⚠️  (add OPENAI_API_KEY or GEMINI_API_KEY to .env)'
  }`);
  
  // Start automatic background agents
  const { startAutomaticAgents } = require('./services/agentScheduler');
  startAutomaticAgents();
});
