const express = require('express');
const router  = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.get('/ai-suggestions', protect, orderController.getAISuggestions);
router.get('/',               protect, orderController.getOrders);
router.post('/',              protect, orderController.createOrder);
router.put('/:id',            protect, orderController.updateOrder);
router.delete('/:id',         protect, orderController.deleteOrder);

module.exports = router;
