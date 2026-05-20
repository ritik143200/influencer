const mongoose = require('mongoose');

const microCategorySchema = new mongoose.Schema({
  slug: { type: String, required: true, trim: true, lowercase: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '', trim: true },
  aliases: [{ type: String, trim: true, lowercase: true }],
  starterCount: { type: Number, default: 0 },
  spotlight: { type: Boolean, default: false },
  spotlightOrder: { type: Number, default: 999 },
  iconKey: { type: String, default: 'sparkles' },
  accentFrom: { type: String, default: '#8b5cf6' },
  accentTo: { type: String, default: '#22d3ee' },
  isActive: { type: Boolean, default: true }
}, { _id: false });

const categorySchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '', trim: true },
  aliases: [{ type: String, trim: true, lowercase: true }],
  legacyHiringValue: { type: String, required: true, trim: true, lowercase: true },
  iconKey: { type: String, default: 'sparkles' },
  accentFrom: { type: String, default: '#8b5cf6' },
  accentTo: { type: String, default: '#22d3ee' },
  sortOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  microCategories: [microCategorySchema]
}, {
  timestamps: true
});

categorySchema.index({ slug: 1 });
categorySchema.index({ isActive: 1, sortOrder: 1 });

module.exports = mongoose.model('Category', categorySchema);
