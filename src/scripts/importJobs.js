/**
 * High-performance streaming CSV importer for large job datasets (1.3M+ rows).
 * - Streams rows to avoid loading whole file in memory.
 * - Batches inserts (500) with prisma.createMany for throughput.
 * - Hard limit of 50k rows by default (override via IMPORT_LIMIT env) for safer dev runs.
 * - Logs progress every 1000 rows.
 *
 * Dataset expected at: backend/datasets/linkedin_jobs.csv
 * Columns: job_title, company_name, job_location, job_description, posted_date
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { PrismaClient } = require('@prisma/client');
const { extractSkillsFromJobDescription } = require('../services/jobSkillExtractor');

const prisma = new PrismaClient();

const DATASET_PATH = process.env.JOBS_DATASET_PATH || path.join(process.cwd(), 'datasets', 'linkedin_jobs.csv');
const BATCH_SIZE = 500;
const IMPORT_LIMIT = parseInt(process.env.IMPORT_LIMIT || '50000', 10);
const PROGRESS_EVERY = 1000;

async function flushBatch(batch) {
  if (!batch.length) return;
  await prisma.job.createMany({ data: batch, skipDuplicates: true });
  batch.length = 0;
}

async function main() {
  if (!fs.existsSync(DATASET_PATH)) {
    console.error(`Dataset not found at ${DATASET_PATH}`);
    process.exit(1);
  }

  const batch = [];
  let imported = 0;
  let processed = 0;
  let skipped = 0;

  const stream = fs.createReadStream(DATASET_PATH).pipe(csv());

  for await (const row of stream) {
    processed += 1;

    try {
      const title = row.job_title?.trim();
      const company = row.company_name?.trim();
      if (!title || !company) {
        skipped += 1;
        continue;
      }

      const description = row.job_description || '';
      const skills = await extractSkillsFromJobDescription(description);
      const datePosted = row.posted_date ? new Date(row.posted_date) : null;

      batch.push({
        title,
        company,
        location: row.job_location || 'Unknown',
        description,
        skills,
        datePosted,
        source: 'linkedin_csv',
      });

      if (batch.length >= BATCH_SIZE) {
        await flushBatch(batch);
      }

      imported += 1;
      if (imported % PROGRESS_EVERY === 0) {
        console.log(`Imported ${imported} jobs...`);
      }

      if (imported >= IMPORT_LIMIT) {
        console.log(`Reached import limit (${IMPORT_LIMIT}). Stopping early.`);
        break;
      }
    } catch (err) {
      skipped += 1;
      console.warn(`Skipping row ${processed} due to error: ${err.message}`);
    }
  }

  await flushBatch(batch);

  console.log('Job dataset import completed.');
  console.log(`Total processed: ${processed}`);
  console.log(`Total imported: ${imported}`);
  console.log(`Total skipped: ${skipped}`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('Import failed:', err);
  await prisma.$disconnect();
  process.exit(1);
});
