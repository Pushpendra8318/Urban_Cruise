const nodemailer = require('nodemailer');
const dayjs = require('dayjs');
const logger = require('../utils/logger');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendPasswordResetEmail = async (email, name, resetUrl) => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"LeadFlow CRM" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset Request — LeadFlow CRM',
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <div style="text-align:center;margin-bottom:30px">
          <div style="display:inline-block;background:#6366f1;color:white;width:40px;height:40px;border-radius:8px;line-height:40px;font-weight:bold;font-size:18px">LF</div>
          <h1 style="color:#0f172a;margin-top:12px">LeadFlow CRM</h1>
        </div>
        <h2 style="color:#1e293b">Reset Your Password</h2>
        <p style="color:#64748b">Hi ${name},</p>
        <p style="color:#64748b">Click the button below to reset your password. This link expires in <strong>1 hour</strong>.</p>
        <div style="text-align:center;margin:30px 0">
          <a href="${resetUrl}" style="background:#6366f1;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">
            Reset Password
          </a>
        </div>
        <p style="color:#94a3b8;font-size:13px">If you didn't request this, please ignore this email. Your password will remain unchanged.</p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0"/>
        <p style="color:#cbd5e1;font-size:12px;text-align:center">LeadFlow CRM — Urban Cruise</p>
      </div>
    `,
  });
  logger.info(`Password reset email sent to ${email}`);
};

const sendNewLeadAlert = async (adminEmail, lead) => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"LeadFlow CRM" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `New Lead: ${lead.name} via ${lead.source}`,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <div style="background:#6366f1;color:white;padding:16px 20px;border-radius:8px 8px 0 0">
          <h2 style="margin:0">New Lead Received</h2>
        </div>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-top:none;padding:20px;border-radius:0 0 8px 8px">
          <table style="width:100%;border-collapse:collapse">
            ${[['Name', lead.name], ['Email', lead.email || 'N/A'], ['Phone', lead.phone || 'N/A'],
               ['Source', lead.source], ['Campaign', lead.campaign || 'N/A'],
               ['Service', lead.service || 'N/A']].map(([k, v]) => `
            <tr>
              <td style="padding:10px 12px;background:#fff;border-bottom:1px solid #e2e8f0;font-weight:600;color:#374151;width:120px">${k}</td>
              <td style="padding:10px 12px;background:#fff;border-bottom:1px solid #e2e8f0;color:#6b7280">${v}</td>
            </tr>`).join('')}
          </table>
          <div style="text-align:center;margin-top:20px">
            <a href="${process.env.CLIENT_URL}/leads/${lead._id}" style="background:#6366f1;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">
              View Lead →
            </a>
          </div>
        </div>
      </div>
    `,
  });
};

const sendDailySummary = async () => {
  const User = require('../models/User');
  const Lead = require('../models/Lead');

  const admins = await User.find({
    role: { $in: ['admin', 'manager'] },
    isActive: true,
    'notificationPreferences.dailySummary': true,
  });

  if (!admins.length) {
    logger.info('No admins configured for daily summary');
    return;
  }

  const today = dayjs().startOf('day').toDate();
  const [todayCount, totalLeads, newLeads, converted, bySource] = await Promise.all([
    Lead.countDocuments({ createdAt: { $gte: today } }),
    Lead.countDocuments(),
    Lead.countDocuments({ status: 'new' }),
    Lead.countDocuments({ status: 'converted' }),
    Lead.aggregate([{ $group: { _id: '$source', count: { $sum: 1 } } }]),
  ]);

  const sourceBreakdown = bySource
    .map((s) => `<tr><td style="padding:6px 12px">${s._id}</td><td style="padding:6px 12px;font-weight:600">${s.count}</td></tr>`)
    .join('');

  const transporter = createTransporter();

  for (const admin of admins) {
    await transporter.sendMail({
      from: `"LeadFlow CRM" <${process.env.EMAIL_USER}>`,
      to: admin.email,
      subject: `Daily Summary — ${dayjs().format('MMMM D, YYYY')}`,
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;padding:20px">
          <h2 style="color:#6366f1">Daily Lead Summary</h2>
          <p style="color:#64748b">Hi ${admin.name}, here's your summary for <strong>${dayjs().format('MMMM D, YYYY')}</strong>:</p>
          <div style="display:flex;gap:12px;margin:20px 0;flex-wrap:wrap">
            ${[['New Today', todayCount, '#6366f1'], ['Total Leads', totalLeads, '#0ea5e9'],
               ['Awaiting', newLeads, '#f59e0b'], ['Converted', converted, '#10b981']].map(([label, val, color]) => `
            <div style="flex:1;min-width:120px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;text-align:center">
              <div style="font-size:28px;font-weight:700;color:${color}">${val}</div>
              <div style="font-size:12px;color:#64748b;margin-top:4px">${label}</div>
            </div>`).join('')}
          </div>
          ${sourceBreakdown ? `
          <h3 style="color:#1e293b">Leads by Source</h3>
          <table style="width:100%;border-collapse:collapse;background:#f8fafc;border-radius:8px;overflow:hidden">
            ${sourceBreakdown}
          </table>` : ''}
          <div style="text-align:center;margin-top:24px">
            <a href="${process.env.CLIENT_URL}/dashboard" style="background:#6366f1;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">
              Open Dashboard
            </a>
          </div>
        </div>
      `,
    }).catch((e) => logger.error(`Daily summary error for ${admin.email}:`, e.message));
  }

  logger.info(`Daily summary sent to ${admins.length} admins`);
};

module.exports = { sendPasswordResetEmail, sendNewLeadAlert, sendDailySummary };
