const { generateRoleRoadmap } = require('../services/llm.service');
const { analyzeUserProgress } = require('../services/roadmap.service');

// POST /api/roadmap/generate
const generateRoadmap = async (req, res) => {
  try {
    const { role } = req.body || {};
    if (!role) {
      return res.status(400).json({ message: 'Role is required' });
    }
    const roadmap = await generateRoleRoadmap(role);
    return res.json({ roadmap });
  } catch (err) {
    console.error('generateRoadmap error', err);
    return res.status(500).json({ message: 'Unable to generate roadmap, using default' });
  }
};

// POST /api/roadmap/analyze
const analyzeRoadmap = async (req, res) => {
  try {
    const { role, userSkills = [] } = req.body || {};
    if (!role) {
      return res.status(400).json({ message: 'Role is required' });
    }

    const roadmap = await generateRoleRoadmap(role);
    const analysis = analyzeUserProgress(roadmap, userSkills);

    return res.json({ roadmap, analysis });
  } catch (err) {
    console.error('analyzeRoadmap error', err);
    return res.status(500).json({
      message: 'Unable to analyze roadmap right now. Using default.',
    });
  }
};

module.exports = { generateRoadmap, analyzeRoadmap };
