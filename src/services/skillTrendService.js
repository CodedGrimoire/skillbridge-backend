const { prisma } = require('../config/db');

/**
 * Count how often a skill appears per year across jobs.
 */
async function calculateSkillTrends(skillName) {
  const jobs = await prisma.job.findMany({
    where: {
      skills: { array_contains: [skillName] },
    },
    select: { datePosted: true, createdAt: true },
  });

  const byYear = {};
  jobs.forEach((j) => {
    const d = j.datePosted || j.createdAt;
    const year = new Date(d).getFullYear();
    byYear[year] = (byYear[year] || 0) + 1;
  });

  return byYear;
}

/**
 * Return sorted history [{year, demand}] for charting.
 */
async function getSkillTrendHistory(skillName) {
  const map = await calculateSkillTrends(skillName);
  return Object.entries(map)
    .map(([year, demand]) => ({ year: Number(year), demand }))
    .sort((a, b) => a.year - b.year);
}

module.exports = { calculateSkillTrends, getSkillTrendHistory };
