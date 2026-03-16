const router = require('express').Router();
const multer = require('multer');
const { uploadResume, getResumeById } = require('../controllers/resumeController');
const { authenticate } = require('../middleware/authMiddleware');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload', authenticate, upload.single('file'), uploadResume);
router.get('/:id', authenticate, getResumeById);

module.exports = router;
