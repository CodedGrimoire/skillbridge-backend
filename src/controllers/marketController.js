const { getTrendingSkills, getSkillDemand } = require('../services/marketAnalyzer');
const { calculateSkillDemand } = require('../services/marketStatsService');
const { prisma } = require('../config/db');

// Return top trending skills based on job postings frequency
const trendingSkills = async (_req, res, next) => {
  try {
    const trending = await getTrendingSkills();
    res.json({ trendingSkills: trending });
  } catch (err) {
    next(err);
  }
};

// Return raw demand map: skill -> frequency
const skillDemand = async (_req, res, next) => {
  try {
    const demand = await getSkillDemand();
    res.json({ skillDemand: demand });
  } catch (err) {
    next(err);
  }
};

module.exports = { trendingSkills, skillDemand };

// GET /api/market/trending (alias)
const trending = async (_req, res, next) => {
  try {
    const data = await getTrendingSkills();
    res.json({ trendingSkills: data });
  } catch (err) {
    next(err);
  }
};

// GET /api/market/role-demand/:roleId
const roleDemand = async (req, res, next) => {
  try {
    const { roleId } = req.params;
    const role = await prisma.jobRole.findUnique({
      where: { id: roleId },
      include: { roleSkills: { include: { skill: true } } },
    });
    if (!role) return res.status(404).json({ message: 'Role not found' });

    const demand = await calculateSkillDemand();
    const roleSkillNames = role.roleSkills.map((r) => r.skill.name);
    const filtered = roleSkillNames
      .map((name) => ({ skill: name, demand: demand[name] || demand[name.toLowerCase()] || 0 }))
      .sort((a, b) => b.demand - a.demand);

    res.json({ roleDemand: filtered });
  } catch (err) {
    next(err);
  }
};

module.exports = { trendingSkills, skillDemand, trending, roleDemand };
