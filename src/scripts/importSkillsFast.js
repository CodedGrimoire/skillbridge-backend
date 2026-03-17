/**
 * High-performance job skill importer using PostgreSQL COPY into a staging table.
 * Steps:
 * 1) Create TEMP TABLE temp_job_skills(job_link, job_skills)
 * 2) COPY CSV into temp table
 * 3) Insert missing skills
 * 4) Insert job-skill relations by matching Job.sourceUrl to job_link
 *
 * Note: COPY FROM file runs on the database server. Ensure the datasets path
 * is accessible to the Postgres instance or use an absolute path there.
 */
const path = require('path');
const { Client } = require('pg');
const copyFrom = require('pg-copy-streams').from;
const fs = require('fs');
require('dotenv').config();

const DATASET_PATH = path.join(process.cwd(), 'datasets', 'job_skills.csv');
const ROW_LIMIT = parseInt(process.env.ROW_LIMIT || '500000', 10); // cap rows to fit storage

const CREATE_TEMP_SQL = `
  CREATE EXTENSION IF NOT EXISTS "pgcrypto";
  CREATE TEMP TABLE temp_job_skills (
    job_link TEXT,
    job_skills TEXT
  );
`;

const INSERT_SKILLS_SQL = `
  INSERT INTO "Skill"(id, name)
  SELECT gen_random_uuid(), trimmed.skill
  FROM (
    SELECT DISTINCT trim(skill) AS skill
    FROM (
      SELECT unnest(string_to_array(job_skills, ',')) AS skill
      FROM temp_job_skills
      LIMIT $1
    ) s
    WHERE trim(skill) <> ''
  ) trimmed
  ON CONFLICT (name) DO NOTHING;
`;

const INSERT_JOB_SKILLS_SQL = `
  INSERT INTO "JobSkill"("jobId", "skillId")
  SELECT j.id, s.id
  FROM temp_job_skills t
  WHERE t.ctid IN (SELECT ctid FROM temp_job_skills LIMIT $1)
  JOIN "Job" j ON j."sourceUrl" = t.job_link
  JOIN LATERAL unnest(string_to_array(t.job_skills, ',')) skill_name(skill)
  JOIN "Skill" s ON s.name = trim(skill)
  ON CONFLICT DO NOTHING;
`;

async function main() {
  console.log('Starting fast skill import...');
  console.log(`Dataset path: ${DATASET_PATH}`);

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    await client.query('BEGIN');

    // Staging load
    console.log('Loading CSV into staging table via COPY (STDIN)...');
    await client.query(CREATE_TEMP_SQL);
    await new Promise((resolve, reject) => {
      const stream = client.query(
        copyFrom('COPY temp_job_skills(job_link, job_skills) FROM STDIN WITH (FORMAT csv, HEADER true)')
      );
      const fileStream = fs.createReadStream(DATASET_PATH);
      fileStream.on('error', reject);
      stream.on('error', reject);
      stream.on('finish', resolve);
      fileStream.pipe(stream);
    });
    console.log('CSV loaded into staging table');

    console.log('Inserting skills...');
    await client.query(INSERT_SKILLS_SQL);
    console.log('Skills inserted');

    console.log('Creating job-skill relations...');
    await client.query(INSERT_JOB_SKILLS_SQL);
    console.log('Job-skill relations created');

    await client.query('COMMIT');
    console.log('Fast import complete');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Fast skill import failed:', err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main();
