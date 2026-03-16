const router = require('express').Router();
const { createJob, getJobs, getJobById, deleteJob } = require('../controllers/jobController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

router.get('/', getJobs);
router.get('/:id', getJobById);
router.post('/', authenticateToken, requireAdmin, createJob);
router.delete('/:id', authenticateToken, requireAdmin, deleteJob);

module.exports = router;
