const { GoogleGenerativeAI } = require('@google/generative-ai');
const Product = require('../models/Product');
const Sale    = require('../models/Sale');

// Initialise Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// ── POST /api/agent/chat — conversational AI with inventory context ────────────
exports.chat = async (req, res) => {
  const { message } = req.body;
  if (!message?.trim()) {
    return res.status(400).json({ success: false, message: 'Message is required' });
  }

  try {
    // Build live store context to inject into the prompt
    const products = await Product.find({ storeId: req.user._id }).limit(50);
    const sales    = await Sale.find({ storeId: req.user._id }).sort({ createdAt: -1 }).limit(20);

    const lowStock    = products.filter(p => p.quantity < 20);
    const topProducts = [...products].sort((a, b) => (b.sold || 0) - (a.sold || 0)).slice(0, 5);
    const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);

    const systemContext = `
You are InventoryOS Neural Core — a smart, concise supply chain AI assistant for a small business owner.
You have access to their LIVE store data:

STORE: ${req.user.name}'s Store
TOTAL PRODUCTS: ${products.length}
TOTAL REVENUE (recent): ₹${totalRevenue.toFixed(0)}
LOW STOCK ITEMS (qty < 20): ${lowStock.map(p => `${p.name} (${p.quantity} left)`).join(', ') || 'None'}
TOP SELLING PRODUCTS: ${topProducts.map(p => `${p.name} (${p.sold || 0} sold)`).join(', ') || 'N/A'}

Answer the user's question using this context. Be concise, actionable, and use ₹ for currency.
If asked about something outside inventory/sales, politely redirect.
    `.trim();

    if (!process.env.GEMINI_API_KEY) {
      // Graceful fallback if no API key is configured
      return res.json({
        success: true,
        reply: `⚠️ Gemini API key not configured. Add GEMINI_API_KEY to server/.env to enable real AI responses.\n\nYour store snapshot: ${products.length} products, ${lowStock.length} low-stock items, ₹${totalRevenue.toFixed(0)} recent revenue.`,
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(`${systemContext}\n\nUSER: ${message}`);
    const reply  = result.response.text();

    res.json({ success: true, reply });
  } catch (error) {
    console.error('Gemini error:', error.message);
    res.status(500).json({ success: false, message: 'AI service error — ' + error.message });
  }
};

// ── GET /api/agent/predict/:productId — demand prediction ────────────────────
exports.predictDemand = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.productId, storeId: req.user._id });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const baseDemand     = (product.sold || 0) * 1.35;
    const predictedDemand = Math.floor(baseDemand > 0 ? baseDemand : 15 + Math.random() * 20);

    res.json({ success: true, productName: product.name, currentStock: product.quantity, predictedDemand });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error running prediction agent' });
  }
};

// ── GET /api/agent/decision — reorder decision engine ────────────────────────
exports.runDecisionEngine = async (req, res) => {
  try {
    const products  = await Product.find({ storeId: req.user._id });
    const suggestions = [];

    for (const p of products) {
      const predictedDemand = Math.floor((p.sold || 0) * 1.2 + 10);
      if (predictedDemand > p.quantity) {
        suggestions.push({
          productId:       p._id,
          productName:     p.name,
          currentStock:    p.quantity,
          predictedDemand,
          action:          'REORDER',
          reorderQuantity: predictedDemand - p.quantity,
        });
      }
    }

    res.json({ success: true, message: 'Decision engine ran successfully', suggestions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error running decision agent' });
  }
};
