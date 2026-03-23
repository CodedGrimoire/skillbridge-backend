const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const { createCourse, listCourses, listPurchasedCourses, deleteCourse } = require('../controllers/course.controller');

const router = express.Router();

router.post('/', authenticateToken, authorizeRoles('ADMIN'), createCourse);
router.get('/', listCourses);
router.get('/purchased', authenticateToken, listPurchasedCourses);
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), deleteCourse);

module.exports = router;
