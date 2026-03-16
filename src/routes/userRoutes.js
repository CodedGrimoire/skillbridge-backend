const router = require('express').Router();
const { getUsers, getUserById } = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/', authenticate, getUsers);
router.get('/:id', authenticate, getUserById);

module.exports = router;
