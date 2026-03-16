const router = require('express').Router();
const { ingestJobs } = require('../services/jobIngestionService');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

// Bulk ingest endpoint (admin only)
router.post('/ingest', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const jobs = req.body.jobs || [];
    const count = await ingestJobs(jobs, req.body.source || 'api');
    res.status(201).json({ inserted: count });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
