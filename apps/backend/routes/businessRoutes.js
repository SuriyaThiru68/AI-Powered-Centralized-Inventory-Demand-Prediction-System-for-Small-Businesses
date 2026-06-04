const express = require('express');
const router = express.Router();
const businessController = require('../controllers/businessController');
const { protect, businessAdminOnly, superAdminOnly } = require('../middleware/authMiddleware');

router.post('/', protect, businessController.createBusiness);
router.get('/me', protect, businessController.getMyBusiness);
router.get('/', protect, superAdminOnly, businessController.listAllBusinesses);

module.exports = router;
