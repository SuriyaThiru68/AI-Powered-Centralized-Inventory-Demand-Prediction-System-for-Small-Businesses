const Sale    = require('../models/Sale');
const Product = require('../models/Product');

// ── POST /api/sales — record a sale, reduce stock ────────────────────────────
exports.recordSale = async (req, res) => {
  try {
    const { productId, quantitySold } = req.body;

    const product = await Product.findOne({ _id: productId, storeId: req.user._id });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    if (product.quantity < quantitySold) {
      return res.status(400).json({ success: false, message: 'Insufficient stock available.' });
    }

    product.quantity -= quantitySold;
    product.sold = (product.sold || 0) + quantitySold;
    await product.save();

    const price = typeof product.price === 'number' ? product.price : 0;
    const newSale = await Sale.create({
      storeId:     req.user._id,
      productId,
      productName: product.name,
      quantitySold,
      totalAmount:  quantitySold * price,
    });

    res.status(201).json({ success: true, message: 'Sale processed & stock updated', sale: newSale });
  } catch (error) {
    console.error('Error processing sale:', error);
    res.status(500).json({ success: false, message: 'Server error during sale processing' });
  }
};

// ── GET /api/sales — sales list for store ─────────────────────────────────────
exports.getSales = async (req, res) => {
  try {
    const sales = await Sale.find({ storeId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: sales });
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ success: false, message: 'Server error fetching sales' });
  }
};

// ── GET /api/sales/analytics — revenue by day for charts ─────────────────────
exports.getAnalytics = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    // Daily revenue aggregation
    const dailyRevenue = await Sale.aggregate([
      { $match: { storeId: req.user._id, createdAt: { $gte: since } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          revenue:  { $sum: '$totalAmount' },
          unitsSold: { $sum: '$quantitySold' },
          txCount:  { $sum: 1 },
        }
      },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', revenue: 1, unitsSold: 1, txCount: 1, _id: 0 } },
    ]);

    // Category breakdown
    const categoryBreakdown = await Product.aggregate([
      { $match: { storeId: req.user._id } },
      {
        $group: {
          _id:      '$category',
          sold:     { $sum: '$sold' },
          revenue:  { $sum: { $multiply: ['$price', '$sold'] } },
          skuCount: { $sum: 1 },
        }
      },
      { $sort: { revenue: -1 } },
      { $project: { category: '$_id', sold: 1, revenue: 1, skuCount: 1, _id: 0 } },
    ]);

    // Top products by revenue
    const topProducts = await Product.find({ storeId: req.user._id })
      .sort({ sold: -1 })
      .limit(5)
      .select('name sold price category quantity');

    // Summary totals
    const totalRevenue = dailyRevenue.reduce((s, d) => s + d.revenue, 0);
    const totalUnitsSold = dailyRevenue.reduce((s, d) => s + d.unitsSold, 0);

    res.json({
      success: true,
      data: {
        dailyRevenue,
        categoryBreakdown,
        topProducts,
        summary: { totalRevenue, totalUnitsSold, days },
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: 'Error generating analytics' });
  }
};
