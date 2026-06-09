const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  text: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  changedAt: { type: Date, default: Date.now },
});

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true, default: '' },
  phone: { type: String, trim: true, default: '' },
  source: {
    type: String,
    enum: ['website', 'meta', 'google', 'manual'],
    required: true,
    default: 'manual',
  },
  campaign: { type: String, trim: true, default: '' },
  keyword: { type: String, trim: true, default: '' },
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'converted', 'lost'],
    default: 'new',
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  notes: [noteSchema],
  statusHistory: [statusHistorySchema],
  metaLeadId: { type: String, default: null },
  googleLeadId: { type: String, default: null },
  service: { type: String, trim: true, default: '' },
  adSetName: { type: String, trim: true, default: '' },
  adName: { type: String, trim: true, default: '' },
  formId: { type: String, trim: true, default: '' },
  pageId: { type: String, trim: true, default: '' },
  utmSource: { type: String, trim: true, default: '' },
  utmMedium: { type: String, trim: true, default: '' },
  utmCampaign: { type: String, trim: true, default: '' },
}, { timestamps: true });

leadSchema.index({ source: 1, status: 1, createdAt: -1 });
leadSchema.index({ email: 1 });
leadSchema.index({ assignedTo: 1 });

module.exports = mongoose.model('Lead', leadSchema);
