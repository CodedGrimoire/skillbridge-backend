const router = require('express').Router();
const {
  getUserProfile,
  getUserSkills,
  getUserAnalyses,
  getLatestAnalysis,
  getLearningResources,
} = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/authMiddleware');

// All dashboard routes require authentication
router.get('/profile', authenticateToken, getUserProfile);
router.get('/skills', authenticateToken, getUserSkills);
router.get('/analyses', authenticateToken, getUserAnalyses);
router.get('/latest-analysis', authenticateToken, getLatestAnalysis);
router.get('/resources', authenticateToken, getLearningResources);

module.exports = router;
