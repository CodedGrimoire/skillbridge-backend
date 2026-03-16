const router = require('express').Router();
const { uploadResume, getResumeById } = require('../controllers/resumeController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { uploadMiddleware } = require('../middleware/uploadMiddleware');

router.post('/upload', authenticateToken, uploadMiddleware, uploadResume);
router.get('/:id', authenticateToken, getResumeById);

module.exports = router;
