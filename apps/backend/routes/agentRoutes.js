const express = require('express');
const router  = express.Router();
const agentController = require('../controllers/agentController');
const { protect, resolveStoreContext } = require('../middleware/authMiddleware');

router.post('/chat', protect, resolveStoreContext, agentController.chat);
router.get('/predict/:productId', protect, resolveStoreContext, agentController.predictDemand);
router.get('/decision', protect, resolveStoreContext, agentController.runDecisionEngine);

module.exports = router;
