const { prisma } = require('../config/db');
const { simulateCareer } = require('../services/careerSimulator');
const { generateRecommendations } = require('../services/aiService');

/**
 * POST /api/simulation/run
 * Body: { userId, roleId, newSkills: [] }
 */
const runSimulation = async (req, res, next) => {
  try {
    const { userId, roleId, newSkills = [] } = req.body || {};
    if (!userId || !roleId || !Array.isArray(newSkills)) {
      return res.status(400).json({ message: 'userId, roleId, and newSkills array are required' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const role = await prisma.jobRole.findUnique({
      where: { id: roleId },
      include: { roleSkills: { include: { skill: true } } },
    });
    if (!role) return res.status(404).json({ message: 'Role not found' });

    const userSkills = await prisma.userSkill.findMany({
      where: { userId },
      include: { skill: true },
    });

    const currentMatch = (() => {
      const userSet = new Set(userSkills.map((s) => s.skill.name.toLowerCase()));
      const roleNames = role.roleSkills.map((rs) => rs.skill.name.toLowerCase());
      const matched = roleNames.filter((n) => userSet.has(n));
      return roleNames.length ? Math.round((matched.length / roleNames.length) * 100) : 0;
    })();

    const roleSkills = role.roleSkills.map((rs) => rs.skill.name);
    const simulation = simulateCareer(
      userSkills.map((s) => s.skill.name),
      newSkills,
      roleSkills
    );

    // AI explanation leveraging existing recommendation helper
    const aiExplanation = await generateRecommendations({
      matchedSkills: simulation.matchedSkills,
      missingSkills: simulation.missingSkills,
      roleTitle: role.title,
      plannedSkills: newSkills,
    });

    res.json({
      currentMatch: currentMatch,
      simulatedMatch: simulation.simulatedMatchScore,
      matchedSkills: simulation.matchedSkills,
      missingSkills: simulation.missingSkills,
      simulatedSkills: simulation.simulatedSkills,
      aiExplanation,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { runSimulation };
