const express = require('express');
const router  = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public
router.post('/register', authController.registerUser);
router.post('/login',    authController.loginUser);

// Protected — Settings page
router.get('/profile',  protect, authController.getProfile);
router.put('/profile',  protect, authController.updateProfile);

module.exports = router;
