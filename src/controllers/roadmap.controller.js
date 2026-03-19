const { generateRoleRoadmap } = require('../services/llm.service');
const { analyzeUserProgress } = require('../services/roadmap.service');
const { prisma } = require('../config/db');

// POST /api/roadmap/generate
const generateRoadmap = async (req, res) => {
  try {
    const { role } = req.body || {};
    if (!role) {
      return res.status(400).json({ message: 'Role is required' });
    }
    const roadmap = await generateRoleRoadmap(role);
    return res.json({ roadmap });
  } catch (err) {
    console.error('generateRoadmap error', err);
    return res.status(500).json({ message: 'Unable to generate roadmap, using default' });
  }
};

// POST /api/roadmap/analyze
const analyzeRoadmap = async (req, res) => {
  try {
    const { role, userSkills = [] } = req.body || {};
    if (!role) {
      return res.status(400).json({ message: 'Role is required' });
    }

    const roadmap = await generateRoleRoadmap(role);
    const analysis = analyzeUserProgress(roadmap, userSkills);

    return res.json({ roadmap, analysis });
  } catch (err) {
    console.error('analyzeRoadmap error', err);
    return res.status(500).json({
      message: 'Unable to analyze roadmap right now. Using default.',
    });
  }
};

// GET /api/roadmap/plans
const listPlans = async (req, res) => {
  const plans = await prisma.careerVisionPlan.findMany({
    where: { userId: req.user.id },
    orderBy: { updatedAt: 'desc' },
  });
  res.json(plans);
};

// POST /api/roadmap/plans
const upsertPlan = async (req, res) => {
  const { role, roadmap, analysis } = req.body || {};
  if (!role || !roadmap || !analysis) {
    return res.status(400).json({ message: 'role, roadmap, analysis are required' });
  }
  const plan = await prisma.careerVisionPlan.upsert({
    where: { userId_role: { userId: req.user.id, role } },
    update: { roadmap, analysis },
    create: { userId: req.user.id, role, roadmap, analysis },
  });
  res.json(plan);
};

// DELETE /api/roadmap/plans/:id
const deletePlan = async (req, res) => {
  try {
    await prisma.careerVisionPlan.delete({
      where: { id: req.params.id, userId: req.user.id },
    });
    res.status(204).send();
  } catch (err) {
    return res.status(404).json({ message: 'Plan not found' });
  }
};

module.exports = { generateRoadmap, analyzeRoadmap, listPlans, upsertPlan, deletePlan };
