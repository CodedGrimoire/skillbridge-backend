/**
 * Streamed import of job-skill relationships from CSV.
 * - Reads job_skills.csv without loading entire file to keep memory stable on 1M+ rows.
 * - Reuses a cached skill map to avoid duplicate lookups/creates.
 * - Batches inserts (500) with pause/resume to avoid overwhelming the database.
 * - Only links skills for the first 50k imported jobs (matches job import limit).
 */
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { prisma } = require('../config/db');

const JOB_SKILLS_FILE = process.env.JOB_SKILLS_FILE || path.join(process.cwd(), 'datasets', 'job_skills.csv');
const BATCH_SIZE = 500;
const LIMIT = 50000; // process at most 50k mappings (dev safety)
const PROGRESS_STEP = 1000;

async function importJobSkills() {
  if (!fs.existsSync(JOB_SKILLS_FILE)) {
    throw new Error(`job_skills.csv not found at ${JOB_SKILLS_FILE}`);
  }

  console.log('Loading jobs into memory...');
  // Build job lookup to avoid per-row DB queries; load only necessary columns
  const jobs = await prisma.job.findMany({
    select: { id: true, sourceUrl: true },
  });
  console.log(`Loaded ${jobs.length} jobs into memory`);
  const jobMap = new Map();
  jobs.forEach((job) => {
    if (job.sourceUrl) jobMap.set(job.sourceUrl, job.id);
  });
  console.log(`Job lookup map created with ${jobMap.size} entries`);

  // cache skill ids to reduce repeated upserts, but still use upsert to satisfy requirement
  const skillCache = new Map();

  let batch = [];
  let processed = 0;
  let linked = 0;
  let processedJobs = 0;
  let matched = 0;
  let rowsScanned = 0;
  const matchedJobIds = new Set();
  let streamError = null;

  const stream = fs.createReadStream(JOB_SKILLS_FILE).pipe(csv());

  stream.on('error', (err) => {
    streamError = err;
    console.error('CSV parsing error:', err);
    stream.destroy(err);
  });

  try {
    console.log(`Dataset path: ${JOB_SKILLS_FILE}`);
    console.log('Beginning CSV scan...');
    console.log('Starting job skill import...');
    for await (const row of stream) {
      processed += 1;
      rowsScanned += 1;
      try {
        const jobLink = row.job_link?.trim();
        const skillList = row.job_skills?.split(',').map((s) => s.trim()).filter(Boolean) || [];
        if (!jobLink || !skillList.length) continue;

        const jobId = jobMap.get(jobLink);
        if (!jobId) {
          if (rowsScanned % 10000 === 0) {
            console.log(`Scanned ${rowsScanned} rows... matched ${matched} jobs`);
          }
          continue; // only link already-imported jobs
        }

        matched += 1;
        matchedJobIds.add(jobId);
        if (matchedJobIds.size > LIMIT) {
          console.log(`Reached job processing limit ${LIMIT}, stopping stream.`);
          stream.destroy();
          break;
        }

        for (const skillName of skillList) {
          const cacheKey = skillName.toLowerCase();
          let skillId = skillCache.get(cacheKey);
          if (!skillId) {
            const skill = await prisma.skill.upsert({
              where: { name: skillName },
              update: {},
              create: { name: skillName },
            });
            skillId = skill.id;
            skillCache.set(cacheKey, skillId);
          }
          batch.push({ jobId, skillId });
          linked += 1;
        }

        if (batch.length >= BATCH_SIZE) {
          stream.pause();
          await prisma.jobSkill.createMany({ data: batch, skipDuplicates: true });
          batch = [];
          stream.resume();
        }

        if (processed > 0 && processed % PROGRESS_STEP === 0) {
          console.log(`Processed ${processed} rows, matched ${matched} jobs`);
        }
        if (linked > 0 && linked % PROGRESS_STEP === 0) {
          console.log(`Imported ${linked} skill mappings`);
        }
        if (rowsScanned % 10000 === 0) {
          console.log(`Scanned ${rowsScanned} rows... matched ${matched} jobs`);
        }

        if (matched >= LIMIT) {
          console.log('Reached 50k matched jobs, stopping scan');
          stream.destroy();
          break;
        }
      } catch (err) {
        console.warn(`Row ${processed} skipped: ${err.message}`);
      }
    }
  } catch (err) {
    streamError = streamError || err;
  }

  if (batch.length) {
    await prisma.jobSkill.createMany({ data: batch, skipDuplicates: true });
  }

  if (streamError) throw streamError;

  console.log('Skill import complete');
  console.log(`Total mappings imported: ${linked}`);
}

importJobSkills()
  .catch((err) => {
    console.error('Import failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
