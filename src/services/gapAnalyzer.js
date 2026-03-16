/**
 * Compare user skills against role skills and compute matches/misses.
 * Expects arrays of objects: [{ id, name }]
 * Optionally takes a demand map (skill -> demandScore) to enrich missing skills.
 */
function analyzeSkillGap(userSkills, roleSkills, demandMap = {}, roiFn) {
  const userSet = new Set(userSkills.map((s) => s.name.toLowerCase()));
  const required = roleSkills.map((s) => s.name.toLowerCase());

  const matched = roleSkills.filter((s) => userSet.has(s.name.toLowerCase()));
  const missing = roleSkills.filter((s) => !userSet.has(s.name.toLowerCase()));

  const matchScore = required.length
    ? Math.round((matched.length / required.length) * 100)
    : 0;

  const missingSkills = missing.map((s) => s.name);
  const missingSkillsWithDemand = missing.map((s) => ({
    skill: s.name,
    demandScore: demandMap[s.name] || demandMap[s.name.toLowerCase()] || 0,
  }));

  let recommendedNextSkills = [];
  if (roiFn) {
    recommendedNextSkills = roiFn(
      missing.map((s) => ({
        skill: s.name,
        importanceLevel: s.importanceLevel || 1,
      }))
    );
  }

  return {
    matchedSkills: matched.map((s) => s.name),
    missingSkills,
    missingSkillsWithDemand,
    recommendedNextSkills,
    matchScore,
  };
}

module.exports = { analyzeSkillGap };
