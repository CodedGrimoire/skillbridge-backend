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
    const analyses = await prisma.analysis.findMany({
      where: { userId: req.user.id },
      include: { role: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      analyses: analyses.map((a) => ({
        role: a.role?.title ?? 'Unknown role',
        matchScore: a.matchScore,
        createdAt: a.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
};

// Get latest analysis with details
const getLatestAnalysis = async (req, res, next) => {
  try {
    const analysis = await prisma.analysis.findFirst({
      where: { userId: req.user.id },
      include: { role: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!analysis) {
      return res.json({ message: 'No analyses yet', analysis: null });
    }

    res.json({
      analysis: {
        role: analysis.role?.title ?? 'Unknown role',
        matchScore: analysis.matchScore,
        matchedSkills: analysis.matchedSkills ?? [],
        missingSkills: analysis.missingSkills ?? [],
        aiRecommendations: analysis.aiRecommendations,
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
    const latest = await prisma.analysis.findFirst({
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
