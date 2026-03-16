const { prisma } = require('../config/db');

/**
 * Aggregate skills from all stored job postings to understand market demand.
 * Returns a map: { skillName: frequency }
 */
async function extractMarketSkills() {
  const jobs = await prisma.job.findMany({ select: { skills: true } });
  const freq = {};

  jobs.forEach((job) => {
    const skills = Array.isArray(job.skills) ? job.skills : [];
    skills.forEach((skill) => {
      if (!skill) return;
      const key = skill.toString();
      freq[key] = (freq[key] || 0) + 1;
    });
  });

  return freq;
}

module.exports = { extractMarketSkills };
