const { getSkillTrendHistory } = require('../services/skillTrendService');

// GET /api/trends/:skill
const skillTrend = async (req, res, next) => {
  try {
    const skill = req.params.skill;
    if (!skill) return res.status(400).json({ message: 'Skill is required' });
    const trend = await getSkillTrendHistory(skill);
    res.json({ skill, trend });
  } catch (err) {
    next(err);
  }
};

module.exports = { skillTrend };
