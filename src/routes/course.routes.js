const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const { createCourse, listCourses, deleteCourse } = require('../controllers/course.controller');

const router = express.Router();

router.post('/', authenticateToken, authorizeRoles('ADMIN'), createCourse);
router.get('/', listCourses);
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), deleteCourse);

module.exports = router;
