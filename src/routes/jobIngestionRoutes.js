const router = require('express').Router();
const { ingestJobs } = require('../services/jobIngestionService');
const { loadJobsFromDataset } = require('../services/jobDatasetLoader');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const fs = require('fs/promises');
const path = require('path');

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

// Admin upload dataset file (JSON or CSV)
router.post('/import', authenticateToken, requireAdmin, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    // Persist to tmp file so loader can read by path
    const tmpPath = path.join(process.cwd(), 'uploads', `dataset-${Date.now()}`);
    await fs.mkdir(path.dirname(tmpPath), { recursive: true });
    await fs.writeFile(tmpPath, req.file.buffer);
    const inserted = await loadJobsFromDataset(tmpPath, req.body.source || 'upload');
    await fs.unlink(tmpPath).catch(() => {});
    res.status(201).json({ inserted });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
