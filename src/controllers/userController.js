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

const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        resumeUrl: true,
        linkedinUrl: true,
        githubUrl: true,
        portfolioUrl: true,
        createdAt: true,
      },
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

const updateMyLinks = async (req, res, next) => {
  try {
    const { resumeUrl, linkedinUrl, githubUrl, portfolioUrl } = req.body || {};
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { resumeUrl, linkedinUrl, githubUrl, portfolioUrl },
      select: {
        id: true,
        resumeUrl: true,
        linkedinUrl: true,
        githubUrl: true,
        portfolioUrl: true,
      },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

module.exports = { getUsers, getUserById, getMySkills, getMe, updateMyLinks };
