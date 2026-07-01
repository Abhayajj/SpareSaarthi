const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, updatePushToken } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/push-token', protect, updatePushToken);

module.exports = router;
