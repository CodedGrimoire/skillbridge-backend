const { prisma } = require('../config/db');
const { extractSkillsFromText } = require('../services/skillExtractor');
const { analyzeGaps } = require('../services/gapAnalyzer');
const { generateRecommendations } = require('../services/aiService');

const runAnalysis = async (req, res, next) => {
  try {
    const { resumeId, roleId } = req.body;
    const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
    if (!resume) return res.status(404).json({ message: 'Resume not found' });

    const role = await prisma.jobRole.findUnique({
      where: { id: roleId },
      include: { roleSkills: { include: { skill: true } } },
    });
    if (!role) return res.status(404).json({ message: 'Role not found' });

    const userSkills = await extractSkillsFromText(resume.text || '');
    const roleSkills = role.roleSkills.map((rs) => ({ name: rs.skill.name, weight: rs.weight || 1 }));

    const gapSummary = analyzeGaps(userSkills, roleSkills);
    const recommendations = await generateRecommendations({ userSkills, roleSkills, gapSummary });

    const analysis = await prisma.analysis.create({
      data: {
        userId: req.user.id,
        resumeId: resume.id,
        roleId: role.id,
        gapSummary,
        recommendations,
      },
    });

    res.status(201).json({ analysisId: analysis.id, gapSummary, recommendations });
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
