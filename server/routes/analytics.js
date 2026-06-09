const express = require('express');
const router = express.Router();
const { getSummary, getBySource, getOverTime, getFunnel, getCampaigns } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/summary', getSummary);
router.get('/by-source', getBySource);
router.get('/over-time', getOverTime);
router.get('/funnel', getFunnel);
router.get('/campaigns', getCampaigns);

module.exports = router;
