const Lead = require('../models/Lead');
const Campaign = require('../models/Campaign');
const dayjs = require('dayjs');

const roleFilter = (user) =>
  user.role === 'sales_rep' ? { assignedTo: user._id } : {};

const getSummary = async (req, res, next) => {
  try {
    const base = roleFilter(req.user);
    const today = dayjs().startOf('day').toDate();
    const monthAgo = dayjs().subtract(30, 'day').startOf('day').toDate();

    const [total, todayCount, monthCount, byStatus] = await Promise.all([
      Lead.countDocuments(base),
      Lead.countDocuments({ ...base, createdAt: { $gte: today } }),
      Lead.countDocuments({ ...base, createdAt: { $gte: monthAgo } }),
      Lead.aggregate([
        { $match: base },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    const statusMap = {};
    byStatus.forEach((s) => { statusMap[s._id] = s.count; });

    res.json({
      total,
      todayCount,
      monthCount,
      converted: statusMap.converted || 0,
      conversionRate: total > 0 ? parseFloat(((statusMap.converted || 0) / total * 100).toFixed(1)) : 0,
      byStatus: statusMap,
    });
  } catch (err) {
    next(err);
  }
};

const getBySource = async (req, res, next) => {
  try {
    const base = roleFilter(req.user);
    const data = await Lead.aggregate([
      { $match: base },
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json(data.map((d) => ({ source: d._id, count: d.count })));
  } catch (err) {
    next(err);
  }
};

const getOverTime = async (req, res, next) => {
  try {
    const base = roleFilter(req.user);
    const { period = '30d' } = req.query;
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
    const startDate = dayjs().subtract(days, 'day').startOf('day').toDate();

    const data = await Lead.aggregate([
      { $match: { ...base, createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
      const found = data.find((d) => d._id === date);
      result.push({ date, count: found ? found.count : 0 });
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
};

const getFunnel = async (req, res, next) => {
  try {
    const base = roleFilter(req.user);
    const statuses = ['new', 'contacted', 'qualified', 'converted', 'lost'];
    const data = await Lead.aggregate([
      { $match: base },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const map = {};
    data.forEach((d) => { map[d._id] = d.count; });
    res.json(statuses.map((s) => ({ status: s, count: map[s] || 0 })));
  } catch (err) {
    next(err);
  }
};

const getCampaigns = async (req, res, next) => {
  try {
    const campaigns = await Campaign.find().sort({ leads: -1 }).limit(20);
    res.json(campaigns);
  } catch (err) {
    next(err);
  }
};

module.exports = { getSummary, getBySource, getOverTime, getFunnel, getCampaigns };
