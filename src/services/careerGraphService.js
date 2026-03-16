const { prisma } = require('../config/db');

/**
 * Build a simple career path graph starting from a roleId.
 * Nodes include matched/missing skills compared to userSkills.
 */
async function generateCareerGraph(roleId, userSkills = []) {
  const userSkillSet = new Set(userSkills.map((s) => s.toLowerCase()));

  // Fetch paths originating from the selected role
  const paths = await prisma.careerPath.findMany({
    where: { fromRoleId: roleId },
    include: {
      fromRole: { include: { roleSkills: { include: { skill: true } } } },
      toRole: { include: { roleSkills: { include: { skill: true } } } },
    },
  });

  if (!paths.length) return { nodes: [], edges: [] };

  const nodes = [];
  const edges = [];

  const addNode = (role) => {
    const requiredSkills = role.roleSkills.map((rs) => rs.skill.name.toLowerCase());
    const matchedSkills = requiredSkills.filter((s) => userSkillSet.has(s));
    const missingSkills = requiredSkills.filter((s) => !userSkillSet.has(s));
    nodes.push({
      role: role.title,
      matchedSkills,
      missingSkills,
    });
  };

  paths.forEach((p) => {
    addNode(p.fromRole);
    addNode(p.toRole);
    edges.push({ from: p.fromRole.title, to: p.toRole.title });
  });

  // Deduplicate nodes by role title
  const uniqueNodes = Object.values(
    nodes.reduce((acc, n) => {
      acc[n.role] = n;
      return acc;
    }, {})
  );

  return { nodes: uniqueNodes, edges };
}

module.exports = { generateCareerGraph };
