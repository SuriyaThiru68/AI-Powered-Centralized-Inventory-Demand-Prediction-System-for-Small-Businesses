const cron = require('node-cron');
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const User = require('../models/User');
const { sendAlerts } = require('./alertService');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Gemini helper for background agents
let _genAI = null;
function getGenAI() {
  if (!_genAI && process.env.GEMINI_API_KEY) {
    _genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return _genAI;
}

async function callGemini(prompt) {
  const genAI = getGenAI();
  if (!genAI) throw new Error('No GEMINI_API_KEY configured');

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
  const result = await model.generateContent(prompt);
  return result?.response?.text?.() || '';
}

// Store for agent run history
const agentRunHistory = {
  lowStock: { lastRun: null, nextRun: null, status: 'idle' },
  prediction: { lastRun: null, nextRun: null, status: 'idle' },
  decision: { lastRun: null, nextRun: null, status: 'idle' },
  notification: { lastRun: null, nextRun: null, status: 'idle' },
};

// Get all users with stores
async function getAllStoreUsers() {
  return await User.find({ role: { $in: ['business_admin', 'super_admin'] } });
}

// 1. LOW STOCK MONITOR - Runs every hour
const lowStockMonitor = cron.schedule('0 * * * *', async () => {
  console.log('🤖 [Auto-Agent] Low Stock Monitor started...');
  agentRunHistory.lowStock.status = 'running';
  agentRunHistory.lowStock.lastRun = new Date();

  try {
    const users = await getAllStoreUsers();
    
    for (const user of users) {
      const threshold = user.alertThreshold || 10;
      const lowStockProducts = await Product.find({
        businessId: user._id,
        stockQuantity: { $lte: threshold },
      });

      if (lowStockProducts.length > 0 && user.alertEnabled) {
        console.log(`  📦 Found ${lowStockProducts.length} low-stock items for ${user.name}`);
        
        // Send alerts automatically
        try {
          await sendAlerts(user, lowStockProducts);
        } catch (err) {
          console.error(`  ❌ Alert failed for ${user.name}:`, err.message);
        }
      }
    }

    agentRunHistory.lowStock.status = 'completed';
    console.log('✅ [Auto-Agent] Low Stock Monitor completed');
  } catch (error) {
    console.error('❌ [Auto-Agent] Low Stock Monitor failed:', error);
    agentRunHistory.lowStock.status = 'failed';
  }
}, {
  scheduled: false, // Don't start immediately
  timezone: "Asia/Kolkata"
});

// 2. PREDICTION AGENT - Runs daily at midnight
const predictionAgent = cron.schedule('0 0 * * *', async () => {
  console.log('🤖 [Auto-Agent] Prediction Agent started...');
  agentRunHistory.prediction.status = 'running';
  agentRunHistory.prediction.lastRun = new Date();

  try {
    const users = await getAllStoreUsers();
    
    for (const user of users) {
      const products = await Product.find({ businessId: user._id }).limit(50);
      const sales = await Sale.find({ businessId: user._id })
        .sort({ date: -1 })
        .limit(100);

      if (products.length > 0 && sales.length > 5 && process.env.GEMINI_API_KEY) {
        const prompt = `Analyze sales trends for store "${user.storeName || user.name}" and predict demand for next 7 days. 
Products: ${products.slice(0, 10).map(p => `${p.name}(stock:${p.stockQuantity})`).join(', ')}
Recent sales: ${sales.slice(0, 20).length} transactions
Provide brief bullet-point forecast of which products will need restocking.`;
        
        try {
          const result = await callGemini(prompt);
          console.log(`  🔮 Prediction generated for ${user.name}`);
          agentRunHistory.prediction.lastResult = { user: user.name, result: result.substring(0, 200) };
        } catch (err) {
          console.error(`  ❌ Prediction failed for ${user.name}:`, err.message);
        }
      }
    }

    agentRunHistory.prediction.status = 'completed';
    console.log('✅ [Auto-Agent] Prediction Agent completed');
  } catch (error) {
    console.error('❌ [Auto-Agent] Prediction Agent failed:', error);
    agentRunHistory.prediction.status = 'failed';
  }
}, {
  scheduled: false,
  timezone: "Asia/Kolkata"
});

// 3. DECISION AGENT - Runs daily at 6 AM
const decisionAgent = cron.schedule('0 6 * * *', async () => {
  console.log('🤖 [Auto-Agent] Decision Agent started...');
  agentRunHistory.decision.status = 'running';
  agentRunHistory.decision.lastRun = new Date();

  try {
    const users = await getAllStoreUsers();
    
    for (const user of users) {
      const threshold = user.alertThreshold || 10;
      const lowStockProducts = await Product.find({
        businessId: user._id,
        stockQuantity: { $lte: threshold * 2 },
      }).limit(20);

      if (lowStockProducts.length > 0 && process.env.GEMINI_API_KEY) {
        const prompt = `Review inventory for store "${user.storeName || user.name}" and recommend which products to reorder.
Low stock products: ${lowStockProducts.map(p => `${p.name}(qty:${p.stockQuantity},price:₹${p.price})`).join(', ')}
Provide brief reorder recommendations with quantities.`;
        
        try {
          const result = await callGemini(prompt);
          console.log(`  ⚖️ Reorder recommendations for ${user.name}`);
          agentRunHistory.decision.lastResult = { user: user.name, result: result.substring(0, 200) };
        } catch (err) {
          console.error(`  ❌ Decision failed for ${user.name}:`, err.message);
        }
      }
    }

    agentRunHistory.decision.status = 'completed';
    console.log('✅ [Auto-Agent] Decision Agent completed');
  } catch (error) {
    console.error('❌ [Auto-Agent] Decision Agent failed:', error);
    agentRunHistory.decision.status = 'failed';
  }
}, {
  scheduled: false,
  timezone: "Asia/Kolkata"
});

// 4. NOTIFICATION AGENT - Runs every 6 hours
const notificationAgent = cron.schedule('0 */6 * * *', async () => {
  console.log('🤖 [Auto-Agent] Notification Agent started...');
  agentRunHistory.notification.status = 'running';
  agentRunHistory.notification.lastRun = new Date();

  try {
    const users = await getAllStoreUsers();
    
    for (const user of users) {
      const threshold = user.alertThreshold || 10;
      const criticalProducts = await Product.find({
        businessId: user._id,
        stockQuantity: { $lte: threshold },
      }).limit(10);

      if (criticalProducts.length > 0 && process.env.GEMINI_API_KEY) {
        const prompt = `Summarize critical inventory alerts for store "${user.storeName || user.name}".
Critical products: ${criticalProducts.map(p => `${p.name}(qty:${p.stockQuantity})`).join(', ')}
Provide brief alert summary.`;
        
        try {
          const result = await callGemini(prompt);
          console.log(`  📱 Notification summary for ${user.name}`);
          agentRunHistory.notification.lastResult = { user: user.name, result: result.substring(0, 200) };
        } catch (err) {
          console.error(`  ❌ Notification failed for ${user.name}:`, err.message);
        }
      }
    }

    agentRunHistory.notification.status = 'completed';
    console.log('✅ [Auto-Agent] Notification Agent completed');
  } catch (error) {
    console.error('❌ [Auto-Agent] Notification Agent failed:', error);
    agentRunHistory.notification.status = 'failed';
  }
}, {
  scheduled: false,
  timezone: "Asia/Kolkata"
});

// Start all scheduled agents
function startAutomaticAgents() {
  console.log('🚀 Starting automatic background agents...');
  console.log('   📊 Low Stock Monitor: Every hour');
  console.log('   🔮 Prediction Agent: Daily at 12:00 AM');
  console.log('   ⚖️ Decision Agent: Daily at 6:00 AM');
  console.log('   📱 Notification Agent: Every 6 hours');
  
  lowStockMonitor.start();
  predictionAgent.start();
  decisionAgent.start();
  notificationAgent.start();

  // Update next run times
  updateNextRunTimes();
}

// Stop all scheduled agents
function stopAutomaticAgents() {
  console.log('🛑 Stopping automatic background agents...');
  lowStockMonitor.stop();
  predictionAgent.stop();
  decisionAgent.stop();
  notificationAgent.stop();
}

// Update next run times for display
function updateNextRunTimes() {
  const now = new Date();
  
  // Low Stock: next hour
  const nextHour = new Date(now);
  nextHour.setHours(nextHour.getHours() + 1);
  nextHour.setMinutes(0);
  nextHour.setSeconds(0);
  agentRunHistory.lowStock.nextRun = nextHour;

  // Prediction: next midnight
  const nextMidnight = new Date(now);
  nextMidnight.setDate(nextMidnight.getDate() + 1);
  nextMidnight.setHours(0, 0, 0, 0);
  agentRunHistory.prediction.nextRun = nextMidnight;

  // Decision: next 6 AM
  const next6AM = new Date(now);
  if (now.getHours() >= 6) {
    next6AM.setDate(next6AM.getDate() + 1);
  }
  next6AM.setHours(6, 0, 0, 0);
  agentRunHistory.decision.nextRun = next6AM;

  // Notification: next 6 hour interval
  const next6Hours = new Date(now);
  next6Hours.setHours(Math.ceil(now.getHours() / 6) * 6, 0, 0, 0);
  if (next6Hours <= now) {
    next6Hours.setHours(next6Hours.getHours() + 6);
  }
  agentRunHistory.notification.nextRun = next6Hours;
}

// Get agent status for dashboard
function getAgentStatus() {
  updateNextRunTimes();
  return agentRunHistory;
}

module.exports = {
  startAutomaticAgents,
  stopAutomaticAgents,
  getAgentStatus,
};
