const ActivityLog = require('../models/ActivityLog');

// Middleware to log user registration
const logUserRegistration = async (userData) => {
  try {
    await ActivityLog.logUserRegistration(userData._id, userData);
  } catch (error) {
    console.error('Error logging user registration:', error);
  }
};

// Middleware to log influencer registration
const logInfluencerRegistration = async (influencerData) => {
  try {
    await ActivityLog.logInfluencerRegistration(influencerData._id, influencerData);
  } catch (error) {
    console.error('Error logging influencer registration:', error);
  }
};

// Middleware to log inquiry submission
const logInquirySubmission = async (inquiryData) => {
  try {
    await ActivityLog.logInquirySubmission(inquiryData._id, inquiryData);
  } catch (error) {
    console.error('Error logging inquiry submission:', error);
  }
};

// Middleware to log inquiry status updates
const logInquiryStatusUpdate = async (inquiryId, oldStatus, newStatus, performedBy) => {
  try {
    await ActivityLog.logInquiryStatusUpdate(inquiryId, oldStatus, newStatus, performedBy);
  } catch (error) {
    console.error('Error logging inquiry status update:', error);
  }
};

// Middleware to log influencer status updates
const logInfluencerStatusUpdate = async (influencerId, oldStatus, newStatus, performedBy) => {
  try {
    await ActivityLog.logInfluencerStatusUpdate(influencerId, oldStatus, newStatus, performedBy);
  } catch (error) {
    console.error('Error logging influencer status update:', error);
  }
};

module.exports = {
  logUserRegistration,
  logInfluencerRegistration,
  logInquirySubmission,
  logInquiryStatusUpdate,
  logInfluencerStatusUpdate
};
