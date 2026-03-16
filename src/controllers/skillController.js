const { prisma } = require('../config/db');
const { z } = require('zod');

const skillSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().optional(),
});

// Create Skill (admin)
const createSkill = async (req, res, next) => {
  try {
    const data = skillSchema.parse(req.body);
    const skill = await prisma.skill.create({ data });
    res.status(201).json(skill);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ message: 'Skill name already exists' });
    next(err);
  }
};

// Read Skills (public)
const getSkills = async (_req, res, next) => {
  try {
    const skills = await prisma.skill.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(skills);
  } catch (err) {
    next(err);
  }
};

// Update Skill (admin)
const updateSkill = async (req, res, next) => {
  try {
    const data = skillSchema.partial().parse(req.body);
    const updated = await prisma.skill.update({
      where: { id: req.params.id },
      data,
    });
    res.json(updated);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Skill not found' });
    next(err);
  }
};

// Delete Skill (admin)
const deleteSkill = async (req, res, next) => {
  try {
    await prisma.skill.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Skill not found' });
    next(err);
  }
};

module.exports = { createSkill, getSkills, updateSkill, deleteSkill };
