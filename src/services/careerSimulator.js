/**
 * Simulate career progress by adding prospective skills to user's current set
 * and recomputing match score against role requirements.
 */
function simulateCareer(userSkills = [], newSkills = [], roleSkills = []) {
  const normalizedUser = userSkills.map((s) => s.toLowerCase());
  const normalizedNew = newSkills.map((s) => s.toLowerCase());
  const combinedSet = new Set([...normalizedUser, ...normalizedNew]);

  const roleSet = roleSkills.map((s) => s.toLowerCase());
  const matched = roleSet.filter((s) => combinedSet.has(s));
  const missing = roleSet.filter((s) => !combinedSet.has(s));

  const simulatedMatchScore = roleSet.length ? Math.round((matched.length / roleSet.length) * 100) : 0;

  return {
    simulatedSkills: Array.from(combinedSet),
    matchedSkills: matched,
    missingSkills: missing,
    simulatedMatchScore,
  };
}

module.exports = { simulateCareer };
