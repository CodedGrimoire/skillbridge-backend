const router = require('express').Router();
const { runAnalysis, getHistory } = require('../controllers/analysisController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/run', authenticateToken, runAnalysis);
router.get('/history', authenticateToken, getHistory);

module.exports = router;
