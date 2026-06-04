const express = require('express');
const router = express.Router();
const agents = require('../controllers/agentsController');
const { protect, resolveStoreContext } = require('../middleware/authMiddleware');
const { getAgentStatus } = require('../services/agentScheduler');

const guard = [protect, resolveStoreContext];

router.post('/data',         guard, agents.dataAgent);
router.post('/sales',        guard, agents.salesAgent);
router.post('/prediction',   guard, agents.predictionAgent);
router.post('/decision-ai',  guard, agents.decisionAgent);
router.post('/order',        guard, agents.orderAgent);
router.post('/automation',   guard, agents.automationAgent);
router.post('/notification', guard, agents.notificationAgent);
router.post('/profit',       guard, agents.profitAgent);
router.post('/voice',        guard, agents.voiceAgent);

// Get automatic agent status
router.get('/status', protect, (req, res) => {
  try {
    const status = getAgentStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get agent status', error: error.message });
  }
});

module.exports = router;
