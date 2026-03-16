const { extractMarketSkills } = require('./jobSkillAnalyzer');

/**
 * Return a frequency map of skills across all jobs.
 */
async function getSkillDemand() {
  return extractMarketSkills();
}

/**
 * Sort skills by demand and return top 10 trending with a demandScore (count).
 */
async function getTrendingSkills(limit = 10) {
  const freq = await extractMarketSkills();
  const sorted = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([skill, demandScore]) => ({ skill, demandScore }));
  return sorted;
}

module.exports = { getSkillDemand, getTrendingSkills };
