const { prisma } = require('../config/db');

const createCourse = async (req, res, next) => {
  try {
    const { title, description, price, mentorId } = req.body || {};
    if (!title || !description || !price || !mentorId) return res.status(400).json({ message: 'Missing fields' });
    const course = await prisma.course.create({
      data: { title, description, price: Number(price), mentorId },
    });
    res.status(201).json(course);
  } catch (err) {
    next(err);
  }
};

const listCourses = async (_req, res, next) => {
  try {
    const courses = await prisma.course.findMany({
      include: { mentor: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(courses);
  } catch (err) {
    next(err);
  }
};

const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.course.delete({ where: { id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

module.exports = { createCourse, listCourses, deleteCourse };
