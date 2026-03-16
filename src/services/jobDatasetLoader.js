const fs = require('fs/promises');
const path = require('path');
const { prisma } = require('../config/db');
const { extractSkillsFromJobDescription } = require('./jobSkillExtractor');

/**
 * Load jobs from a JSON or CSV dataset file, normalize, extract skills, and persist.
 */
async function loadJobsFromDataset(filePath, source = 'dataset') {
  const ext = path.extname(filePath).toLowerCase();
  const raw = await fs.readFile(filePath, 'utf-8');

  let jobs = [];
  if (ext === '.json') {
    jobs = JSON.parse(raw);
  } else if (ext === '.csv') {
    const [headerLine, ...lines] = raw.split(/\r?\n/).filter(Boolean);
    const headers = headerLine.split(',').map((h) => h.trim());
    jobs = lines.map((line) => {
      const cols = line.split(',');
      return headers.reduce((acc, h, idx) => {
        acc[h] = cols[idx];
        return acc;
      }, {});
    });
  } else {
    throw new Error('Unsupported file format. Use JSON or CSV.');
  }

  let inserted = 0;
  for (const job of jobs) {
    const title = job.title?.trim();
    const company = job.company?.trim();
    if (!title || !company) continue;

    const description = job.description || '';
    const skills = await extractSkillsFromJobDescription(description);

    await prisma.job.create({
      data: {
        title,
        company,
        location: job.location || 'Unknown',
        description,
        skills,
        salary: job.salary || null,
        source,
      },
    });
    inserted += 1;
  }

  return inserted;
}

module.exports = { loadJobsFromDataset };
