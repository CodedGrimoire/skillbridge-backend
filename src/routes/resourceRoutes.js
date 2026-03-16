const router = require('express').Router();
const {
  createResource,
  getResources,
  updateResource,
  deleteResource,
} = require('../controllers/resourceController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

// Public read
router.get('/', getResources);

// Admin write
router.post('/', authenticateToken, requireAdmin, createResource);
router.put('/:id', authenticateToken, requireAdmin, updateResource);
router.delete('/:id', authenticateToken, requireAdmin, deleteResource);

module.exports = router;
