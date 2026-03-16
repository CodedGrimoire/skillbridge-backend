const { prisma } = require('../config/db');
const { analyzeSkillGap } = require('../services/gapAnalyzer');
const { generateRecommendations } = require('../services/aiService');

/**
 * Run skill gap analysis for a user's resume against a chosen job role.
 */
const runAnalysis = async (req, res, next) => {
  try {
    const { userId, resumeId, roleId } = req.body || {};

    if (!userId || !resumeId || !roleId) {
      return res.status(400).json({ message: 'userId, resumeId, and roleId are required.' });
    }

    if (req.user?.id && req.user.id !== userId) {
      return res.status(403).json({ message: 'You are not authorized to run analysis for this user.' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
    if (!resume) return res.status(404).json({ message: 'Resume not found' });

    const role = await prisma.jobRole.findUnique({
      where: { id: roleId },
      include: { roleSkills: { include: { skill: true } } },
    });
    if (!role) return res.status(404).json({ message: 'Role not found' });

    const userSkills = await prisma.userSkill.findMany({
      where: { userId },
      include: { skill: true },
    });
    if (!userSkills.length) {
      return res.status(400).json({ message: 'No extracted skills found for this user.' });
    }

    const roleSkills = role.roleSkills.map((rs) => ({ id: rs.skill.id, name: rs.skill.name }));
    if (!roleSkills.length) {
      return res.status(400).json({ message: 'Role has no skills configured.' });
    }

    const detectedUserSkills = userSkills.map((us) => ({ id: us.skill.id, name: us.skill.name }));
    const gapResult = analyzeSkillGap(detectedUserSkills, roleSkills);

    const recommendations = await generateRecommendations({
      matchedSkills: gapResult.matchedSkills,
      missingSkills: gapResult.missingSkills,
      roleTitle: role.title,
    });

    if (!recommendations) {
      return res
        .status(503)
        .json({ message: 'AI recommendation service unavailable. Please try again later.' });
    }

    const analysis = await prisma.analysis.create({
      data: {
        userId,
        resumeId,
        roleId,
        matchScore: gapResult.matchScore,
        matchedSkills: gapResult.matchedSkills,
        missingSkills: gapResult.missingSkills,
        aiRecommendations: recommendations,
      },
    });

    res.status(201).json({
      matchScore: gapResult.matchScore,
      matchedSkills: gapResult.matchedSkills,
      missingSkills: gapResult.missingSkills,
      recommendations,
      analysisId: analysis.id,
    });
  } catch (err) {
    next(err);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const analyses = await prisma.analysis.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(analyses);
  } catch (err) {
    next(err);
  }
};

module.exports = { runAnalysis, getHistory };
