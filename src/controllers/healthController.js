const Groq = require('groq-sdk');
const { prisma } = require('../config/db');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const checkServer = () => {
  try {
    const memory = process.memoryUsage();
    return {
      status: 'ok',
      uptimeSeconds: process.uptime(),
      pid: process.pid,
      memory: {
        rss: memory.rss,
        heapUsed: memory.heapUsed,
        heapTotal: memory.heapTotal,
      },
    };
  } catch (err) {
    return { status: 'error', message: err.message };
  }
};

const checkDatabase = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'ok' };
  } catch (err) {
    return { status: 'error', message: err.message };
  }
};

const checkGroq = async () => {
  if (!process.env.GROQ_API_KEY) {
    return { status: 'degraded', message: 'GROQ_API_KEY not configured' };
  }

  try {
    // Light-weight availability probe
    const models = await groq.models.list({ limit: 1 });
    const count = models?.data?.length ?? 0;
    return { status: 'ok', modelsDetected: count };
  } catch (err) {
    return { status: 'error', message: err.message };
  }
};

const health = async (_req, res) => {
  const [server, db, groqStatus] = await Promise.all([
    Promise.resolve(checkServer()),
    checkDatabase(),
    checkGroq(),
  ]);

  const status = [server.status, db.status, groqStatus.status].every((s) => s === 'ok')
    ? 'ok'
    : 'degraded';

  res.json({
    status,
    timestamp: new Date().toISOString(),
    uptimeSeconds: server.uptimeSeconds,
    services: {
      server,
      database: db,
      groq: groqStatus,
    },
  });
};

module.exports = { health };
