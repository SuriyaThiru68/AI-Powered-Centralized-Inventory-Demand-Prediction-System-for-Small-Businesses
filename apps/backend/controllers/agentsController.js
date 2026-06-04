/**
 * 9 specialised AI agents — each builds a focused system context and queries Gemini.
 * Shared helper: runAgent(req, res, agentName, systemContextFn)
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const Order = require('../models/Order');

// ─── Gemini helper ────────────────────────────────────────────────────────────
let _genAI = null;
function getGenAI() {
  if (!_genAI && process.env.GEMINI_API_KEY) {
    _genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return _genAI;
}

const FALLBACK_MODELS = () => {
  const primary = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';
  return [...new Set([primary, 'gemini-2.5-flash-lite', 'gemini-flash-lite-latest', 'gemini-2.5-flash'])];
};

async function callGemini(prompt) {
  const genAI = getGenAI();
  if (!genAI) throw new Error('No GEMINI_API_KEY configured');

  for (const modelName of FALLBACK_MODELS()) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result?.response?.text?.();
      if (text?.trim()) return text.trim();
    } catch (err) {
      const is429 = err.message?.includes('429') || err.message?.includes('quota');
      if (!is429) throw err;
      // quota → try next model
    }
  }
  throw new Error('All Gemini models exhausted quota. Try again later.');
}

// ─── Shared store context loader ─────────────────────────────────────────────
async function loadStoreContext(storeId) {
  const [products, sales, orders] = await Promise.all([
    Product.find({ storeId }).limit(80).lean(),
    Sale.find({ storeId }).sort({ createdAt: -1 }).limit(50).lean(),
    Order.find({ storeId }).sort({ createdAt: -1 }).limit(30).lean(),
  ]);

  const lowStock = products.filter((p) => p.quantity < 20);
  const outOfStock = products.filter((p) => p.quantity === 0);
  const topProducts = [...products].sort((a, b) => (b.sold || 0) - (a.sold || 0)).slice(0, 10);
  const totalRevenue = sales.reduce((s, sale) => s + (sale.totalAmount || 0), 0);
  const totalSold = sales.reduce((s, sale) => s + (sale.quantitySold || 0), 0);

  // Category breakdown
  const catRevenue = sales.reduce((acc, sale) => {
    const prod = products.find((p) => String(p._id) === String(sale.productId));
    const cat = prod?.category || 'Uncategorised';
    acc[cat] = (acc[cat] || 0) + (sale.totalAmount || 0);
    return acc;
  }, {});

  return { products, sales, orders, lowStock, outOfStock, topProducts, totalRevenue, totalSold, catRevenue };
}

function storeContextBlock(ctx, storeName) {
  return `
STORE: ${storeName}
TOTAL PRODUCTS: ${ctx.products.length}
TOTAL REVENUE (recent ${ctx.sales.length} sales): ₹${ctx.totalRevenue.toFixed(0)}
TOTAL UNITS SOLD: ${ctx.totalSold}
LOW STOCK (<20): ${ctx.lowStock.map((p) => `${p.name}(${p.quantity})`).join(', ') || 'None'}
OUT OF STOCK: ${ctx.outOfStock.map((p) => p.name).join(', ') || 'None'}
TOP SELLERS: ${ctx.topProducts.map((p) => `${p.name}(sold:${p.sold || 0})`).join(', ') || 'N/A'}
CATEGORIES BY REVENUE: ${Object.entries(ctx.catRevenue).map(([k, v]) => `${k}:₹${Math.round(v)}`).join(', ') || 'N/A'}
RECENT ORDERS: ${ctx.orders.length} orders, statuses: ${[...new Set(ctx.orders.map((o) => o.status))].join(', ') || 'N/A'}
  `.trim();
}

async function runAgent(req, res, agentRole, buildSystemContext) {
  const { message } = req.body;
  if (!message?.trim()) return res.status(400).json({ success: false, message: 'Message is required' });

  try {
    const storeName = req.user.storeName || req.user.name;
    const ctx = await loadStoreContext(req.storeId);
    const systemContext = buildSystemContext(ctx, storeName);

    const reply = await callGemini(`${systemContext}\n\nUSER: ${message}`);
    return res.json({ success: true, reply, provider: 'gemini', agent: agentRole });
  } catch (error) {
    console.error(`[${agentRole}] error:`, error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
}

// ─── 1. Data Agent ────────────────────────────────────────────────────────────
exports.dataAgent = (req, res) =>
  runAgent(req, res, 'data', (ctx, storeName) => `
You are the Data Agent for CommerceOS — an expert at analysing product catalog quality, data gaps, and inconsistencies.
${storeContextBlock(ctx, storeName)}

FULL CATALOG SAMPLE:
${ctx.products.slice(0, 20).map((p) => `• ${p.name} | SKU:${p.sku || '?'} | qty:${p.quantity} | price:₹${p.price} | cat:${p.category || '?'}`).join('\n')}

Your role: identify data quality issues (missing SKUs, zero prices, duplicate names, missing categories), suggest improvements, and summarise catalog health.
Be concise, use bullet points, use ₹ for currency.`.trim());

// ─── 2. Sales Agent ───────────────────────────────────────────────────────────
exports.salesAgent = (req, res) =>
  runAgent(req, res, 'sales', (ctx, storeName) => `
You are the Sales Agent for CommerceOS — an expert at interpreting sales data, spotting trends, and identifying revenue opportunities.
${storeContextBlock(ctx, storeName)}

RECENT SALES (last ${Math.min(ctx.sales.length, 20)}):
${ctx.sales.slice(0, 20).map((s) => `• ${s.productName} | qty:${s.quantitySold} | ₹${s.totalAmount} | ${new Date(s.createdAt).toLocaleDateString()}`).join('\n') || 'No sales yet.'}

Your role: analyse trends, identify best/worst performers, highlight revenue opportunities, and give actionable advice.
Be concise, use bullet points, use ₹ for currency.`.trim());

// ─── 3. Prediction Agent ──────────────────────────────────────────────────────
exports.predictionAgent = (req, res) =>
  runAgent(req, res, 'prediction', (ctx, storeName) => `
You are the Prediction Agent for CommerceOS — you forecast demand using historical sales velocity and inventory patterns.
${storeContextBlock(ctx, storeName)}

PRODUCT VELOCITY DATA:
${ctx.products.slice(0, 20).map((p) => {
  const prodSales = ctx.sales.filter((s) => String(s.productId) === String(p._id));
  const totalQtySold = prodSales.reduce((a, s) => a + (s.quantitySold || 0), 0);
  const days = prodSales.length > 0 ? Math.max(1, (Date.now() - new Date(prodSales[prodSales.length - 1].createdAt)) / 86400000) : 1;
  const dailyVelocity = (totalQtySold / days).toFixed(2);
  return `• ${p.name} | stock:${p.quantity} | sold:${totalQtySold} | velocity:${dailyVelocity}/day | days_of_stock:${dailyVelocity > 0 ? Math.floor(p.quantity / dailyVelocity) : '∞'}`;
}).join('\n') || 'No products.'}

Your role: forecast demand for the next 30 days, identify stockout risks, and recommend safety stock levels.
Be concise, use bullet points, use ₹ for currency.`.trim());

// ─── 4. Decision Agent (AI version) ──────────────────────────────────────────
exports.decisionAgent = (req, res) =>
  runAgent(req, res, 'decision', (ctx, storeName) => `
You are the Decision Agent for CommerceOS — you make intelligent reorder, pricing, and inventory management decisions.
${storeContextBlock(ctx, storeName)}

REORDER CANDIDATES:
${ctx.lowStock.map((p) => `• ${p.name} | current:${p.quantity} | sold:${p.sold || 0} | price:₹${p.price}`).join('\n') || 'None at this time.'}

Your role: recommend specific reorder quantities for each low-stock product, suggest which products to discontinue, and flag pricing opportunities. Prioritise by urgency.
Be concise, use bullet points, use ₹ for currency.`.trim());

// ─── 5. Order Agent ───────────────────────────────────────────────────────────
exports.orderAgent = (req, res) =>
  runAgent(req, res, 'order', (ctx, storeName) => `
You are the Order Agent for CommerceOS — you help create, review, and optimise purchase orders.
${storeContextBlock(ctx, storeName)}

EXISTING ORDERS:
${ctx.orders.slice(0, 10).map((o) => `• PO:${o.poNumber || 'N/A'} | ${o.productName} | qty:${o.quantity} | ₹${o.totalAmount} | status:${o.status}`).join('\n') || 'No orders yet.'}

Your role: suggest new purchase orders for low-stock items, review existing order statuses, and recommend order consolidation where possible.
Be concise, use bullet points, use ₹ for currency.`.trim());

// ─── 6. Automation Agent ──────────────────────────────────────────────────────
exports.automationAgent = (req, res) =>
  runAgent(req, res, 'automation', (ctx, storeName) => `
You are the Automation Agent for CommerceOS — you design workflow automations for inventory management.
${storeContextBlock(ctx, storeName)}

Your role: suggest specific automation rules (e.g. "auto-reorder when qty < 10", "weekly low-stock digest", "price alert when competitor drops"), explain the business value of each, and prioritise by ROI.
Be concise, practical, and actionable.`.trim());

// ─── 7. Notification Agent ────────────────────────────────────────────────────
exports.notificationAgent = (req, res) =>
  runAgent(req, res, 'notification', (ctx, storeName) => `
You are the Notification Agent for CommerceOS — you manage alerts and notifications for inventory events.
${storeContextBlock(ctx, storeName)}

Your role: summarise current alerts that the store owner should know about, recommend notification thresholds, and draft alert message templates they could send to their team.
Be concise, use bullet points, prioritise critical alerts first.`.trim());

// ─── 8. Profit Agent ──────────────────────────────────────────────────────────
exports.profitAgent = (req, res) =>
  runAgent(req, res, 'profit', (ctx, storeName) => `
You are the Profit Agent for CommerceOS — you track margins, identify profit leaks, and optimise pricing strategy.
${storeContextBlock(ctx, storeName)}

MARGIN SNAPSHOT:
${ctx.products.slice(0, 20).map((p) => {
  const revenue = ctx.sales.filter((s) => String(s.productId) === String(p._id)).reduce((a, s) => a + (s.totalAmount || 0), 0);
  return `• ${p.name} | price:₹${p.price} | qty_sold:${p.sold || 0} | revenue:₹${revenue.toFixed(0)}`;
}).join('\n') || 'No products.'}

Your role: identify highest and lowest margin products, suggest pricing adjustments, flag slow-moving high-cost inventory, and recommend bundle or discount strategies.
Be concise, use bullet points, use ₹ for currency.`.trim());

// ─── 9. Voice Agent ───────────────────────────────────────────────────────────
exports.voiceAgent = (req, res) =>
  runAgent(req, res, 'voice', (ctx, storeName) => `
You are the Voice Agent for CommerceOS — a conversational assistant that can answer any question about the store in natural, friendly language.
${storeContextBlock(ctx, storeName)}

You have full visibility into products, sales, orders, and inventory. Answer questions naturally and completely. Use ₹ for currency. Be helpful, clear, and concise.`.trim());
