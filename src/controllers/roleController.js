const { prisma } = require('../config/db');
const { z } = require('zod');

const roleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
});

// Create Job Role (admin)
const createRole = async (req, res, next) => {
  try {
    const data = roleSchema.parse(req.body);
    const role = await prisma.jobRole.create({ data });
    res.status(201).json(role);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ message: 'Role title already exists' });
    }
    next(err);
  }
};

// Read all roles (public)
const getRoles = async (_req, res, next) => {
  try {
    const roles = await prisma.jobRole.findMany({
      include: { roleSkills: { include: { skill: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(roles);
  } catch (err) {
    next(err);
  }
};

// Read single role (public)
const getRoleById = async (req, res, next) => {
  try {
    const role = await prisma.jobRole.findUnique({
      where: { id: req.params.id },
      include: { roleSkills: { include: { skill: true } } },
    });
    if (!role) return res.status(404).json({ message: 'Role not found' });
    res.json(role);
  } catch (err) {
    next(err);
  }
};

// Update role (admin)
const updateRole = async (req, res, next) => {
  try {
    const data = roleSchema.partial().parse(req.body);
    const updated = await prisma.jobRole.update({
      where: { id: req.params.id },
      data,
    });
    res.json(updated);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Role not found' });
    next(err);
  }
};

// Delete role (admin)
const deleteRole = async (req, res, next) => {
  try {
    await prisma.jobRole.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Role not found' });
    next(err);
  }
};

module.exports = { createRole, getRoles, getRoleById, updateRole, deleteRole };
