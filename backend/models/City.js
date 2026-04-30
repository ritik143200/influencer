const mongoose = require('mongoose');

const citySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    state: {
      type: String,
      trim: true,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true, strict: false }
);

// Case-insensitive unique index
citySchema.index({ name: 1 }, { collation: { locale: 'en', strength: 2 } });

module.exports = mongoose.model('City', citySchema);
