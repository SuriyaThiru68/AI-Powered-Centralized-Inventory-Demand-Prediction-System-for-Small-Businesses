const Order = require('../models/Order');
const Product = require('../models/Product');

// Generate unique PO number: PO-YYYYMMDD-XXXX
const genPO = () => {
  const d = new Date();
  const date = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `PO-${date}-${rand}`;
};

// ── GET /api/orders — all orders for store ────────────────────────────────────
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ storeId: req.user._id }).sort({ createdAt: -1 });

    const stats = {
      total:     orders.length,
      draft:     orders.filter(o => o.status === 'Draft').length,
      inTransit: orders.filter(o => o.status === 'In Transit' || o.status === 'Arriving Today').length,
      received:  orders.filter(o => o.status === 'Received').length,
    };

    res.json({ success: true, data: orders, stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error fetching orders' });
  }
};

// ── POST /api/orders — create a new PO ───────────────────────────────────────
exports.createOrder = async (req, res) => {
  try {
    const { supplier, productName, quantity, unitPrice, expectedDate, notes } = req.body;

    if (!supplier || !productName || !quantity) {
      return res.status(400).json({ success: false, message: 'supplier, productName and quantity are required' });
    }

    const order = await Order.create({
      storeId:    req.user._id,
      poNumber:   genPO(),
      supplier,
      productName,
      quantity,
      unitPrice:   unitPrice   || 0,
      totalAmount: (unitPrice || 0) * quantity,
      expectedDate,
      notes,
    });

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error creating order' });
  }
};

// ── PUT /api/orders/:id — update status or details ───────────────────────────
exports.updateOrder = async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, storeId: req.user._id },
      req.body,
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // If received, increase product stock
    if (req.body.status === 'Received') {
      const product = await Product.findOne({ name: order.productName, storeId: req.user._id });
      if (product) {
        product.quantity += order.quantity;
        await product.save();
      }
    }

    res.json({ success: true, data: order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error updating order' });
  }
};

// ── DELETE /api/orders/:id ────────────────────────────────────────────────────
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findOneAndDelete({ _id: req.params.id, storeId: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, message: 'Order deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error deleting order' });
  }
};

// ── GET /api/orders/ai-suggestions — reorder suggestions from low stock ───────
exports.getAISuggestions = async (req, res) => {
  try {
    const products = await Product.find({ storeId: req.user._id, quantity: { $lt: 20 } }).sort({ quantity: 1 }).limit(10);
    const suggestions = products.map(p => ({
      productId:   p._id,
      productName: p.name,
      currentStock: p.quantity,
      suggestedQty: Math.max(50, Math.ceil((p.sold || 10) * 1.5)),
      reason:      `Stock critically low (${p.quantity} units). Based on sales velocity.`,
    }));
    res.json({ success: true, data: suggestions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error generating suggestions' });
  }
};
