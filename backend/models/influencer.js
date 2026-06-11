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
  mainCategories: [{
    type: String,
    trim: true
  }],
  microCategories: [{
    type: String,
    trim: true
  }],
  categorySelections: [{
    mainCategorySlug: { type: String, trim: true },
    microCategorySlug: { type: String, trim: true, default: null }
  }],
  category: { type: String },
  subcategory: { type: String },
  subcategories: [{ type: String }],
  niche: [{ type: String }],
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
  profileImageThumb: { type: String },
  profileImagePublicId: { type: String },
  profileImageThumbPublicId: { type: String },
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
  portfolio: [{ title: { type: String, trim: true }, url: { type: String, trim: true } }],
  unavailableDates: [{ type: Date }],
  previousCollaborations: { type: String },

  // Pricing
  pricing: {
    collaborationCharges: { type: Number },
    pricingModel: { type: String, default: 'fixed' },
    reel: { type: mongoose.Schema.Types.Mixed },
    reelCreation: { type: mongoose.Schema.Types.Mixed },
    story: { type: mongoose.Schema.Types.Mixed },
    collab: { type: mongoose.Schema.Types.Mixed },
    staticPost: { type: mongoose.Schema.Types.Mixed },
    other: { type: mongoose.Schema.Types.Mixed },
    custom: [{
      label: { type: String, trim: true },
      amount: { type: mongoose.Schema.Types.Mixed }
    }]
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
  featuredOrder: { type: Number, default: 0 },
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
influencerSchema.index({ mainCategories: 1 });
influencerSchema.index({ microCategories: 1 });
influencerSchema.index({ location: 1 });
influencerSchema.index({ verificationStatus: 1 });
influencerSchema.index({ profileType: 1 });
influencerSchema.index({ unavailableDates: 1 });

// Virtual for display name (alternative to email)
influencerSchema.virtual('displayName').get(function () {
  return this.email;
});

// Virtual for profile completion percentage
influencerSchema.virtual('profileCompletion').get(function () {
  const hasValue = (value) => {
    if (Array.isArray(value)) return value.some(hasValue);
    if (value && typeof value === 'object') return Object.values(value).some(hasValue);
    return String(value || '').trim().length > 0;
  };

  const hasLocation = (location) => {
    if (!location) return false;
    if (typeof location === 'string') return Boolean(location.trim());
    return Boolean(String(location.city || location.state || location.country || '').trim());
  };

  const hasCategory = Boolean(
    (Array.isArray(this.mainCategories) && this.mainCategories.length > 0) ||
    (Array.isArray(this.microCategories) && this.microCategories.length > 0) ||
    (Array.isArray(this.categories) && this.categories.length > 0)
  );

  const hasFollowers = Boolean(
    hasValue(this.followers) ||
    hasValue(this.platforms?.instagram?.followers) ||
    hasValue(this.platforms?.youtube?.followers) ||
    hasValue(this.platforms?.facebook?.followers)
  );

  const hasPricing = Boolean(
    hasValue(this.pricing?.reel) ||
    hasValue(this.pricing?.reelCreation) ||
    hasValue(this.pricing?.story) ||
    hasValue(this.pricing?.collab) ||
    hasValue(this.pricing?.staticPost) ||
    hasValue(this.pricing?.other) ||
    hasValue(this.pricing?.custom) ||
    hasValue(this.budgetMin) ||
    hasValue(this.budgetMax) ||
    hasValue(this.budget)
  );

  const hasPortfolio = Array.isArray(this.portfolio) && this.portfolio.some((item) => {
    if (typeof item === 'string') return Boolean(item.trim());
    return Boolean(String(item?.title || item?.url || '').trim());
  });

  const profileSteps = [
    { done: hasValue(this.bio || this.description), weight: 12 },
    { done: hasValue(this.experience), weight: 8 },
    { done: hasValue(this.gender), weight: 5 },
    { done: hasFollowers, weight: 15 },
    { done: hasPricing, weight: 18 },
    { done: hasPortfolio, weight: 12 },
    {
      done: hasValue(this.socialLinks?.instagram || this.instagram || this.platforms?.instagram?.url) && hasLocation(this.location) && hasCategory,
      weight: 5
    }
  ];

  const completedProfile = profileSteps.reduce((sum, item) => sum + (item.done ? item.weight : 0), 0);
  return Math.min(100, Math.max(25, 25 + completedProfile));
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
