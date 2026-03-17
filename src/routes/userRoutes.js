const router = require('express').Router();
const { getUsers, getUserById, getMySkills, getMe, updateMyLinks } = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, getUsers);
router.get('/me', authenticateToken, getMe);
router.put('/me/links', authenticateToken, updateMyLinks);
router.get('/me/skills', authenticateToken, getMySkills);
router.get('/:id', authenticateToken, getUserById);

module.exports = router;
