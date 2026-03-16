const { prisma } = require('../config/db');

/**
 * Extract skills from a job description using known skills in the DB.
 */
async function extractSkillsFromJob(description = '') {
  const text = (description || '').toLowerCase();
  if (!text) return [];

  const skills = await prisma.skill.findMany({ select: { name: true } });
  const detected = skills
    .filter((s) => text.includes(s.name.toLowerCase()))
    .map((s) => s.name);

  return detected;
}

// Alias for clarity in dataset parsing
async function extractSkillsFromJobDescription(text = '') {
  return extractSkillsFromJob(text);
}

module.exports = { extractSkillsFromJob, extractSkillsFromJobDescription };
