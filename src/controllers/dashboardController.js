const { prisma } = require('../config/db');

// Get authenticated user's profile
const getUserProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// Get skills detected for the user
const getUserSkills = async (req, res, next) => {
  try {
    const skills = await prisma.userSkill.findMany({
      where: { userId: req.user.id },
      include: { skill: true },
    });

    res.json({ skills: skills.map((s) => s.skill.name) });
  } catch (err) {
    next(err);
  }
};

// Get full analysis history
const getUserAnalyses = async (req, res, next) => {
  try {
    const analyses = await prisma.capabilityAnalysis.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      analyses: analyses.map((a) => ({
        role: a.primaryRole ?? 'Unknown role',
        matchScore: a.score,
        createdAt: a.createdAt,
        missingSkills: a.missingSkills,
        id: a.id,
      })),
    });
  } catch (err) {
    next(err);
  }
};

// Get latest analysis with details
const getLatestAnalysis = async (req, res, next) => {
  try {
    const analysis = await prisma.capabilityAnalysis.findFirst({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    if (!analysis) {
      return res.json({ message: 'No analyses yet', analysis: null });
    }

    res.json({
      analysis: {
        role: analysis.primaryRole ?? 'Unknown role',
        matchScore: analysis.score,
        matchedSkills: analysis.userSkills ?? [],
        missingSkills: analysis.missingSkills ?? [],
        aiRecommendations: '', // capability analyses don't store this yet
        createdAt: analysis.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get learning resources for missing skills from latest analysis
const getLearningResources = async (req, res, next) => {
  try {
    const latest = await prisma.capabilityAnalysis.findFirst({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    if (!latest || !latest.missingSkills || !latest.missingSkills.length) {
      return res.json({ resources: [], message: 'No missing skills or no analyses yet.' });
    }

    const resources = await prisma.learningResource.findMany({
      where: { skill: { name: { in: latest.missingSkills } } },
      include: { skill: true },
    });

    res.json({
      resources: resources.map((r) => ({
        skill: r.skill?.name ?? '',
        title: r.title,
        url: r.url,
        type: r.type,
      })),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUserProfile,
  getUserSkills,
  getUserAnalyses,
  getLatestAnalysis,
  getLearningResources,
};
