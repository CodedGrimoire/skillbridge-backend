const router = require('express').Router();
const {
  createRole,
  getRoles,
  getRoleById,
  updateRole,
  deleteRole,
} = require('../controllers/roleController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

// Public read endpoints
router.get('/', getRoles);
router.get('/:id', getRoleById);

// Admin-protected write endpoints
router.post('/', authenticate, requireAdmin, createRole);
router.put('/:id', authenticate, requireAdmin, updateRole);
router.delete('/:id', authenticate, requireAdmin, deleteRole);

module.exports = router;
