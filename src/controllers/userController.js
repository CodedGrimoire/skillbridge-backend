const { prisma } = require('../config/db');

const getUsers = async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({ select: { id: true, email: true, name: true, createdAt: true } });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await prisma.user.findUnique({ where: { id }, select: { id: true, email: true, name: true, createdAt: true } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

const getMySkills = async (req, res, next) => {
  try {
    const skills = await prisma.userSkill.findMany({
      where: { userId: req.user.id },
      include: { skill: true },
    });
    res.json(skills.map((s) => s.skill.name));
  } catch (err) {
    next(err);
  }
};

module.exports = { getUsers, getUserById, getMySkills };
