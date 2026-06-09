const { GoogleAdsApi } = require('google-ads-api');
const logger = require('../utils/logger');

const isConfigured = () =>
  !!(
    process.env.GOOGLE_ADS_CLIENT_ID &&
    process.env.GOOGLE_ADS_CLIENT_SECRET &&
    process.env.GOOGLE_ADS_DEVELOPER_TOKEN &&
    process.env.GOOGLE_ADS_REFRESH_TOKEN &&
    process.env.GOOGLE_ADS_CUSTOMER_ID
  );

const fetchLeads = async () => {
  if (!isConfigured()) {
    logger.warn('Google Ads credentials not configured — skipping sync');
    return [];
  }

  try {
    const client = new GoogleAdsApi({
      client_id: process.env.GOOGLE_ADS_CLIENT_ID,
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
      developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
    });

    const customer = client.Customer({
      customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID.replace(/-/g, ''),
      refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
    });

    const submissions = await customer.query(`
      SELECT
        lead_form_submission_data.id,
        lead_form_submission_data.lead_form_submission_fields,
        lead_form_submission_data.campaign,
        lead_form_submission_data.ad_group,
        lead_form_submission_data.gclid,
        lead_form_submission_data.submission_date_time
      FROM lead_form_submission_data
      ORDER BY lead_form_submission_data.submission_date_time DESC
      LIMIT 200
    `);

    return submissions.map((row) => {
      const data = row.lead_form_submission_data;
      const fields = {};

      for (const f of data.lead_form_submission_fields || []) {
        const type = (f.field_type || '').toLowerCase();
        const value = f.field_value || '';
        if (type === 'full_name' || type === 'first_name') fields.name = value;
        else if (type === 'last_name' && fields.name) fields.name += ` ${value}`;
        else if (type === 'last_name') fields.name = value;
        else if (type === 'email') fields.email = value;
        else if (type === 'phone_number') fields.phone = value;
      }

      // campaign resource name format: customers/xxx/campaigns/yyy — extract name from ad_group
      const campaignName = data.campaign
        ? data.campaign.split('/').pop()
        : '';

      return {
        id: data.id,
        name: fields.name || 'Unknown',
        email: fields.email || '',
        phone: fields.phone || '',
        campaign: campaignName,
        keyword: data.gclid || '',
        submittedAt: data.submission_date_time || null,
      };
    });
  } catch (err) {
    logger.error('Google Ads fetchLeads error:', err.message);
    throw err;
  }
};

module.exports = { fetchLeads, isConfigured };
