const router = require('express').Router();
const {
  createSkill,
  getSkills,
  updateSkill,
  deleteSkill,
} = require('../controllers/skillController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

// Public read
router.get('/', getSkills);

// Admin write
router.post('/', authenticateToken, requireAdmin, createSkill);
router.put('/:id', authenticateToken, requireAdmin, updateSkill);
router.delete('/:id', authenticateToken, requireAdmin, deleteSkill);

module.exports = router;
