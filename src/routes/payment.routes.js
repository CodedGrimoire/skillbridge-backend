const express = require('express');
const { createSession, verifySession } = require('../controllers/payment.controller');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create-checkout-session', authenticateToken, createSession);
router.get('/verify', authenticateToken, verifySession);

module.exports = router;
