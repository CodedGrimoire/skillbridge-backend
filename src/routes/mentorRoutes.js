const router = require('express').Router();
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const {
  listMentors,
  createRequest,
  listRequestsForMentor,
  updateRequestStatus,
  deleteUser,
  getUserSkillProfile,
  addMissingSkill,
  addResumeComment,
  listResumeComments,
  upsertMentorProfile,
  getMentorProfile,
  submitReview,
  listReviews,
} = require('../controllers/mentorController');

router.get('/mentors', authenticateToken, listMentors);
router.post('/requests', authenticateToken, createRequest);
router.get('/requests', authenticateToken, authorizeRoles('ADMIN'), listRequestsForMentor);
router.put('/requests/:id', authenticateToken, authorizeRoles('ADMIN'), updateRequestStatus);

router.delete('/users/:id', authenticateToken, authorizeRoles('ADMIN'), deleteUser);
router.get('/users/:id/skills', authenticateToken, authorizeRoles('ADMIN'), getUserSkillProfile);
router.post('/users/:id/missing-skills', authenticateToken, authorizeRoles('ADMIN'), addMissingSkill);

router.post('/resumes/:resumeId/comments', authenticateToken, authorizeRoles('ADMIN'), addResumeComment);
router.get('/resumes/:resumeId/comments', authenticateToken, authorizeRoles('ADMIN'), listResumeComments);

router.get('/profile', authenticateToken, authorizeRoles('ADMIN'), getMentorProfile);
router.put('/profile', authenticateToken, authorizeRoles('ADMIN'), upsertMentorProfile);

router.post('/reviews', authenticateToken, submitReview);
router.get('/reviews/:mentorId', authenticateToken, listReviews);

module.exports = router;
