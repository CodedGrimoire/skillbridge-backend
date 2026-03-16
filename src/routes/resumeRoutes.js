const router = require('express').Router();
const { uploadResume, getResumeById } = require('../controllers/resumeController');
const { authenticate } = require('../middleware/authMiddleware');
const { uploadMiddleware } = require('../middleware/uploadMiddleware');

router.post('/upload', authenticate, uploadMiddleware, uploadResume);
router.get('/:id', authenticate, getResumeById);

module.exports = router;
