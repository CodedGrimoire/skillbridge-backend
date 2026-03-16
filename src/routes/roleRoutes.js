const router = require('express').Router();
const { getRoles, createRole } = require('../controllers/roleController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/', authenticate, getRoles);
router.post('/', authenticate, createRole);

module.exports = router;
