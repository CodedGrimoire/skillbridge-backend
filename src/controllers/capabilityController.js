const { prisma } = require('../config/db');
const { createCapabilityAnalysis, listMissingSkills } = require('../services/capabilityService');

const runFullAnalysis = async (req, res, next) => {
  try {
    const analysis = await createCapabilityAnalysis(req.user.id);
    res.status(201).json(analysis);
  } catch (err) {
    next(err);
  }
};

const getMissingSkills = async (req, res, next) => {
  try {
    const skills = await listMissingSkills(req.user.id);
    res.json(skills);
  } catch (err) {
    next(err);
  }
};

const updateMissingSkill = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, name } = req.body || {};
    const updated = await prisma.missingSkill.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(name ? { name } : {}),
      },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

const createMissingSkill = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'name is required' });
    const created = await prisma.missingSkill.create({
      data: { name, userId: req.user.id },
    });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

const deleteMissingSkill = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.missingSkill.delete({ where: { id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  runFullAnalysis,
  getMissingSkills,
  updateMissingSkill,
  createMissingSkill,
  deleteMissingSkill,
};
