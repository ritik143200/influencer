const mongoose = require('mongoose');

const influencerSchema = new mongoose.Schema({
  // Personal Information
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
  // Professional Information
  profileType: {
    type: String,
    enum: ['influencer'],
    required: true,
    default: 'influencer'
  },
  categories: [{
    type: String,
    required: true
  }],
  location: {
    type: String,
    required: false,
    trim: true
  },

  // Portfolio & Social
  profileImage: {
    type: String,
    default: 'https://picsum.photos/seed/artist-avatar/400/400.jpg'
  },
  socialLinks: {
    instagram: {
      type: String,
      default: ''
    },
    youtube: {
      type: String,
      default: ''
    }
  },

  // Verification
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

  // System Fields
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
    this.location && this.location.length > 0,
    this.categories && this.categories.length > 0,
    this.profileImage && this.profileImage !== 'https://picsum.photos/seed/artist-avatar/400/400.jpg',
    this.socialLinks.instagram && this.socialLinks.instagram.length > 0,
    this.socialLinks.youtube && this.socialLinks.youtube.length > 0
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
