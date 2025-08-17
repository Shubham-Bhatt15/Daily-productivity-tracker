//authRoutes.js

const express = require('express');


const { registerUser, loginUser, getMe,validateToken } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

router.get('/validate-token', protect, validateToken); 

module.exports = router;