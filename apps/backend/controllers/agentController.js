const { GoogleGenerativeAI } = require('@google/generative-ai');
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const { generateInsight } = require('../services/aiService');

// Lazy — instantiated on first use so the key is always fresh from process.env
let _genAI = null;
function getGenAI() {
  if (!_genAI && process.env.GEMINI_API_KEY) {
    _genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return _genAI;
}

// Fallback chain — if the primary model hits quota, try the next one
// Built lazily so process.env is read after dotenv loads
function getGeminiFallbackModels() {
  const primary = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';
  return [...new Set([primary, 'gemini-2.5-flash-lite', 'gemini-flash-lite-latest', 'gemini-2.5-flash'])];
}

async function tryGemini(systemContext, message) {
  if (!process.env.GEMINI_API_KEY?.trim()) return null;
  const genAI = getGenAI();
  if (!genAI) return null;

  const tried = new Set();
  for (const modelName of getGeminiFallbackModels()) {
    if (tried.has(modelName)) continue;
    tried.add(modelName);
    try {
      console.log(`[AI] Trying Gemini model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(`${systemContext}\n\nUSER: ${message}`);
      const text = result?.response?.text?.();
      if (text?.trim()) {
        console.log(`[AI] Gemini responded via: ${modelName}`);
        return text.trim();
      }
    } catch (err) {
      const is429 = err.message?.includes('429') || err.message?.includes('quota');
      console.warn(`[AI] Gemini model ${modelName} failed (${is429 ? 'quota' : err.message?.slice(0, 60)})`);
      if (!is429) throw err; // non-quota errors bubble up
      // quota error → try next model in chain
    }
  }
  return null; // all models exhausted
}

exports.chat = async (req, res) => {
  const { message } = req.body;
  if (!message?.trim()) {
    return res.status(400).json({ success: false, message: 'Message is required' });
  }

  try {
    const storeId = req.storeId;
    const products = await Product.find({ storeId }).limit(50);
    const sales = await Sale.find({ storeId }).sort({ createdAt: -1 }).limit(20);

    const lowStock = products.filter((p) => p.quantity < 20);
    const topProducts = [...products].sort((a, b) => (b.sold || 0) - (a.sold || 0)).slice(0, 5);
    const totalRevenue = sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);

    const systemContext = `
You are CommerceOS AI — a smart eCommerce and inventory assistant.
LIVE store data:

STORE: ${req.user.storeName || req.user.name}'s Store
TOTAL PRODUCTS: ${products.length}
TOTAL REVENUE (recent): ₹${totalRevenue.toFixed(0)}
LOW STOCK (qty < 20): ${lowStock.map((p) => `${p.name} (${p.quantity} left)`).join(', ') || 'None'}
TOP SELLERS: ${topProducts.map((p) => `${p.name} (${p.sold || 0} sold)`).join(', ') || 'N/A'}

Be concise, actionable, use ₹ for currency.
    `.trim();

    // Prefer OpenAI when configured
    if (process.env.OPENAI_API_KEY?.trim()) {
      const result = await generateInsight({
        systemContext,
        message,
        context: {
          storeName: req.user.storeName || req.user.name,
          productCount: products.length,
          lowStockCount: lowStock.length,
          totalRevenue,
        },
      });
      return res.json({ success: true, reply: result.reply, provider: result.provider });
    }

    // Try Gemini, fall back to mock insight on failure
    if (process.env.GEMINI_API_KEY?.trim()) {
      try {
        const geminiReply = await tryGemini(systemContext, message);
        if (geminiReply) {
          return res.json({ success: true, reply: geminiReply, provider: 'gemini' });
        }
      } catch (geminiErr) {
        console.error('Gemini error (using fallback):', geminiErr.message);
      }
    }

    const result = await generateInsight({
      systemContext,
      message,
      context: {
        storeName: req.user.storeName || req.user.name,
        productCount: products.length,
        lowStockCount: lowStock.length,
        totalRevenue,
      },
    });

    return res.json({ success: true, reply: result.reply, provider: result.provider });
  } catch (error) {
    console.error('AI chat error:', error.message);
    res.status(500).json({ success: false, message: 'AI service error — ' + error.message });
  }
};

exports.predictDemand = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.productId, storeId: req.storeId });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const baseDemand = (product.sold || 0) * 1.35;
    const predictedDemand = Math.floor(baseDemand > 0 ? baseDemand : 15 + Math.random() * 20);

    res.json({
      success: true,
      productName: product.name,
      currentStock: product.quantity,
      predictedDemand,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error running prediction agent' });
  }
};

exports.runDecisionEngine = async (req, res) => {
  try {
    const products = await Product.find({ storeId: req.storeId });
    const suggestions = [];

    for (const p of products) {
      const predictedDemand = Math.floor((p.sold || 0) * 1.2 + 10);
      if (predictedDemand > p.quantity) {
        suggestions.push({
          productId: p._id,
          productName: p.name,
          currentStock: p.quantity,
          predictedDemand,
          action: 'REORDER',
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
