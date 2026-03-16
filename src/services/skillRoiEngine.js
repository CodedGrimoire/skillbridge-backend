const { getSkillDemand } = require('./marketAnalyzer');

// Simple difficulty lookup; default to medium if unknown.
const difficultyTable = {
  easy: 1,
  medium: 2,
  hard: 3,
};

/**
 * Calculate ROI for missing skills based on market demand, role importance, and learning difficulty.
 * missingSkills: array of { skill, importanceLevel?, difficulty? }
 */
async function calculateSkillROI(missingSkills = []) {
  const demandMap = await getSkillDemand();

  return missingSkills
    .map((item) => {
      const name = typeof item === 'string' ? item : item.skill;
      const importanceWeight = item.importanceLevel ?? 1;
      const difficultyKey = (item.difficulty || 'medium').toLowerCase();
      const difficulty = difficultyTable[difficultyKey] || difficultyTable.medium;
      const demandScore = demandMap[name] || demandMap[name?.toLowerCase()] || 0;
      const roiScore = difficulty ? Math.round((demandScore * importanceWeight) / difficulty) : 0;
      return { skill: name, roiScore, demandScore, importanceWeight, difficulty };
    })
    .sort((a, b) => b.roiScore - a.roiScore);
}

module.exports = { calculateSkillROI };
