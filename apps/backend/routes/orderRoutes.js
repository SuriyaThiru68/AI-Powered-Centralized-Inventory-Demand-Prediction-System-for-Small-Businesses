const express = require('express');
const router  = express.Router();
const orderController = require('../controllers/orderController');
const { protect, resolveStoreContext } = require('../middleware/authMiddleware');

router.get('/ai-suggestions', protect, resolveStoreContext, orderController.getAISuggestions);
router.get('/', protect, resolveStoreContext, orderController.getOrders);
router.post('/', protect, resolveStoreContext, orderController.createOrder);
router.put('/:id', protect, resolveStoreContext, orderController.updateOrder);
router.delete('/:id', protect, resolveStoreContext, orderController.deleteOrder);

module.exports = router;
