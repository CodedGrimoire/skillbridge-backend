const { prisma } = require('../config/db');
const { generateCareerGraph } = require('../services/careerGraphService');

// GET /api/career/path/:roleId
const getCareerPathGraph = async (req, res, next) => {
  try {
    const { roleId } = req.params;
    if (!roleId) return res.status(400).json({ message: 'roleId is required' });

    const role = await prisma.jobRole.findUnique({ where: { id: roleId } });
    if (!role) return res.status(404).json({ message: 'Role not found' });

    // user skills from req.user if available
    const userId = req.user?.id;
    let userSkills = [];
    if (userId) {
      const uSkills = await prisma.userSkill.findMany({
        where: { userId },
        include: { skill: true },
      });
      userSkills = uSkills.map((s) => s.skill.name);
    }

    const graph = await generateCareerGraph(roleId, userSkills);
    if (!graph.nodes.length) {
      return res.status(404).json({ message: 'No career paths defined for this role', graph });
    }

    res.json(graph);
  } catch (err) {
    next(err);
  }
};

module.exports = { getCareerPathGraph };
