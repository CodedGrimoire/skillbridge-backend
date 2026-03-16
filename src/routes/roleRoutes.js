const router = require('express').Router();
const {
  createRole,
  getRoles,
  getRoleById,
  updateRole,
  deleteRole,
} = require('../controllers/roleController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

// Public read endpoints
router.get('/', getRoles);
router.get('/:id', getRoleById);

// Admin-protected write endpoints
router.post('/', authenticateToken, requireAdmin, createRole);
router.put('/:id', authenticateToken, requireAdmin, updateRole);
router.delete('/:id', authenticateToken, requireAdmin, deleteRole);

module.exports = router;
