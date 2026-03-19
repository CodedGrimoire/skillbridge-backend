const express = require('express');
const { generateRoadmap, analyzeRoadmap, listPlans, upsertPlan, deletePlan } = require('../controllers/roadmap.controller');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Optionally protect; keep light weight. Auth ensures role-specific data stays scoped.
router.post('/generate', authenticateToken, generateRoadmap);
router.post('/analyze', authenticateToken, analyzeRoadmap);
router.get('/plans', authenticateToken, listPlans);
router.post('/plans', authenticateToken, upsertPlan);
router.delete('/plans/:id', authenticateToken, deletePlan);

module.exports = router;
