const { prisma } = require('../config/db');

/**
 * Calculate global skill demand by counting occurrences across all jobs.
 */
async function calculateSkillDemand() {
  const jobs = await prisma.job.findMany({ select: { skills: true } });
  const freq = {};
  jobs.forEach((job) => {
    const skills = Array.isArray(job.skills) ? job.skills : [];
    skills.forEach((s) => {
      if (!s) return;
      const key = s.toString();
      freq[key] = (freq[key] || 0) + 1;
    });
  });
  return Object.fromEntries(Object.entries(freq).sort((a, b) => b[1] - a[1]));
}

module.exports = { calculateSkillDemand };
