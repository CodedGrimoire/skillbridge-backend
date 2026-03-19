const express = require('express');
const { generateRoadmap, analyzeRoadmap } = require('../controllers/roadmap.controller');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Optionally protect; keep light weight. Auth ensures role-specific data stays scoped.
router.post('/generate', authenticateToken, generateRoadmap);
router.post('/analyze', authenticateToken, analyzeRoadmap);

module.exports = router;
