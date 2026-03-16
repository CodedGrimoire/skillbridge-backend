/**
 * Compare user skills against role skills and compute matches/misses.
 * Expects arrays of objects: [{ id, name }]
 */
function analyzeSkillGap(userSkills, roleSkills) {
  const userSet = new Set(userSkills.map((s) => s.name.toLowerCase()));
  const required = roleSkills.map((s) => s.name.toLowerCase());

  const matched = roleSkills.filter((s) => userSet.has(s.name.toLowerCase()));
  const missing = roleSkills.filter((s) => !userSet.has(s.name.toLowerCase()));

  const matchScore = required.length
    ? Math.round((matched.length / required.length) * 100)
    : 0;

  return {
    matchedSkills: matched.map((s) => s.name),
    missingSkills: missing.map((s) => s.name),
    matchScore,
  };
}

module.exports = { analyzeSkillGap };
