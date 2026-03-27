const Influencer = require('../models/influencer');
const Inquiry = require('../models/Inquiry');
const Notification = require('../models/Notification');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Get logged-in influencer's own profile
const getMyProfile = async (req, res) => {
  try {
    const influencer = await Influencer.findOne({ _id: req.user._id })
      .select('-password');
    if (!influencer) return res.status(404).json({ success: false, message: 'Influencer not found' });
    res.status(200).json({ success: true, data: influencer });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile', error: error.message });
  }
};

// Update logged-in influencer's own profile
const updateMyProfile = async (req, res) => {
  try {
    const allowedFields = [
      'email', 'phone', 'location', 'categories',
      'socialLinks', 'profileImage'
    ];

    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    });

    // Flatten location object { city, country } → "City, Country" string
    if (updateData.location && typeof updateData.location === 'object') {
      const { city = '', country = '' } = updateData.location;
      updateData.location = [city, country].filter(Boolean).join(', ') || '';
    }

    // Handle password change
    if (req.body.password && req.body.password.length >= 6) {
      updateData.password = await bcrypt.hash(req.body.password, 10);
    }

    const influencer = await Influencer.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: false }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: influencer
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update profile', error: error.message });
  }
};

// Register new influencer
const registerInfluencer = async (req, res) => {
  try {
    const {
      email,
      phone,
      password,
      location,
      categories,
      socialLinks,
      termsAccepted
    } = req.body;

    // Validation
    if (!email || !phone || !password || !categories || !termsAccepted) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all required fields'
      });
    }

    // Check if influencer already exists
    const existingInfluencer = await Influencer.findOne({
      $or: [
        { email },
        { phone }
      ]
    });

    if (existingInfluencer) {
      return res.status(400).json({
        success: false,
        message: 'Influencer with this email or phone already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Parse social links if it's a string
    let parsedSocialLinks = socialLinks;
    if (typeof socialLinks === 'string') {
      try {
        parsedSocialLinks = JSON.parse(socialLinks);
      } catch (e) {
        parsedSocialLinks = { instagram: '', youtube: '' };
      }
    }

    // Create new influencer
    const newInfluencer = new Influencer({
      email,
      phone,
      password: hashedPassword,
      profileType: 'influencer',
      location: location || '',
      categories: Array.isArray(categories) ? categories : [categories],
      socialLinks: parsedSocialLinks,
      termsAccepted: termsAccepted === 'true'
    });

    await newInfluencer.save();

    try {
      await Notification.create({
        type: 'general',
        message: `New influencer registration: ${newInfluencer.email}`,
        relatedId: newInfluencer._id
      });
    } catch (err) {
      console.error('Failed to create notification for new influencer:', err);
    }

    res.status(201).json({
      success: true,
      message: 'Influencer registration successful! Your application is under review.',
      data: {
        id: newInfluencer._id,
        email: newInfluencer.email,
        role: newInfluencer.role,
        verificationStatus: newInfluencer.verificationStatus
      }
    });

  } catch (error) {
    console.error('Influencer registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
      error: error.message
    });
  }
};

// Get all influencers (for admin)
const getAllInfluencers = async (req, res) => {
  try {
    const influencers = await Influencer.find({ profileType: 'influencer' }).sort({ registrationDate: -1 });
    
    // Transform influencers to include virtual fields
    const influencersWithCompletion = influencers.map(influencer => {
      const influencerObj = influencer.toJSON();
      influencerObj.profileCompletion = influencer.profileCompletion;
      return influencerObj;
    });
    
    res.status(200).json({
      success: true,
      data: influencersWithCompletion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch influencers',
      error: error.message
    });
  }
};

// Get influencer by ID
const getInfluencerById = async (req, res) => {
  try {
    const influencer = await Influencer.findById(req.params.id).select('-password');
    
    if (!influencer) {
      return res.status(404).json({
        success: false,
        message: 'Influencer not found'
      });
    }

    if (influencer.profileType !== 'influencer') {
      return res.status(404).json({
        success: false,
        message: 'Not an influencer profile'
      });
    }

    // Include virtual fields
    const influencerObj = influencer.toJSON();
    influencerObj.profileCompletion = influencer.profileCompletion;

    res.status(200).json({
      success: true,
      data: influencerObj
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch influencer',
      error: error.message
    });
  }
};

// Update influencer (admin only)
const updateInfluencer = async (req, res) => {
  try {
    const influencer = await Influencer.findById(req.params.id);
    
    if (!influencer) {
      return res.status(404).json({
        success: false,
        message: 'Influencer not found'
      });
    }

    if (influencer.profileType !== 'influencer') {
      return res.status(404).json({
        success: false,
        message: 'Not an influencer profile'
      });
    }

    const allowedFields = [
      'email', 'phone', 'location', 'categories',
      'socialLinks', 'profileImage', 'verificationStatus', 'isActive'
    ];

    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    });

    // Handle password change
    if (req.body.password && req.body.password.length >= 6) {
      updateData.password = await bcrypt.hash(req.body.password, 10);
    }

    const updatedInfluencer = await Influencer.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: false }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Influencer updated successfully',
      data: updatedInfluencer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update influencer',
      error: error.message
    });
  }
};

// Delete influencer (admin only)
const deleteInfluencer = async (req, res) => {
  try {
    const influencer = await Artist.findById(req.params.id);
    
    if (!influencer) {
      return res.status(404).json({
        success: false,
        message: 'Influencer not found'
      });
    }

    if (influencer.profileType !== 'influencer') {
      return res.status(404).json({
        success: false,
        message: 'Not an influencer profile'
      });
    }

    await Influencer.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Influencer deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete influencer',
      error: error.message
    });
  }
};

// Search influencers
const searchInfluencers = async (req, res) => {
  try {
    const { query, category, location } = req.query;
    
    // Build search filter
    let filter = { profileType: 'influencer' };
    
    if (query) {
      filter.$or = [
        { email: { $regex: query, $options: 'i' } }
      ];
    }
    
    if (category) {
      filter.categories = { $in: [category] };
    }
    
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    const influencers = await Influencer.find(filter)
      .select('-password')
      .sort({ registrationDate: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: influencers
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to search influencers', 
      error: error.message 
    });
  }
};

// Get influencer's inquiries
const getMyInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ artistId: req.user._id })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: inquiries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inquiries',
      error: error.message
    });
  }
};

// Respond to inquiry
const respondToInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, responseMessage } = req.body;

    const inquiry = await Inquiry.findById(id);
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    if (inquiry.artistId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to respond to this inquiry'
      });
    }

    inquiry.status = status;
    inquiry.responseMessage = responseMessage;
    inquiry.respondedAt = new Date();

    await inquiry.save();

    res.status(200).json({
      success: true,
      message: 'Inquiry response submitted successfully',
      data: inquiry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to respond to inquiry',
      error: error.message
    });
  }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

module.exports = {
  registerInfluencer,
  getAllInfluencers,
  getInfluencerById,
  updateInfluencer,
  deleteInfluencer,
  searchInfluencers,
  getMyProfile,
  updateMyProfile,
  upload,
  getMyInquiries,
  respondToInquiry
};
