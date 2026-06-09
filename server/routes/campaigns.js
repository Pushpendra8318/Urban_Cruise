const express = require('express');
const router = express.Router();
const { getCampaigns, getSources, createCampaign, updateCampaign, deleteCampaign } = require('../controllers/campaignController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.get('/', getCampaigns);
router.get('/sources', getSources);
router.post('/', authorize('admin', 'manager'), createCampaign);
router.put('/:id', authorize('admin', 'manager'), updateCampaign);
router.delete('/:id', authorize('admin'), deleteCampaign);

module.exports = router;
