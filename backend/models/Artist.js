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

// Ensure virtuals are included in JSON output
artistSchema.set('toJSON', { virtuals: true });
artistSchema.set('toObject', { virtuals: true });

// Pre-save middleware to update lastUpdated
artistSchema.pre('save', function (next) {
  this.lastUpdated = new Date();
  next();
});

module.exports = mongoose.model('Artist', artistSchema);
