const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  key: { type: String, required: true, unique: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true },
  lastUsed: { type: Date, default: null },
  source: { type: String, enum: ['website', 'meta', 'google', 'custom'], default: 'website' },
}, { timestamps: true });

module.exports = mongoose.model('ApiKey', apiKeySchema);
