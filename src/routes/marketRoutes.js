const router = require('express').Router();
const { topSkills, roleSkills, trendingSkills } = require('../controllers/marketController');

// Skill demand endpoints
router.get('/top-skills', topSkills);
router.get('/role-skills', roleSkills);
router.get('/trending-skills', trendingSkills);

module.exports = router;
