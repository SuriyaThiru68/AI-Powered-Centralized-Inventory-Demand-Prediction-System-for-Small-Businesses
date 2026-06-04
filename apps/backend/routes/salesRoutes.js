const express = require('express');
const router  = express.Router();
const salesController = require('../controllers/salesController');
const { protect, resolveStoreContext } = require('../middleware/authMiddleware');

router.get('/analytics', protect, resolveStoreContext, salesController.getAnalytics);
router.post('/', protect, resolveStoreContext, salesController.recordSale);
router.get('/', protect, resolveStoreContext, salesController.getSales);

module.exports = router;
