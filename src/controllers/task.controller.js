const { prisma } = require('../config/db');

// POST /api/tasks
const createTask = async (req, res, next) => {
  try {
    const { title, description, deadline, difficulty, fullMarks = 100, mentorId, assignedUserIds = [] } = req.body;
    if (!title || !description || !deadline || !difficulty || !mentorId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        deadline: new Date(deadline),
        difficulty,
        fullMarks: Number(fullMarks),
        mentorId,
        assignments: {
          create: assignedUserIds.map((userId) => ({ userId })),
        },
      },
      include: { assignments: true },
    });
    return res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

// GET /api/tasks/mentor/:mentorId
const getMentorTasks = async (req, res, next) => {
  try {
    const { mentorId } = req.params;
    const tasks = await prisma.task.findMany({
      where: { mentorId },
      orderBy: { createdAt: 'desc' },
      include: {
        assignments: {
          include: { user: true, submission: true },
          orderBy: { id: 'desc' },
        },
      },
    });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

// GET /api/tasks/user/:userId
const getUserTasks = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const assignments = await prisma.assignment.findMany({
      where: { userId },
      orderBy: { id: 'desc' },
      include: { task: true, submission: true },
    });
    res.json(assignments);
  } catch (err) {
    next(err);
  }
};

// POST /api/tasks/submit
const submitTask = async (req, res, next) => {
  try {
    const { assignmentId, link } = req.body;
    if (!assignmentId || !link) return res.status(400).json({ message: 'assignmentId and link are required' });

    const submission = await prisma.submission.upsert({
      where: { assignmentId },
      update: { link, submittedAt: new Date() },
      create: { assignmentId, link },
    });

    await prisma.assignment.update({
      where: { id: assignmentId },
      data: { status: 'submitted' },
    });

    res.status(201).json(submission);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/tasks/review
const reviewTask = async (req, res, next) => {
  try {
    const { assignmentId, status, feedback } = req.body;
    if (!assignmentId || !status) return res.status(400).json({ message: 'assignmentId and status are required' });
    if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ message: 'Invalid status' });

    await prisma.assignment.update({
      where: { id: assignmentId },
      data: { status },
    });

    const submission = await prisma.submission.update({
      where: { assignmentId },
      data: { feedback: feedback || null },
    });

    res.json(submission);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createTask,
  getMentorTasks,
  getUserTasks,
  submitTask,
  reviewTask,
};
