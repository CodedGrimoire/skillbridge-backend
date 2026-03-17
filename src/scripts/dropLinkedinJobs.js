/**
 * Danger: Drops the "Job" table and all dependent relations.
 * Run only if you are sure you want to remove all LinkedIn job data and related mappings.
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Dropping table "Job" with CASCADE...');
  await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "Job" CASCADE;');
  console.log('Done. "Job" table dropped.');
}

main()
  .catch((err) => {
    console.error('Drop failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
