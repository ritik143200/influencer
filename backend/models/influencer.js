const mongoose = require('mongoose');

const influencerSchema = new mongoose.Schema({
  // Personal Information
  firstName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  fullName: { type: String, trim: true },
  username: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' },

  // Professional Information
  profileType: {
    type: String,
    enum: ['influencer'],
    required: true,
    default: 'influencer'
  },
  role: { type: String, default: 'influencer' },
  categories: [{
    type: String,
    required: false
  }],
  category: { type: String },
  subcategory: { type: String },
  subcategories: [{ type: String }],
  niche: { type: String },
  location: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  },
  bio: { type: String, trim: true, maxlength: 1000 },
  experience: { type: String },
  skills: [{ type: String }],
  artistType: { type: String },

  // Portfolio & Social
  profileImage: {
    type: String,
    default: 'https://picsum.photos/seed/artist-avatar/400/400.jpg'
  },
  profilePicture: { type: String },
  socialLinks: {
    instagram: { type: String, default: '' },
    youtube: { type: String, default: '' },
    facebook: { type: String, default: '' },
    website: { type: String, default: '' }
  },
  platforms: {
    instagram: { hasAccount: Boolean, url: String, followers: String, engagementRate: String },
    youtube: { hasAccount: Boolean, url: String, followers: String, engagementRate: String },
    facebook: { hasAccount: Boolean, url: String, followers: String, engagementRate: String }
  },
  portfolio: [{ type: String }],
  previousCollaborations: { type: String },

  // Pricing
  pricing: {
    collaborationCharges: { type: Number },
    pricingModel: { type: String, default: 'fixed' }
  },
  budget: { type: Number, default: 0 },
  budgetMin: { type: Number },
  budgetMax: { type: Number },

  // Stats & Status
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  termsAccepted: {
    type: Boolean,
    required: true,
    default: false
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  profileViews: {
    type: Number,
    default: 0
  },
  trending: { type: Boolean, default: false },
  completedEvents: { type: Number, default: 0 },
  responseTime: { type: String },
  genre: { type: String },
  rating: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, {
  timestamps: true
});

// Index for better search performance
influencerSchema.index({ email: 1 });
influencerSchema.index({ categories: 1 });
influencerSchema.index({ location: 1 });
influencerSchema.index({ verificationStatus: 1 });
influencerSchema.index({ profileType: 1 });

// Virtual for display name (alternative to email)
influencerSchema.virtual('displayName').get(function () {
  return this.email;
});

// Virtual for profile completion percentage
influencerSchema.virtual('profileCompletion').get(function () {
  let completedFields = 0;
  let totalFields = 0;

  // Required fields (always counted)
  totalFields += 4; // email, phone, password, profileType
  completedFields += 4; // These are always present due to schema requirements

  // Optional but important fields
  const optionalFields = [
    this.location && (typeof this.location === 'string' ? this.location.length > 0 : Object.keys(this.location).length > 0),
    this.categories && this.categories.length > 0,
    this.profileImage && this.profileImage !== 'https://picsum.photos/seed/artist-avatar/400/400.jpg',
    this.socialLinks && this.socialLinks.instagram && this.socialLinks.instagram.length > 0,
    this.socialLinks && this.socialLinks.youtube && this.socialLinks.youtube.length > 0,
    this.bio && this.bio.trim().length > 0,
    this.experience && this.experience.trim().length > 0
  ];

  totalFields += optionalFields.length;
  completedFields += optionalFields.filter(Boolean).length;

  return Math.round((completedFields / totalFields) * 100);
});

// Virtual for profile completion status text
influencerSchema.virtual('profileCompletionStatus').get(function () {
  const completion = this.profileCompletion;
  if (completion >= 80) return 'Complete';
  if (completion >= 60) return 'Good';
  if (completion >= 40) return 'Basic';
  return 'Incomplete';
});

// Ensure virtuals are included in JSON output
influencerSchema.set('toJSON', { virtuals: true });
influencerSchema.set('toObject', { virtuals: true });

// Pre-save middleware to update lastUpdated
influencerSchema.pre('save', function (next) {
  this.lastUpdated = new Date();
  next();
});

module.exports = mongoose.model('Influencer', influencerSchema);
