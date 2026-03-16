const { PrismaClient } = require('@prisma/client');

// Single Prisma client instance to reuse across the app
const prisma = new PrismaClient();

module.exports = { prisma };
