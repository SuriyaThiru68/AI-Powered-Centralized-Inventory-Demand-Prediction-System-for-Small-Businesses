const express = require('express');
const router  = express.Router();
const { protect, resolveStoreContext } = require('../middleware/authMiddleware');
const alert   = require('../controllers/alertController');

router.get ('/settings', protect,                         alert.getAlertSettings);
router.put ('/settings', protect,                         alert.saveAlertSettings);
router.post('/send',     protect, resolveStoreContext,    alert.sendStockAlerts);
router.post('/test',     protect,                         alert.sendTestAlert);

module.exports = router;
