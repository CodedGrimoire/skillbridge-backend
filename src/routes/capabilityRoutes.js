const router = require('express').Router();
const {
  runFullAnalysis,
  getMissingSkills,
  updateMissingSkill,
  createMissingSkill,
  deleteMissingSkill,
} = require('../controllers/capabilityController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/analyze', authenticateToken, runFullAnalysis);
router.get('/missing-skills', authenticateToken, getMissingSkills);
router.post('/missing-skills', authenticateToken, createMissingSkill);
router.put('/missing-skills/:id', authenticateToken, updateMissingSkill);
router.delete('/missing-skills/:id', authenticateToken, deleteMissingSkill);

module.exports = router;
