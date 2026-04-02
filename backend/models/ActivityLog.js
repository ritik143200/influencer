const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['user_registration', 'influencer_registration', 'inquiry_submission', 'inquiry_status_update', 'influencer_status_update'],
    required: true
  },
  action: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  influencerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Influencer',
    required: false
  },
  inquiryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inquiry',
    required: false
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for performance
activityLogSchema.index({ timestamp: -1 });
activityLogSchema.index({ type: 1, timestamp: -1 });
activityLogSchema.index({ userId: 1, timestamp: -1 });
activityLogSchema.index({ isRead: 1 });

// Static methods for activity logging
activityLogSchema.statics.logUserRegistration = function(userId, userData) {
  return this.create({
    type: 'user_registration',
    action: 'registered',
    description: `New user ${userData.name || userData.email} registered`,
    userId: userId,
    metadata: {
      email: userData.email,
      name: userData.name,
      registrationDate: new Date()
    },
    priority: 'medium'
  });
};

activityLogSchema.statics.logInfluencerRegistration = function(influencerId, influencerData) {
  return this.create({
    type: 'influencer_registration',
    action: 'registered',
    description: `New influencer ${influencerData.fullName || influencerData.email} registered`,
    influencerId: influencerId,
    metadata: {
      email: influencerData.email,
      fullName: influencerData.fullName,
      categories: influencerData.categories,
      registrationDate: new Date()
    },
    priority: 'high'
  });
};

activityLogSchema.statics.logInquirySubmission = function(inquiryId, inquiryData) {
  return this.create({
    type: 'inquiry_submission',
    action: 'submitted',
    description: `New inquiry submitted by ${inquiryData.name || inquiryData.email}`,
    inquiryId: inquiryId,
    userId: inquiryData.userId,
    metadata: {
      email: inquiryData.email,
      name: inquiryData.name,
      category: inquiryData.category,
      budget: inquiryData.budget,
      submissionDate: new Date()
    },
    priority: 'high'
  });
};

activityLogSchema.statics.logInquiryStatusUpdate = function(inquiryId, oldStatus, newStatus, performedBy) {
  return this.create({
    type: 'inquiry_status_update',
    action: 'status_changed',
    description: `Inquiry status changed from ${oldStatus} to ${newStatus}`,
    inquiryId: inquiryId,
    performedBy: performedBy,
    metadata: {
      oldStatus,
      newStatus,
      updateDate: new Date()
    },
    priority: 'medium'
  });
};

activityLogSchema.statics.logInfluencerStatusUpdate = function(influencerId, oldStatus, newStatus, performedBy) {
  return this.create({
    type: 'influencer_status_update',
    action: 'status_changed',
    description: `Influencer status changed from ${oldStatus ? 'active' : 'inactive'} to ${newStatus ? 'active' : 'inactive'}`,
    influencerId: influencerId,
    performedBy: performedBy,
    metadata: {
      oldStatus,
      newStatus,
      updateDate: new Date()
    },
    priority: 'medium'
  });
};

// Virtual for formatted timestamp
activityLogSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now - this.timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
});

// Ensure virtuals are included in JSON
activityLogSchema.set('toJSON', { virtuals: true });
activityLogSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
