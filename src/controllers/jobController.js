const { prisma } = require('../config/db');
const { z } = require('zod');

// Zod schema to validate incoming job payloads
const jobSchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  location: z.string().min(1),
  description: z.string().optional(),
  skills: z.array(z.string()).default([]),
  salary: z.string().optional(),
  source: z.string().optional(),
});

// Create job (admin only via route guard)
const createJob = async (req, res, next) => {
  try {
    const data = jobSchema.parse(req.body);
    const job = await prisma.job.create({
      data: {
        ...data,
        skills: data.skills,
      },
    });
    res.status(201).json(job);
  } catch (err) {
    next(err);
  }
};

// List all jobs
const getJobs = async (_req, res, next) => {
  try {
    const jobs = await prisma.job.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(jobs);
  } catch (err) {
    next(err);
  }
};

// Get single job
const getJobById = async (req, res, next) => {
  try {
    const job = await prisma.job.findUnique({ where: { id: req.params.id } });
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    next(err);
  }
};

// Delete job (admin only via route guard)
const deleteJob = async (req, res, next) => {
  try {
    await prisma.job.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Job not found' });
    next(err);
  }
};

module.exports = { createJob, getJobs, getJobById, deleteJob };
