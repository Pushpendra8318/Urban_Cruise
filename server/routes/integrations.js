const express = require('express');
const router = express.Router();
const {
  getIntegrationStatus,
  handleMetaWebhook,
  syncGoogleLeads,
  websiteSubmit,
  generateApiKey,
  getApiKeys,
  revokeApiKey,
} = require('../controllers/integrationController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public endpoint — no auth required
router.post('/website/submit', websiteSubmit);

// Meta webhook verification (GET) + lead receipt (POST)
router.get('/meta/webhook', handleMetaWebhook);
router.post('/meta/webhook', handleMetaWebhook);

// Protected routes
router.use(protect);
router.get('/status', getIntegrationStatus);
router.post('/google/sync', authorize('admin', 'manager'), syncGoogleLeads);
router.get('/api-keys', getApiKeys);
router.post('/api-keys', authorize('admin', 'manager'), generateApiKey);
router.delete('/api-keys/:id', authorize('admin', 'manager'), revokeApiKey);

module.exports = router;
