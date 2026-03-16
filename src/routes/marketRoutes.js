const router = require('express').Router();
const { trendingSkills, skillDemand } = require('../controllers/marketController');

router.get('/trending-skills', trendingSkills);
router.get('/skill-demand', skillDemand);

module.exports = router;
