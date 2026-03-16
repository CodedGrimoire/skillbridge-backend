/**
 * CSV importer for job datasets (datasets/jobs.csv by default).
 * Normalizes fields, extracts skills from description, and persists to Job table.
 */
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { prisma } = require('../config/db');
const { extractSkillsFromJobDescription } = require('../services/jobSkillExtractor');

const DATASET_PATH = process.env.JOBS_DATASET_PATH || path.join(process.cwd(), 'datasets', 'jobs.csv');

async function main() {
  if (!fs.existsSync(DATASET_PATH)) {
    console.error(`Dataset not found at ${DATASET_PATH}`);
    process.exit(1);
  }

  let inserted = 0;
  const stream = fs.createReadStream(DATASET_PATH).pipe(csv());

  for await (const row of stream) {
    try {
      const title = row.title?.trim();
      const company = row.company?.trim();
      if (!title || !company) continue;

      const description = row.description || '';
      const skills = await extractSkillsFromJobDescription(description);
      const datePosted = row.date_posted ? new Date(row.date_posted) : null;

      await prisma.job.create({
        data: {
          title,
          company,
          location: row.location || 'Unknown',
          description,
          skills,
          datePosted,
          source: 'dataset',
        },
      });
      inserted += 1;
    } catch (err) {
      console.warn('Skipping record due to error:', err.message);
    }
  }

  console.log(`Imported ${inserted} jobs from ${DATASET_PATH}`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
