const router = require('express').Router();
const { getUsers, getUserById } = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, getUsers);
router.get('/:id', authenticateToken, getUserById);

module.exports = router;
