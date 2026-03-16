// Compares user skills with role skills and returns missing + matching sets.
const analyzeGaps = (userSkills, roleSkills) => {
  const userSet = new Set(userSkills.map((s) => s.toLowerCase ? s.toLowerCase() : s.name.toLowerCase()));

  const required = roleSkills.map((rs) => ({ name: rs.name.toLowerCase(), weight: rs.weight || 1 }));

  const missing = required.filter((rs) => !userSet.has(rs.name));
  const matched = required.filter((rs) => userSet.has(rs.name));

  return {
    matched,
    missing,
    coverage: required.length ? matched.length / required.length : 0,
  };
};

module.exports = { analyzeGaps };
