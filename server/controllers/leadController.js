const { validationResult } = require('express-validator');
const Lead = require('../models/Lead');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Campaign = require('../models/Campaign');
const paginate = require('../utils/paginate');
const { sendNewLeadAlert } = require('../services/emailService');
const { sendSmsAlert } = require('../services/smsService');

const getLeads = async (req, res, next) => {
  try {
    const { page, limit, status, source, assignedTo, from, to, search } = req.query;
    const { skip, limit: limitNum, page: pageNum } = paginate(page, limit);

    const filter = {};
    if (status) filter.status = status;
    if (source) filter.source = source;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to + 'T23:59:59.999Z');
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    if (req.user.role === 'sales_rep') {
      filter.assignedTo = req.user._id;
    }

    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .populate('assignedTo', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Lead.countDocuments(filter),
    ]);

    res.json({
      leads,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

const getLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('notes.createdBy', 'name')
      .populate('statusHistory.changedBy', 'name');

    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    if (req.user.role === 'sales_rep' && String(lead.assignedTo?._id) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(lead);
  } catch (err) {
    next(err);
  }
};

const createLead = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const leadData = { ...req.body };
    if (req.user.role === 'sales_rep' && !leadData.assignedTo) {
      leadData.assignedTo = req.user._id;
    }

    const lead = await Lead.create({
      ...leadData,
      statusHistory: [{ status: leadData.status || 'new', changedBy: req.user._id }],
    });

    if (req.body.campaign) {
      await Campaign.findOneAndUpdate(
        { name: req.body.campaign, source: req.body.source || 'manual' },
        { $inc: { leads: 1 } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    await notifyNewLead(lead, req.user).catch(() => {});

    const populated = await lead.populate('assignedTo', 'name email');
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

const updateLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    if (req.body.status && req.body.status !== lead.status) {
      lead.statusHistory.push({ status: req.body.status, changedBy: req.user._id });
      if (req.body.status === 'converted') {
        await Campaign.findOneAndUpdate(
          { name: lead.campaign, source: lead.source },
          { $inc: { conversions: 1 } }
        );
      }
    }

    const { statusHistory, notes, ...updateData } = req.body;
    Object.assign(lead, updateData);
    await lead.save();

    const populated = await lead.populate([
      { path: 'assignedTo', select: 'name email' },
      { path: 'notes.createdBy', select: 'name' },
      { path: 'statusHistory.changedBy', select: 'name' },
    ]);

    res.json(populated);
  } catch (err) {
    next(err);
  }
};

const deleteLead = async (req, res, next) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json({ message: 'Lead deleted successfully' });
  } catch (err) {
    next(err);
  }
};

const bulkUpdate = async (req, res, next) => {
  try {
    const { ids, update } = req.body;
    if (!ids || !Array.isArray(ids) || !update) {
      return res.status(400).json({ message: 'Invalid bulk update payload' });
    }

    if (update.status) {
      const leads = await Lead.find({ _id: { $in: ids } });
      for (const lead of leads) {
        if (lead.status !== update.status) {
          lead.statusHistory.push({ status: update.status, changedBy: req.user._id });
        }
        Object.assign(lead, update);
        await lead.save();
      }
    } else {
      await Lead.updateMany({ _id: { $in: ids } }, { $set: update });
    }

    res.json({ message: `${ids.length} leads updated` });
  } catch (err) {
    next(err);
  }
};

const addNote = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    lead.notes.push({ text: req.body.text, createdBy: req.user._id });
    await lead.save();

    const populated = await lead.populate('notes.createdBy', 'name');
    res.json(populated.notes[populated.notes.length - 1]);
  } catch (err) {
    next(err);
  }
};

async function notifyNewLead(lead, actor) {
  const admins = await User.find({ role: { $in: ['admin', 'manager'] }, isActive: true });
  const notifications = admins.map((admin) => ({
    user: admin._id,
    message: `New lead: ${lead.name} from ${lead.source}`,
    type: 'new_lead',
    leadId: lead._id,
  }));
  if (notifications.length) await Notification.insertMany(notifications);

  for (const admin of admins) {
    if (admin.notificationPreferences?.emailOnNewLead) {
      await sendNewLeadAlert(admin.email, lead).catch(() => {});
    }
    if (admin.notificationPreferences?.smsOnNewLead && admin.phone) {
      await sendSmsAlert(admin.phone, lead).catch(() => {});
    }
  }
}

module.exports = { getLeads, getLead, createLead, updateLead, deleteLead, bulkUpdate, addNote };
