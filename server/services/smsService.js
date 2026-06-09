const twilio = require('twilio');
const logger = require('../utils/logger');

const isConfigured = () =>
  !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_FROM_NUMBER
  );

const sendSmsAlert = async (toNumber, lead) => {
  if (!isConfigured()) {
    logger.warn('Twilio credentials not configured — skipping SMS alert');
    return;
  }

  if (!toNumber) return;

  try {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    const body = [
      `New Lead — ${lead.name}`,
      `Source: ${lead.source}`,
      lead.phone ? `Phone: ${lead.phone}` : null,
      lead.email ? `Email: ${lead.email}` : null,
      `View: ${process.env.CLIENT_URL}/leads/${lead._id}`,
    ]
      .filter(Boolean)
      .join('\n');

    await client.messages.create({
      body,
      from: process.env.TWILIO_FROM_NUMBER,
      to: toNumber,
    });

    logger.info(`SMS alert sent to ${toNumber}`);
  } catch (err) {
    logger.error(`SMS alert error to ${toNumber}:`, err.message);
  }
};

module.exports = { sendSmsAlert, isConfigured };
