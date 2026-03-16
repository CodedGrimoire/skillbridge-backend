const router = require('express').Router();
const { skillTrend } = require('../controllers/trendController');

router.get('/:skill', skillTrend);

module.exports = router;
