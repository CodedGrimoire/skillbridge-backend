const { prisma } = require('../config/db');
const { z } = require('zod');

const skillSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

const getSkills = async (_req, res, next) => {
  try {
    const skills = await prisma.skill.findMany();
    res.json(skills);
  } catch (err) {
    next(err);
  }
};

const createSkill = async (req, res, next) => {
  try {
    const payload = skillSchema.parse(req.body);
    const skill = await prisma.skill.create({ data: payload });
    res.status(201).json(skill);
  } catch (err) {
    next(err);
  }
};

module.exports = { getSkills, createSkill };
