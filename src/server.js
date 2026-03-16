require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middleware/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const roleRoutes = require('./routes/roleRoutes');
const skillRoutes = require('./routes/skillRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const jobRoutes = require('./routes/jobRoutes');
const marketRoutes = require('./routes/marketRoutes');
const jobIngestionRoutes = require('./routes/jobIngestionRoutes');
const simulationRoutes = require('./routes/simulationRoutes');
const careerRoutes = require('./routes/careerRoutes');
const healthRoutes = require('./routes/healthRoutes');
const { prisma } = require('./config/db');

const app = express();

// Global middleware
app.use(cors());
app.use(express.json());

// Health check
app.use('/health', healthRoutes);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/jobs', jobIngestionRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/simulation', simulationRoutes);
app.use('/api/career', careerRoutes);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
