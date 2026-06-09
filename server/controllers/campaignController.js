const Campaign = require('../models/Campaign');
const Lead = require('../models/Lead');

const getCampaigns = async (req, res, next) => {
  try {
    const campaigns = await Campaign.find().sort({ leads: -1 });
    res.json(campaigns);
  } catch (err) {
    next(err);
  }
};

const getSources = async (req, res, next) => {
  try {
    const data = await Lead.aggregate([
      {
        $group: {
          _id: '$source',
          total: { $sum: 1 },
          converted: {
            $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] },
          },
        },
      },
      { $sort: { total: -1 } },
    ]);
    res.json(data.map((d) => ({
      source: d._id,
      total: d.total,
      converted: d.converted,
      conversionRate: d.total > 0 ? parseFloat(((d.converted / d.total) * 100).toFixed(1)) : 0,
    })));
  } catch (err) {
    next(err);
  }
};

const createCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.create(req.body);
    res.status(201).json(campaign);
  } catch (err) {
    next(err);
  }
};

const updateCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    res.json(campaign);
  } catch (err) {
    next(err);
  }
};

const deleteCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findByIdAndDelete(req.params.id);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    res.json({ message: 'Campaign deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCampaigns, getSources, createCampaign, updateCampaign, deleteCampaign };
