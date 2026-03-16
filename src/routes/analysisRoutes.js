const router = require('express').Router();
const { runAnalysis, getHistory } = require('../controllers/analysisController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/run', authenticate, runAnalysis);
router.get('/history', authenticate, getHistory);

module.exports = router;
