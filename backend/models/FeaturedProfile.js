const mongoose = require('mongoose');

const featuredProfileSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, trim: true },
  followers: { type: String, trim: true },
  posts: { type: String, trim: true },
  budget: { type: String, trim: true },
  bio: { type: String, trim: true },
  image: { type: String },
  portfolio: [{ type: String }],
  socialLinks: {
    instagram: { type: String, trim: true },
    youtube: { type: String, trim: true }
  },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('FeaturedProfile', featuredProfileSchema);
