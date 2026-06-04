const Product = require('../models/Product');
const User = require('../models/User');
const { sendAlerts } = require('../services/alertService');

/**
 * POST /api/alerts/send
 * Scans store for low/out-of-stock products and sends configured alerts.
 * Body: { threshold? } — default threshold is 20
 */
exports.sendStockAlerts = async (req, res) => {
  try {
    const threshold = parseInt(req.body.threshold ?? 20);
    
    // Debug logging
    console.log('[Alert] sendStockAlerts called:', {
      storeId: req.storeId,
      userId: req.user?._id,
      threshold
    });
    
    const products  = await Product.find({ storeId: req.storeId }).lean();
    
    console.log('[Alert] Found products:', products.length);
    
    const alerts    = products.filter((p) => (p.quantity || 0) <= threshold);

    if (alerts.length === 0) {
      return res.json({ success: true, message: 'All stock levels are healthy — no alerts sent.', alertsSent: 0 });
    }

    const storeName   = req.user.storeName || req.user.name;
    const alertSettings = {
      emailTo:    req.user.alertEmail    || req.user.email,
      whatsappTo: req.user.alertWhatsapp || null,
    };
    
    console.log('[Alert] Sending alerts:', { storeName, alertSettings, alertCount: alerts.length });

    const results = await sendAlerts({ storeName, alerts, alertSettings });

    return res.json({
      success: true,
      message: `Alerts sent for ${alerts.length} product(s).`,
      alertsSent: alerts.length,
      channels: results,
      products: alerts.map((p) => ({ name: p.name, sku: p.sku, quantity: p.quantity })),
    });
  } catch (err) {
    console.error('[Alert] sendStockAlerts error:', err);
    res.status(500).json({ success: false, message: err.message, stack: err.stack });
  }
};

/**
 * POST /api/alerts/test
 * Sends a test alert to verify configuration.
 */
exports.sendTestAlert = async (req, res) => {
  try {
    const { channel = 'email' } = req.body;
    const storeName = req.user.storeName || req.user.name;
    const alertSettings = {
      emailTo:    channel === 'email'    ? (req.user.alertEmail || req.user.email) : null,
      whatsappTo: channel === 'whatsapp' ? req.user.alertWhatsapp : null,
    };

    const testAlerts = [
      { name: 'Test Product A', sku: 'TEST-001', quantity: 5 },
      { name: 'Test Product B', sku: 'TEST-002', quantity: 0 },
    ];

    const results = await sendAlerts({ storeName, alerts: testAlerts, alertSettings });

    return res.json({ success: true, message: 'Test alert sent.', channels: results });
  } catch (err) {
    console.error('[Alert] sendTestAlert error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUT /api/alerts/settings
 * Save alert preferences (email address, WhatsApp number, threshold) to user profile.
 */
exports.saveAlertSettings = async (req, res) => {
  try {
    const { alertEmail, alertWhatsapp, alertThreshold, alertEnabled } = req.body;
    const updates = {};
    if (alertEmail    !== undefined) updates.alertEmail    = alertEmail;
    if (alertWhatsapp !== undefined) updates.alertWhatsapp = alertWhatsapp;
    if (alertThreshold !== undefined) updates.alertThreshold = parseInt(alertThreshold);
    if (alertEnabled  !== undefined) updates.alertEnabled  = alertEnabled;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    return res.json({ success: true, message: 'Alert settings saved.', user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/alerts/settings
 * Fetch current alert settings for the logged-in user.
 */
exports.getAlertSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('alertEmail alertWhatsapp alertThreshold alertEnabled email');
    return res.json({
      success: true,
      settings: {
        alertEmail:     user.alertEmail     || user.email || '',
        alertWhatsapp:  user.alertWhatsapp  || '',
        alertThreshold: user.alertThreshold ?? 20,
        alertEnabled:   user.alertEnabled   ?? true,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
