require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const authRoutes = require('./routes/auth');
const leadRoutes = require('./routes/leads');
const userRoutes = require('./routes/users');
const analyticsRoutes = require('./routes/analytics');
const reportRoutes = require('./routes/reports');
const notificationRoutes = require('./routes/notifications');
const integrationRoutes = require('./routes/integrations');
const campaignRoutes = require('./routes/campaigns');

const { sendDailySummary } = require('./services/emailService');

const app = express();

connectDB();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/campaigns', campaignRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

app.use(errorHandler);

// Daily summary at 8 AM
cron.schedule('0 8 * * *', async () => {
  logger.info('Running daily summary cron');
  await sendDailySummary().catch((e) => logger.error('Daily summary failed:', e));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => logger.info(`LeadFlow CRM server running on port ${PORT}`));

module.exports = app;
