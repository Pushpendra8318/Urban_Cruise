const Lead = require('../models/Lead');
const ApiKey = require('../models/ApiKey');
const { v4: uuidv4 } = require('uuid');
const metaService = require('../services/metaService');
const googleService = require('../services/googleService');
const smsService = require('../services/smsService');
const logger = require('../utils/logger');

const getIntegrationStatus = async (req, res, next) => {
  try {
    const websiteKey = await ApiKey.findOne({ source: 'website', isActive: true, createdBy: req.user._id });
    res.json({
      meta: {
        connected: !!(process.env.META_APP_ID && process.env.META_APP_SECRET),
        appId: process.env.META_APP_ID || null,
        webhookUrl: `${process.env.SERVER_URL || 'http://localhost:5000'}/api/integrations/meta/webhook`,
        verifyToken: process.env.META_VERIFY_TOKEN || null,
      },
      google: {
        connected: googleService.isConfigured(),
        clientId: process.env.GOOGLE_ADS_CLIENT_ID || null,
        customerId: process.env.GOOGLE_ADS_CUSTOMER_ID || null,
      },
      sms: {
        connected: smsService.isConfigured(),
        fromNumber: process.env.TWILIO_FROM_NUMBER || null,
      },
      website: {
        connected: !!websiteKey,
        apiKey: websiteKey ? websiteKey.key : null,
        submitUrl: `${process.env.SERVER_URL || 'http://localhost:5000'}/api/integrations/website/submit`,
      },
    });
  } catch (err) {
    next(err);
  }
};

const handleMetaWebhook = async (req, res, next) => {
  try {
    if (req.method === 'GET') {
      const mode = req.query['hub.mode'];
      const token = req.query['hub.verify_token'];
      const challenge = req.query['hub.challenge'];
      if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
        return res.status(200).send(challenge);
      }
      return res.status(403).json({ message: 'Verification failed' });
    }

    const { entry } = req.body;
    if (!entry) return res.sendStatus(200);

    for (const pageEntry of entry) {
      for (const change of (pageEntry.changes || [])) {
        if (change.field === 'leadgen') {
          const leadData = change.value;
          try {
            const formData = await metaService.fetchLeadData(leadData.leadgen_id, leadData.page_id);
            const existing = await Lead.findOne({ metaLeadId: String(leadData.leadgen_id) });
            if (!existing) {
              await Lead.create({
                name: formData.name || 'Unknown',
                email: formData.email || '',
                phone: formData.phone || '',
                source: 'meta',
                campaign: formData.campaign_name || '',
                adName: formData.ad_name || '',
                adSetName: formData.adset_name || '',
                formId: String(leadData.form_id || ''),
                pageId: String(leadData.page_id || ''),
                metaLeadId: String(leadData.leadgen_id),
                status: 'new',
                statusHistory: [{ status: 'new' }],
              });
            }
          } catch (e) {
            logger.error('Meta lead processing error:', e.message);
          }
        }
      }
    }

    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
};

const syncGoogleLeads = async (req, res, next) => {
  try {
    const leads = await googleService.fetchLeads();
    let created = 0;
    for (const gl of leads) {
      const exists = await Lead.findOne({ googleLeadId: gl.id });
      if (!exists) {
        await Lead.create({
          name: gl.name || 'Unknown',
          email: gl.email || '',
          phone: gl.phone || '',
          source: 'google',
          campaign: gl.campaign || '',
          keyword: gl.keyword || '',
          googleLeadId: gl.id,
          status: 'new',
          statusHistory: [{ status: 'new' }],
        });
        created++;
      }
    }
    res.json({ message: `Synced ${created} new leads from Google Ads` });
  } catch (err) {
    next(err);
  }
};

const websiteSubmit = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) return res.status(401).json({ message: 'API key required' });

    const keyDoc = await ApiKey.findOne({ key: apiKey, source: 'website', isActive: true });
    if (!keyDoc) return res.status(401).json({ message: 'Invalid API key' });

    keyDoc.lastUsed = new Date();
    await keyDoc.save();

    const { name, email, phone, service, utmSource, utmMedium, utmCampaign } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const lead = await Lead.create({
      name,
      email: email || '',
      phone: phone || '',
      source: 'website',
      service: service || '',
      utmSource: utmSource || '',
      utmMedium: utmMedium || '',
      utmCampaign: utmCampaign || '',
      campaign: utmCampaign || '',
      status: 'new',
      statusHistory: [{ status: 'new' }],
    });

    res.status(201).json({ message: 'Lead submitted successfully', id: lead._id });
  } catch (err) {
    next(err);
  }
};

const generateApiKey = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Key name is required' });
    const key = `lf_${uuidv4().replace(/-/g, '')}`;
    const apiKey = await ApiKey.create({ name, key, createdBy: req.user._id, source: 'website' });
    res.status(201).json(apiKey);
  } catch (err) {
    next(err);
  }
};

const getApiKeys = async (req, res, next) => {
  try {
    const keys = await ApiKey.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json(keys);
  } catch (err) {
    next(err);
  }
};

const revokeApiKey = async (req, res, next) => {
  try {
    await ApiKey.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'API key revoked' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getIntegrationStatus,
  handleMetaWebhook,
  syncGoogleLeads,
  websiteSubmit,
  generateApiKey,
  getApiKeys,
  revokeApiKey,
};
