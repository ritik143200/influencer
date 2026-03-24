const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema({
  // Personal Information
  fullName: {
    type: String,
    required: true,
    trim: true
  },
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
  role: {
    type: String,
    enum: ['artist'],
    default: 'artist'
  },

  // Professional Information
  profileType: {
    type: String,
    enum: ['artist', 'influencer'],
    required: true
  },
  artistType: {
    type: String,
    enum: ['solo', 'group', 'duo', 'trio'],
    required: function() { return this.profileType === 'artist'; }
  },
  categories: [{
    type: String,
    required: true
  }],
  subcategories: [{
    type: String,
    default: []
  }],
  
  skills: [{
    type: String,
    trim: true,
    required: false,
    default: []
  }],
  bio: {
    type: String,
    required: false,
    maxlength: 1000
  },
  location: {
    type: String,
    required: false,
    trim: true
  },
  budget: {
    type: Number,
    required: false,
    default: 0
  },
  budgetMin: {
    type: Number,
    required: false,
    default: 0
  },
  budgetMax: {
    type: Number,
    required: false,
    default: 0
  },

  // Portfolio & Social
  profileImage: {
    type: String,
    default: 'https://picsum.photos/seed/artist-avatar/400/400.jpg'
  },
  portfolio: [{
    type: String, // File URLs
    trim: true
  }],
  socialLinks: {
    instagram: {
      type: String,
      default: ''
    },
    youtube: {
      type: String,
      default: ''
    },
    facebook: {
      type: String,
      default: ''
    },
    website: {
      type: String,
      default: ''
    }
  },

  // Verification
  idProof: {
    type: String, // File URL
    required: false, // Made optional
    default: ''
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
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
artistSchema.index({ email: 1 });
artistSchema.index({ categories: 1 });
artistSchema.index({ location: 1 });
artistSchema.index({ verificationStatus: 1 });
artistSchema.index({ profileType: 1 });

// Virtual for display name (alternative to fullName)
artistSchema.virtual('displayName').get(function () {
  return this.fullName ;
});

// Virtual for profile completion percentage
artistSchema.virtual('profileCompletion').get(function () {
  let completedFields = 0;
  let totalFields = 0;

  // Required fields (always counted)
  totalFields += 4; // fullName, email, phone, profileType
  completedFields += 4; // These are always present due to schema requirements

  // Optional but important fields
  const optionalFields = [
    this.bio && this.bio.length > 0,
    this.location && this.location.length > 0,
    this.categories && this.categories.length > 0,
    this.skills && this.skills.length > 0,
    this.portfolio && this.portfolio.length > 0,
    this.profileImage && this.profileImage !== 'https://picsum.photos/seed/artist-avatar/400/400.jpg',
    this.idProof && this.idProof.length > 0,
    this.socialLinks.instagram && this.socialLinks.instagram.length > 0,
    this.socialLinks.youtube && this.socialLinks.youtube.length > 0,
    this.socialLinks.facebook && this.socialLinks.facebook.length > 0,
    this.socialLinks.website && this.socialLinks.website.length > 0,
    this.budgetMin > 0,
    this.budgetMax > 0
  ];

  totalFields += optionalFields.length;
  completedFields += optionalFields.filter(Boolean).length;

  return Math.round((completedFields / totalFields) * 100);
});

// Virtual for profile completion status text
artistSchema.virtual('profileCompletionStatus').get(function () {
  const completion = this.profileCompletion;
  if (completion >= 80) return 'Complete';
  if (completion >= 60) return 'Good';
  if (completion >= 40) return 'Basic';
  return 'Incomplete';
});

// Ensure virtuals are included in JSON output
artistSchema.set('toJSON', { virtuals: true });
artistSchema.set('toObject', { virtuals: true });

// Pre-save middleware to update lastUpdated
artistSchema.pre('save', function (next) {
  this.lastUpdated = new Date();
  next();
});

module.exports = mongoose.model('Artist', artistSchema);
