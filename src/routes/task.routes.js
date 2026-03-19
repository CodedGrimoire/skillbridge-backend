const express = require('express');
const {
  createTask,
  getMentorTasks,
  getUserTasks,
  submitTask,
  reviewTask,
} = require('../controllers/task.controller');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authenticateToken, createTask);
router.get('/mentor/:mentorId', authenticateToken, getMentorTasks);
router.get('/user/:userId', authenticateToken, getUserTasks);
router.post('/submit', authenticateToken, submitTask);
router.patch('/review', authenticateToken, reviewTask);

module.exports = router;
