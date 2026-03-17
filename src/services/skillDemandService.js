/**
 * Skill Demand Analytics
 * - Counts how often each skill appears across jobs (JobSkill join table).
 * - Supports overall rankings, role-filtered rankings, and 30-day trending skills.
 * - Relies on JobSkill as the link between Job and Skill (many-to-many).
 */
const { prisma } = require('../config/db');

function normalizeLimit(value, fallback = 10) {
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed <= 0) return fallback;
  return parsed;
}

async function attachNames(grouped) {
  const ids = grouped.map((g) => g.skillId);
  const skills = await prisma.skill.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true },
  });
  const nameMap = skills.reduce((acc, s) => {
    acc[s.id] = s.name;
    return acc;
  }, {});
  return grouped.map((g) => ({
    name: nameMap[g.skillId] || 'Unknown',
    jobs: g._count.skillId,
  }));
}

async function getTopSkills(limit = 10) {
  const take = normalizeLimit(limit, 10);
  const grouped = await prisma.jobSkill.groupBy({
    by: ['skillId'],
    _count: { skillId: true },
    orderBy: { _count: { skillId: 'desc' } },
    take,
  });
  return attachNames(grouped);
}

async function getTopSkillsByRole(roleName, limit = 10) {
  const take = normalizeLimit(limit, 10);
  const grouped = await prisma.jobSkill.groupBy({
    by: ['skillId'],
    _count: { skillId: true },
    where: {
      job: { title: { contains: roleName, mode: 'insensitive' } },
    },
    orderBy: { _count: { skillId: 'desc' } },
    take,
  });
  return attachNames(grouped);
}

async function getTrendingSkills(limit = 10) {
  const take = normalizeLimit(limit, 10);
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const grouped = await prisma.jobSkill.groupBy({
    by: ['skillId'],
    _count: { skillId: true },
    where: {
      job: {
        datePosted: { gte: since },
      },
    },
    orderBy: { _count: { skillId: 'desc' } },
    take,
  });

  return attachNames(grouped);
}

module.exports = {
  getTopSkills,
  getTopSkillsByRole,
  getTrendingSkills,
};
