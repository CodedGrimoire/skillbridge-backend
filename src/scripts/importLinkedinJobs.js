/**
 * High-volume LinkedIn jobs importer using streaming CSV parsing and batch inserts.
 * - Streams rows (no full-file load) for memory safety with 1.3M+ rows.
 * - Inserts jobs in batches of 500 via createMany.
 * - Stops after 50k jobs (development safeguard).
 * - Imports job->skill mappings from job_skills.csv with on-demand skill creation.
 * - Logs progress every 1000 rows.
 */
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { PrismaClient } = require('@prisma/client');
const { extractSkillsFromJobDescription } = require('../services/jobSkillExtractor');

const prisma = new PrismaClient();

const JOBS_FILE = process.env.JOBS_FILE || path.join(process.cwd(), 'datasets', 'linkedin_job_postings.csv');
const JOB_SKILLS_FILE = process.env.JOB_SKILLS_FILE || path.join(process.cwd(), 'datasets', 'job_skills.csv');
const BATCH_SIZE = 500;
const LIMIT = 50000;
const PROGRESS_STEP = 1000;

async function loadExistingSkillsMap() {
  const skills = await prisma.skill.findMany({ select: { id: true, name: true } });
  const map = {};
  skills.forEach((s) => (map[s.name.toLowerCase()] = s.id));
  return map;
}

async function ensureSkill(name, cache) {
  const key = name.toLowerCase();
  if (cache[key]) return cache[key];
  const created = await prisma.skill.create({ data: { name } });
  cache[key] = created.id;
  return created.id;
}

async function importJobs() {
  if (!fs.existsSync(JOBS_FILE)) throw new Error(`Jobs file not found: ${JOBS_FILE}`);

  const batch = [];
  let imported = 0;
  let processed = 0;
  let invalid = 0;
  const externalIds = [];
  let limitReached = false;
  let streamError = null;

  const stream = fs.createReadStream(JOBS_FILE).pipe(csv());

  stream.on('error', (err) => {
    if (limitReached && err.code === 'ERR_STREAM_PREMATURE_CLOSE') return;
    streamError = err;
    console.error('CSV parsing error:', err);
    stream.destroy(err);
  });

  try {
    for await (const row of stream) {
      processed += 1;
      try {
        const title = row.job_title?.trim();
        const company = row.company?.trim();
        const location = row.job_location?.trim();
        const datePosted = row.first_seen ? new Date(row.first_seen) : null;
        const sourceUrl = row.job_link?.trim();

        if (!title || !company || !sourceUrl) {
          invalid += 1;
          continue;
        }

        batch.push({
          title,
          company,
          location: location || 'Unknown',
          datePosted,
          externalId: sourceUrl,
          source: 'linkedin_csv',
          sourceUrl,
        });

        externalIds.push(sourceUrl);
        imported += 1;

        if (batch.length >= BATCH_SIZE) {
          stream.pause();
          try {
            await prisma.job.createMany({ data: batch, skipDuplicates: true });
          } catch (err) {
            console.error('Database insert error:', err);
            stream.destroy(err);
            throw err;
          } finally {
            stream.resume();
          }
          batch.length = 0;
        }

        if (imported % PROGRESS_STEP === 0) {
          console.log(`Imported ${imported} jobs`);
        }

        if (imported >= LIMIT) {
          limitReached = true;
          console.log(`Reached job import limit ${LIMIT}, stopping stream.`);
          stream.destroy();
          break;
        }
      } catch (err) {
        console.warn(`Job row ${processed} skipped: ${err.message}`);
      }
    }
  } catch (err) {
    streamError = streamError || err;
  }

  if (batch.length) {
    try {
      await prisma.job.createMany({ data: batch, skipDuplicates: true });
    } catch (err) {
      console.error('Database insert error:', err);
      throw err;
    }
  }

  if (streamError) {
    throw streamError;
  }

  return { imported, externalIds, invalid, processed };
}

async function importJobSkills(externalIds) {
  if (!fs.existsSync(JOB_SKILLS_FILE)) {
    console.warn('job_skills.csv not found; skipping skill mapping import.');
    return;
  }

  // map externalId -> jobId to link skills
  const jobs = await prisma.job.findMany({
    where: { externalId: { in: externalIds } },
    select: { id: true, externalId: true },
  });
  const jobMap = jobs.reduce((acc, j) => {
    acc[j.externalId] = j.id;
    return acc;
  }, {});

  const skillCache = await loadExistingSkillsMap();
  const batch = [];
  let processed = 0;
  let linked = 0;

  const stream = fs.createReadStream(JOB_SKILLS_FILE).pipe(csv());
  for await (const row of stream) {
    processed += 1;
    try {
      const externalId = row.job_id?.toString();
      const skillName = row.skill?.trim();
      if (!externalId || !skillName) continue;
      const jobId = jobMap[externalId];
      if (!jobId) continue; // skip jobs not imported due to limit

      const skillId = await ensureSkill(skillName, skillCache);
      batch.push({ jobId, skillId });

      if (batch.length >= BATCH_SIZE) {
        await prisma.jobSkill.createMany({ data: batch, skipDuplicates: true });
        batch.length = 0;
      }

      linked += 1;
      if (linked % PROGRESS_STEP === 0) {
        console.log(`Linked ${linked} job-skill pairs...`);
      }
    } catch (err) {
      console.warn(`Skill row ${processed} skipped: ${err.message}`);
    }
  }

  if (batch.length) {
    await prisma.jobSkill.createMany({ data: batch, skipDuplicates: true });
  }
}

async function main() {
  try {
    console.log('Starting LinkedIn job import...');
    const { imported, externalIds } = await importJobs();
    console.log('Import finished');
    console.log(`Total jobs imported: ${imported}`);

    console.log('Importing job skill mappings...');
    await importJobSkills(externalIds);
    console.log('Skill mapping import complete.');
  } finally {
    await prisma.$disconnect();
    console.log('Import finished.');
  }
}

main().catch(async (err) => {
  console.error('Import failed:', err);
  await prisma.$disconnect();
  process.exit(1);
});
