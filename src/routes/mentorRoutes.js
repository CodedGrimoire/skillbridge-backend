const router = require('express').Router();
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const {
  listMentors,
  createRequest,
  listRequestsForMentor,
  listMentees,
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
  submitAssessment,
  listAssessmentsForUser,
  createMeeting,
  listMeetings,
} = require('../controllers/mentorController');

router.get('/mentors', authenticateToken, listMentors);
router.post('/requests', authenticateToken, createRequest);
router.get('/requests', authenticateToken, authorizeRoles('ADMIN'), listRequestsForMentor);
router.put('/requests/:id', authenticateToken, authorizeRoles('ADMIN'), updateRequestStatus);
router.get('/mentees', authenticateToken, authorizeRoles('ADMIN'), listMentees);

router.delete('/users/:id', authenticateToken, authorizeRoles('ADMIN'), deleteUser);
router.get('/users/:id/skills', authenticateToken, authorizeRoles('ADMIN'), getUserSkillProfile);
router.post('/users/:id/missing-skills', authenticateToken, authorizeRoles('ADMIN'), addMissingSkill);

router.post('/resumes/:resumeId/comments', authenticateToken, authorizeRoles('ADMIN'), addResumeComment);
router.get('/resumes/:resumeId/comments', authenticateToken, authorizeRoles('ADMIN'), listResumeComments);

router.get('/profile', authenticateToken, authorizeRoles('ADMIN'), getMentorProfile);
router.put('/profile', authenticateToken, authorizeRoles('ADMIN'), upsertMentorProfile);

router.post('/reviews', authenticateToken, submitReview);
router.get('/reviews/:mentorId', authenticateToken, listReviews);

router.post('/assessments', authenticateToken, authorizeRoles('ADMIN'), submitAssessment);
router.get('/assessments/:id', authenticateToken, authorizeRoles('ADMIN'), listAssessmentsForUser);

router.post('/meetings', authenticateToken, authorizeRoles('ADMIN'), createMeeting);
router.get('/meetings', authenticateToken, listMeetings);

module.exports = router;
