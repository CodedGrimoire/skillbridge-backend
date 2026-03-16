const router = require('express').Router();
const {
  createResource,
  getResources,
  updateResource,
  deleteResource,
} = require('../controllers/resourceController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

// Public read
router.get('/', getResources);

// Admin write
router.post('/', authenticate, requireAdmin, createResource);
router.put('/:id', authenticate, requireAdmin, updateResource);
router.delete('/:id', authenticate, requireAdmin, deleteResource);

module.exports = router;
