const pdfParse = require('pdf-parse');
const { prisma } = require('../config/db');
const { extractSkillsFromText } = require('../services/skillExtractor');

const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const { originalname, mimetype, buffer } = req.file;

    // Placeholder: parse PDF buffer into text. In production persist file to storage (S3, etc.)
    let text = '';
    if (mimetype === 'application/pdf') {
      const parsed = await pdfParse(buffer);
      text = parsed.text || '';
    }

    const resume = await prisma.resume.create({
      data: {
        userId: req.user.id,
        filename: originalname,
        mimetype,
        text,
      },
    });

    const extractedSkills = await extractSkillsFromText(text);

    res.status(201).json({ resumeId: resume.id, extractedSkills });
  } catch (err) {
    next(err);
  }
};

const getResumeById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const resume = await prisma.resume.findUnique({ where: { id } });
    if (!resume) return res.status(404).json({ message: 'Resume not found' });
    res.json(resume);
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadResume, getResumeById };
