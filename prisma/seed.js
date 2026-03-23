const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const jobRoles = [
  { title: 'Frontend Developer', description: 'Builds user-facing web interfaces' },
  { title: 'Backend Developer', description: 'Builds server-side APIs and services' },
  { title: 'Full Stack Developer', description: 'Delivers end-to-end web features' },
  { title: 'Data Analyst', description: 'Analyzes data to generate insights' },
  { title: 'Machine Learning Engineer', description: 'Builds and deploys ML models' },
];

const skills = [
  'HTML',
  'CSS',
  'JavaScript',
  'React',
  'Next.js',
  'Tailwind',
  'Node.js',
  'Express.js',
  'REST API',
  'PostgreSQL',
  'Prisma',
  'MongoDB',
  'Docker',
  'Git',
  'Linux',
  'Python',
  'Machine Learning',
  'Pandas',
  'TensorFlow',
];

const roleSkillMappings = [
  {
    role: 'Frontend Developer',
    skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Next.js', 'Tailwind'],
  },
  {
    role: 'Backend Developer',
    skills: ['Node.js', 'Express.js', 'REST API', 'PostgreSQL', 'Prisma', 'Docker'],
  },
  {
    role: 'Full Stack Developer',
    skills: ['React', 'Node.js', 'PostgreSQL', 'Prisma', 'REST API', 'Docker', 'Git'],
  },
  {
    role: 'Data Analyst',
    skills: ['Python', 'Pandas', 'PostgreSQL', 'Machine Learning'],
  },
  {
    role: 'Machine Learning Engineer',
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'Pandas', 'Docker'],
  },
];

async function seed() {
  console.log('Seeding Job Roles...');
  const roleMap = {};
  for (const role of jobRoles) {
    const existing = await prisma.jobRole.findFirst({ where: { title: role.title } });
    const record = existing
      ? await prisma.jobRole.update({
          where: { id: existing.id },
          data: { description: role.description },
        })
      : await prisma.jobRole.create({ data: { title: role.title, description: role.description } });
    roleMap[role.title] = record;
  }

  console.log('Seeding Skills...');
  const skillMap = {};
  for (const name of skills) {
    const record = await prisma.skill.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    skillMap[name] = record;
  }

  console.log('Seeding RoleSkill mappings...');
  for (const mapping of roleSkillMappings) {
    const role = roleMap[mapping.role];
    if (!role) {
      console.warn(`Skipping mapping for missing role: ${mapping.role}`);
      continue;
    }

    for (const skillName of mapping.skills) {
      const skill = skillMap[skillName];
      if (!skill) {
        console.warn(`Skipping mapping for missing skill: ${skillName}`);
        continue;
      }

      await prisma.roleSkill.upsert({
        where: {
          roleId_skillId: {
            roleId: role.id,
            skillId: skill.id,
          },
        },
        update: { importanceLevel: 3 },
        create: {
          roleId: role.id,
          skillId: skill.id,
          importanceLevel: 3,
        },
      });
    }
  }

  console.log('Seeding Users (mentors and jobseekers)...');
  const users = [
    { name: 'Maya Mentor', email: 'mentor1@example.com', role: 'ADMIN' },
    { name: 'Noah Mentor', email: 'mentor2@example.com', role: 'ADMIN' },
    { name: 'Ava Jobseeker', email: 'user1@example.com', role: 'USER' },
    { name: 'Liam Jobseeker', email: 'user2@example.com', role: 'USER' },
    { name: 'Olivia Jobseeker', email: 'user3@example.com', role: 'USER' },
    { name: 'Ethan Jobseeker', email: 'user4@example.com', role: 'USER' },
  ];
  const passwordHash = await bcrypt.hash('Passw0rd!', 10);
  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role },
      create: { name: u.name, email: u.email, password: passwordHash, role: u.role },
    });
  }

  console.log('Seeding Courses for mentors...');
  const mentor1 = await prisma.user.findUnique({ where: { email: 'mentor1@example.com' } });
  const mentor2 = await prisma.user.findUnique({ where: { email: 'mentor2@example.com' } });
  const courses = [
    {
      title: 'Frontend Foundations with React',
      description: 'Build production-grade UIs with React, hooks, and modern patterns.',
      price: 9900,
      mentorId: mentor1?.id,
    },
    {
      title: 'Backend APIs with Node & Prisma',
      description: 'Design, build, and ship secure REST APIs using Node.js, Express, and Prisma.',
      price: 10900,
      mentorId: mentor1?.id,
    },
    {
      title: 'DevOps for Web Teams',
      description: 'Practical Docker, CI/CD, and deployment strategies for web engineers.',
      price: 12900,
      mentorId: mentor2?.id,
    },
  ].filter((c) => c.mentorId);

  for (const c of courses) {
    await prisma.course.upsert({
      where: { title_mentorId: { title: c.title, mentorId: c.mentorId } },
      update: { description: c.description, price: c.price },
      create: c,
    });
  }
}

seed()
  .then(() => console.log('Seeding complete.'))
  .catch((err) => {
    console.error('Seeding failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
