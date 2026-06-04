const express = require('express');
const router  = express.Router();
const agentController = require('../controllers/agentController');
const { protect } = require('../middleware/authMiddleware');

// Real Gemini AI chat endpoint
router.post('/chat',                 protect, agentController.chat);

// Demand prediction and decision engine
router.get('/predict/:productId',    protect, agentController.predictDemand);
router.get('/decision',              protect, agentController.runDecisionEngine);

module.exports = router;
