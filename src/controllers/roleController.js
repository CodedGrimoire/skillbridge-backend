const { prisma } = require('../config/db');
const { z } = require('zod');

const roleSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  skills: z.array(z.object({ id: z.number().int(), weight: z.number().int().min(1).max(5).optional() })).optional(),
});

const getRoles = async (_req, res, next) => {
  try {
    const roles = await prisma.jobRole.findMany({ include: { roleSkills: { include: { skill: true } } } });
    res.json(roles);
  } catch (err) {
    next(err);
  }
};

const createRole = async (req, res, next) => {
  try {
    const payload = roleSchema.parse(req.body);
    const role = await prisma.jobRole.create({
      data: {
        title: payload.title,
        description: payload.description,
        roleSkills: payload.skills
          ? {
              create: payload.skills.map((s) => ({ skillId: s.id, weight: s.weight ?? 1 })),
            }
          : undefined,
      },
      include: { roleSkills: true },
    });
    res.status(201).json(role);
  } catch (err) {
    next(err);
  }
};

module.exports = { getRoles, createRole };
