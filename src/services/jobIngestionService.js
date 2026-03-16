const { prisma } = require('../config/db');
const { extractSkillsFromJob } = require('./jobSkillExtractor');
const { getSkillDemand } = require('./marketAnalyzer');

/**
 * Ingest a list of job postings, normalize, extract skills, and persist.
 * Returns count of successfully inserted jobs.
 */
async function ingestJobs(jobList = [], source = 'manual') {
  let inserted = 0;
  for (const job of jobList) {
    const title = job.title?.trim();
    const company = job.company?.trim();
    const location = job.location?.trim() || 'Unknown';
    const description = job.description || '';

    if (!title || !company) continue;

    const detectedSkills = await extractSkillsFromJob(description);

    await prisma.job.create({
      data: {
        title,
        company,
        location,
        description,
        skills: detectedSkills,
        salary: job.salary || null,
        source: job.source || source,
      },
    });
    inserted += 1;
  }

  // Trigger recalculation side-effect (frequency map) for downstream cacheable usage
  await getSkillDemand();

  return inserted;
}

module.exports = { ingestJobs };
