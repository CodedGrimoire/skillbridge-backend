const { prisma } = require('../config/db');
const { z } = require('zod');

const resourceSchema = z.object({
  skillId: z.string().uuid({ message: 'skillId must be a UUID' }),
  title: z.string().min(1, 'Title is required'),
  url: z.string().url('Invalid URL'),
  type: z.string().optional(),
});

// Create Learning Resource (admin)
const createResource = async (req, res, next) => {
  try {
    const data = resourceSchema.parse(req.body);
    const resource = await prisma.learningResource.create({ data });
    res.status(201).json(resource);
  } catch (err) {
    if (err.code === 'P2003') return res.status(400).json({ message: 'Invalid skillId' });
    next(err);
  }
};

// Read resources (public)
const getResources = async (_req, res, next) => {
  try {
    const resources = await prisma.learningResource.findMany({
      include: { skill: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(resources);
  } catch (err) {
    next(err);
  }
};

// Update resource (admin)
const updateResource = async (req, res, next) => {
  try {
    const data = resourceSchema.partial().parse(req.body);
    const updated = await prisma.learningResource.update({
      where: { id: req.params.id },
      data,
    });
    res.json(updated);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Resource not found' });
    if (err.code === 'P2003') return res.status(400).json({ message: 'Invalid skillId' });
    next(err);
  }
};

// Delete resource (admin)
const deleteResource = async (req, res, next) => {
  try {
    await prisma.learningResource.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Resource not found' });
    next(err);
  }
};

module.exports = { createResource, getResources, updateResource, deleteResource };
