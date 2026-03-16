const { getTrendingSkills, getSkillDemand } = require('../services/marketAnalyzer');

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
