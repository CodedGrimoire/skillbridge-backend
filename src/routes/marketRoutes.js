const router = require('express').Router();
const { trendingSkills, skillDemand, trending, roleDemand } = require('../controllers/marketController');

router.get('/trending-skills', trendingSkills);
router.get('/skill-demand', skillDemand);
router.get('/trending', trending);
router.get('/role-demand/:roleId', roleDemand);

module.exports = router;
