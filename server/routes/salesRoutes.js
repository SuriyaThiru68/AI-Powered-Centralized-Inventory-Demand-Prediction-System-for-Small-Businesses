const express = require('express');
const router  = express.Router();
const salesController = require('../controllers/salesController');
const { protect } = require('../middleware/authMiddleware');

// Both read and write require a logged-in user
router.get('/analytics', protect, salesController.getAnalytics);
router.post('/', protect, salesController.recordSale);
router.get('/',  protect, salesController.getSales);

module.exports = router;
