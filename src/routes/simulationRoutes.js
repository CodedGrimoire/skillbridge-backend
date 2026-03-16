const router = require('express').Router();
const { runSimulation } = require('../controllers/simulationController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/run', authenticateToken, runSimulation);

module.exports = router;
