const axios = require('axios');
const logger = require('../utils/logger');

const META_API_BASE = 'https://graph.facebook.com/v18.0';

const getAccessToken = () => {
  return process.env.META_ACCESS_TOKEN || `${process.env.META_APP_ID}|${process.env.META_APP_SECRET}`;
};

const fetchLeadData = async (leadgenId, pageId) => {
  try {
    const accessToken = getAccessToken();
    const response = await axios.get(`${META_API_BASE}/${leadgenId}`, {
      params: { access_token: accessToken },
    });

    const fieldData = response.data.field_data || [];
    const lead = {};

    fieldData.forEach((field) => {
      const val = field.values?.[0] || '';
      const key = field.name.toLowerCase();
      if (key === 'full_name' || key === 'name') lead.name = val;
      else if (key === 'email') lead.email = val;
      else if (key === 'phone_number' || key === 'phone') lead.phone = val;
      else lead[field.name] = val;
    });

    if (response.data.ad_id) {
      try {
        const adRes = await axios.get(`${META_API_BASE}/${response.data.ad_id}`, {
          params: { fields: 'name,adset_id', access_token: accessToken },
        });
        lead.ad_name = adRes.data.name;

        if (adRes.data.adset_id) {
          const adSetRes = await axios.get(`${META_API_BASE}/${adRes.data.adset_id}`, {
            params: { fields: 'name,campaign_id', access_token: accessToken },
          });
          lead.adset_name = adSetRes.data.name;

          if (adSetRes.data.campaign_id) {
            const campRes = await axios.get(`${META_API_BASE}/${adSetRes.data.campaign_id}`, {
              params: { fields: 'name', access_token: accessToken },
            });
            lead.campaign_name = campRes.data.name;
          }
        }
      } catch (e) {
        logger.warn('Could not fetch Meta ad info:', e.message);
      }
    }

    return lead;
  } catch (err) {
    logger.error('Meta fetchLeadData error:', err.response?.data || err.message);
    return {};
  }
};

const subscribePageToApp = async (pageId, pageAccessToken) => {
  try {
    const response = await axios.post(
      `${META_API_BASE}/${pageId}/subscribed_apps`,
      { subscribed_fields: 'leadgen' },
      { params: { access_token: pageAccessToken } }
    );
    return response.data;
  } catch (err) {
    logger.error('Meta subscribePageToApp error:', err.response?.data || err.message);
    throw err;
  }
};

module.exports = { fetchLeadData, subscribePageToApp };
