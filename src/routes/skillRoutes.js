const router = require('express').Router();
const { getSkills, createSkill } = require('../controllers/skillController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/', authenticate, getSkills);
router.post('/', authenticate, createSkill);

module.exports = router;
