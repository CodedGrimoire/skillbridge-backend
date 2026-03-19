/**
 * Analyze user progress against a roadmap.
 * @param {Object} roadmap - { stages: [{ level, skills: [] }] }
 * @param {string[]} userSkills - list of user skills (case-insensitive match).
 */
function analyzeUserProgress(roadmap, userSkills = []) {
  const normalizedUser = new Set((userSkills || []).map((s) => s.toLowerCase().trim()).filter(Boolean));
  const stages = roadmap?.stages || [];

  const completedSkills = [];
  const missingSkills = [];

  let currentStage = 'Beginner';

  stages.forEach((stage) => {
    const stageSkills = stage.skills || [];
    const stageDone = stageSkills.every((skill) => normalizedUser.has(skill.toLowerCase()));

    stageSkills.forEach((skill) => {
      const hit = normalizedUser.has(skill.toLowerCase());
      if (hit) completedSkills.push(skill);
      else missingSkills.push(skill);
    });

    if (stage.level === 'Beginner' && stageDone) currentStage = 'Junior';
    if (stage.level === 'Junior' && stageDone) currentStage = 'Senior';
  });

  const totalSkills = completedSkills.length + missingSkills.length;
  const progress = totalSkills ? Math.round((completedSkills.length / totalSkills) * 100) : 0;

  return {
    currentStage,
    completedSkills,
    missingSkills,
    progress,
  };
}

module.exports = { analyzeUserProgress };
