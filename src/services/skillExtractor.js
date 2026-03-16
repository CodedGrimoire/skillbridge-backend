const { prisma } = require('../config/db');

/**
 * Naive skill detector: checks if skill names appear in the text.
 * Returns a list of { id, name } for skills that are present.
 */
async function extractSkillsFromText(text) {
  if (!text) return [];

  const lower = text.toLowerCase();
  const skills = await prisma.skill.findMany({ select: { id: true, name: true } });

  return skills.filter((skill) => lower.includes(skill.name.toLowerCase()));
}

module.exports = { extractSkillsFromText };
