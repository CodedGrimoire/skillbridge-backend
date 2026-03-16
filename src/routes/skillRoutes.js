const router = require('express').Router();
const {
  createSkill,
  getSkills,
  updateSkill,
  deleteSkill,
} = require('../controllers/skillController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

// Public read
router.get('/', getSkills);

// Admin write
router.post('/', authenticate, requireAdmin, createSkill);
router.put('/:id', authenticate, requireAdmin, updateSkill);
router.delete('/:id', authenticate, requireAdmin, deleteSkill);

module.exports = router;
