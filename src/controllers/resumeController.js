const fs = require('fs/promises');
const pdfParse = require('pdf-parse');
const { prisma } = require('../config/db');
const { extractSkillsFromText } = require('../services/skillExtractor');

/**
 * Handle resume upload + processing pipeline:
 * 1) PDF arrives via multer into uploads/
 * 2) Read the file buffer and extract text with pdf-parse
 * 3) Persist resume metadata + extracted text
 * 4) Detect skills in the text and upsert UserSkill links
 * 5) Return detected skills
 */
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { filename, path: filePath, mimetype } = req.file;

    // Safety check: only PDFs should make it here due to middleware, but double-check.
    if (mimetype !== 'application/pdf') {
      return res.status(400).json({ message: 'Invalid file type. Only PDF files are allowed.' });
    }

    let extractedText = '';
    try {
      const buffer = await fs.readFile(filePath);
      const parsed = await pdfParse(buffer);
      extractedText = parsed.text || '';
    } catch (err) {
      return res.status(400).json({ message: 'Failed to parse PDF', detail: err.message });
    }

    // Persist resume record
    const resume = await prisma.resume.create({
      data: {
        userId: req.user.id,
        fileName: filename,
        fileUrl: filePath,
        extractedText,
      },
    });

    // Extract skills present in the text
    const detectedSkills = await extractSkillsFromText(extractedText);

    // Upsert detected skills for the user
    await Promise.all(
      detectedSkills.map((skill) =>
        prisma.userSkill.upsert({
          where: { userId_skillId: { userId: req.user.id, skillId: skill.id } },
          update: { confidenceScore: 0.8 },
          create: { userId: req.user.id, skillId: skill.id, confidenceScore: 0.8 },
        })
      )
    );

    res.status(201).json({
      message: 'Resume processed successfully',
      resumeId: resume.id,
      detectedSkills: detectedSkills.map((s) => s.name),
      preview: extractedText.slice(0, 500),
    });
  } catch (err) {
    next(err);
  }
};

const getResumeById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const resume = await prisma.resume.findUnique({ where: { id } });
    if (!resume) return res.status(404).json({ message: 'Resume not found' });
    res.json(resume);
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadResume, getResumeById };
