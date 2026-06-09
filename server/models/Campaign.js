const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  source: { type: String, enum: ['website', 'meta', 'google', 'manual'], required: true },
  platform: { type: String, trim: true, default: '' },
  budget: { type: Number, default: 0 },
  leads: { type: Number, default: 0 },
  conversions: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  externalId: { type: String, default: '' },
  startDate: { type: Date, default: null },
  endDate: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Campaign', campaignSchema);
