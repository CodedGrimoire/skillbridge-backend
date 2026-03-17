const router = require('express').Router();
const { getUsers, getUserById, getMySkills } = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, getUsers);
router.get('/me/skills', authenticateToken, getMySkills);
router.get('/:id', authenticateToken, getUserById);

module.exports = router;
