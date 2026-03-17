const {
  getTopSkills,
  getTopSkillsByRole,
  getTrendingSkills,
} = require('../services/skillDemandService');

// GET /api/market/top-skills
const topSkills = async (req, res, next) => {
  try {
    const limit = req.query.limit;
    const skills = await getTopSkills(limit);
    res.json({ skills });
  } catch (err) {
    next(err);
  }
};

// GET /api/market/role-skills?role=software engineer
const roleSkills = async (req, res, next) => {
  try {
    const { role } = req.query;
    if (!role) return res.status(400).json({ message: 'role query param is required' });
    const skills = await getTopSkillsByRole(role);
    res.json({ role, topSkills: skills.map((s) => s.name) });
  } catch (err) {
    next(err);
  }
};

// GET /api/market/trending-skills
const trendingSkills = async (req, res, next) => {
  try {
    const limit = req.query.limit;
    const skills = await getTrendingSkills(limit);
    res.json({ skills });
  } catch (err) {
    next(err);
  }
};

module.exports = { topSkills, roleSkills, trendingSkills };
