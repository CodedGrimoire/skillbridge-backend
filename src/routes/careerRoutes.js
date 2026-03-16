const router = require('express').Router();
const { skillRoi } = require('../controllers/careerController');
const { getCareerPathGraph } = require('../controllers/careerGraphController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/skill-roi', skillRoi);
router.get('/path/:roleId', authenticateToken, getCareerPathGraph);

module.exports = router;
