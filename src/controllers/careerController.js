const { calculateSkillROI } = require('../services/skillRoiEngine');

// GET /api/career/skill-roi?skills=Docker,PostgreSQL
const skillRoi = async (req, res, next) => {
  try {
    const skillsParam = req.query.skills;
    const skills = skillsParam
      ? skillsParam.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    const roi = await calculateSkillROI(skills.map((s) => ({ skill: s })));
    res.json({ recommendedSkills: roi });
  } catch (err) {
    next(err);
  }
};

module.exports = { skillRoi };
