const Artist = require('../models/Artist');
const Notification = require('../models/Notification');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Get logged-in artist's own profile
const getMyProfile = async (req, res) => {
  try {
    const artist = await Artist.findById(req.user._id).select('-password');
    if (!artist) return res.status(404).json({ success: false, message: 'Artist not found' });
    res.status(200).json({ success: true, data: artist });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile', error: error.message });
  }
};

// Update logged-in artist's own profile
const updateMyProfile = async (req, res) => {
  try {
    const allowedFields = [
      'fullName', 'phone', 'bio', 'location', 'experience',
      'skills', 'budgetMin', 'budgetMax', 'budget',
      'socialLinks', 'platforms', 'niche', 'category',
      'availability', 'previousCollaborations', 'pricing', 'audienceType',
      'profileImage', 'profilePicture'
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

    const artist = await Artist.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: false }
    ).select('-password');

    if (!artist) return res.status(404).json({ success: false, message: 'Artist not found' });

    res.status(200).json({ success: true, message: 'Profile updated successfully', data: artist });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update profile', error: error.message });
  }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'idProof') {
      cb(null, 'uploads/id-proofs/');
    } else {
      cb(null, 'uploads/portfolio/');
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept images and videos
    const allowedTypes = /jpeg|jpg|png|gif|mp4|avi|mov/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed!'));
    }
  }
});

// Register new artist
const registerArtist = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      dateOfBirth,
      gender,
      password,
      profileType,
      artistType,
      categories,
      subcategories,
      skills,
      bio,
      location,
      budgetMin,
      budgetMax,
      socialLinks,
      termsAccepted
    } = req.body;

    // Check if artist already exists
    const existingArtist = await Artist.findOne({ email });
    if (existingArtist) {
      return res.status(400).json({
        success: false,
        message: 'Artist with this email already exists'
      });
    }

    // Handle portfolio files
    let portfolioFiles = [];
    if (req.files && req.files.portfolio) {
      portfolioFiles = req.files.portfolio.map(file => `/uploads/portfolio/${file.filename}`);
    }

    // Handle ID proof
    let idProofFile = '';
    if (req.files && req.files.idProof) {
      idProofFile = `/uploads/id-proofs/${req.files.idProof[0].filename}`;
    }

    // Parse skills if it's a string
    let parsedSkills = skills;
    if (typeof skills === 'string') {
      parsedSkills = skills.split(',').map(skill => skill.trim()).filter(skill => skill);
    }

    // Parse social links if it's a string
    let parsedSocialLinks = socialLinks;
    if (typeof socialLinks === 'string') {
      parsedSocialLinks = JSON.parse(socialLinks);
    }

    // Split fullName into firstName and lastName
    const nameParts = fullName ? fullName.trim().split(' ') : ['', ''];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Handle categories and subcategories (convert from comma-separated strings to arrays)
    let parsedCategories = [];
    let parsedSubcategories = [];
    
    if (categories) {
      if (typeof categories === 'string') {
        parsedCategories = categories.split(',').map(cat => cat.trim()).filter(cat => cat);
      } else if (Array.isArray(categories)) {
        parsedCategories = categories;
      }
    }
    
    if (subcategories) {
      if (typeof subcategories === 'string') {
        parsedSubcategories = subcategories.split(',').map(sub => sub.trim()).filter(sub => sub);
      } else if (Array.isArray(subcategories)) {
        parsedSubcategories = subcategories;
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new artist
    const newArtist = new Artist({
      fullName,
      email,
      phone,
      dateOfBirth,
      gender,
      password: hashedPassword,
      profileType,
      artistType,
      categories: parsedCategories,
      subcategories: parsedSubcategories,
      skills: parsedSkills,
      bio,
      location,
      budgetMin,
      budgetMax,
      portfolio: portfolioFiles,
      socialLinks: parsedSocialLinks,
      idProof: idProofFile,
      termsAccepted: termsAccepted === 'true'
    });

    await newArtist.save();

    try {
      await Notification.create({
        type: 'general',
        message: `New artist registration: ${newArtist.fullName}`,
        relatedId: newArtist._id
      });
    } catch (err) {
      console.error('Failed to create notification for new artist:', err);
    }

    res.status(201).json({
      success: true,
      message: 'Artist registration successful! Your application is under review.',
      data: {
        id: newArtist._id,
        fullName: newArtist.fullName,
        email: newArtist.email,
        role: newArtist.role,
        verificationStatus: newArtist.verificationStatus
      }
    });

  } catch (error) {
    console.error('Artist registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
      error: error.message
    });
  }
};

// Get all artists (for admin)
const getAllArtists = async (req, res) => {
  try {
    const artists = await Artist.find({}).sort({ registrationDate: -1 });
    
    // Transform artists to include virtual fields
    const artistsWithCompletion = artists.map(artist => {
      const artistObj = artist.toJSON();
      artistObj.profileCompletion = artist.profileCompletion;
      artistObj.profileCompletionStatus = artist.profileCompletionStatus;
      return artistObj;
    });
    
    res.status(200).json({
      success: true,
      count: artistsWithCompletion.length,
      data: artistsWithCompletion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch artists',
      error: error.message
    });
  }
};

// Get artist by ID
const getArtistById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid artist ID'
      });
    }

    const artist = await Artist.findById(req.params.id);
    
    if (!artist) {
      return res.status(404).json({
        success: false,
        message: 'Artist not found'
      });
    }

    // Increment profile views
    artist.profileViews += 1;
    await artist.save();

    res.status(200).json({
      success: true,
      data: artist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch artist',
      error: error.message
    });
  }
};

// Update artist profile
const updateArtist = async (req, res) => {
  try {
    const artistId = req.params.id;
    const updateData = req.body;

    const artist = await Artist.findByIdAndUpdate(
      artistId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!artist) {
      return res.status(404).json({
        success: false,
        message: 'Artist not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Artist profile updated successfully',
      data: artist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update artist',
      error: error.message
    });
  }
};

// Delete artist (for admin)
const deleteArtist = async (req, res) => {
  try {
    const artist = await Artist.findByIdAndDelete(req.params.id);
    
    if (!artist) {
      return res.status(404).json({
        success: false,
        message: 'Artist not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Artist deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete artist',
      error: error.message
    });
  }
};

// Search artists
const searchArtists = async (req, res) => {
  try {
    const { 
      category, 
      location, 
      experience, 
      artistType,
      search,
      page = 1,
      limit = 10 
    } = req.query;

    // Build search query
    let query = { verificationStatus: 'verified', isActive: true };

    if (category) query.categories = { $in: [category] };
    if (location) query.location = { $regex: location, $options: 'i' };
    if (experience) query.experience = experience;
    if (artistType) query.artistType = artistType;
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } },
        { categories: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const skip = (page - 1) * limit;

    const artists = await Artist.find(query)
      .sort({ 'rating.average': -1, profileViews: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Artist.countDocuments(query);

    res.status(200).json({
      success: true,
      count: artists.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: artists
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
};

// Get inquiries forwarded to this artist
const getMyInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({
      'forwardedTo.userId': req.user._id
    })
      .populate('userId', 'name email phone')
      .populate('forwardedTo.forwardedBy', 'name email')
      .populate('workflowHistory.updatedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: inquiries.length,
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

// Respond to an inquiry (accept/reject)
const respondToInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body; // action: 'accept' or 'reject'

    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Use: accept or reject'
      });
    }

    const inquiry = await Inquiry.findById(id);
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    // Check if this inquiry was forwarded to this artist
    const wasForwarded = inquiry.forwardedTo.some(
      f => String(f.userId) === String(req.user._id)
    );

    if (!wasForwarded) {
      return res.status(403).json({
        success: false,
        message: 'This inquiry was not forwarded to you'
      });
    }

    // Update inquiry status
    if (action === 'accept') {
      inquiry.status = 'artist_accepted';
      inquiry.artistStatus = 'accepted';
      inquiry.progressPercentage = 80;
    } else {
      inquiry.status = 'artist_rejected';
      inquiry.artistStatus = 'rejected';
      inquiry.progressPercentage = 100;
    }

    // Add to workflow history
    inquiry.workflowHistory.push({
      stage: 'artist_response',
      status: action === 'accept' ? 'artist_accepted' : 'artist_rejected',
      updatedBy: req.user._id,
      notes: notes || `Artist ${action}ed the inquiry`
    });

    await inquiry.save();

    // Create notification for admin
    try {
      await Notification.create({
        type: 'inquiry_response',
        message: `Artist ${action}ed inquiry from ${inquiry.name}`,
        relatedId: inquiry._id
      });
    } catch (err) {
      console.error('Failed to create notification:', err);
    }

    const populated = await Inquiry.findById(id)
      .populate('userId', 'name email phone')
      .populate('forwardedTo.userId', 'name email')
      .populate('workflowHistory.updatedBy', 'name email');

    res.status(200).json({
      success: true,
      data: populated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to respond to inquiry',
      error: error.message
    });
  }
};

module.exports = {
  registerArtist,
  getAllArtists,
  getArtistById,
  updateArtist,
  deleteArtist,
  searchArtists,
  getMyProfile,
  updateMyProfile,
  upload,
  getMyInquiries,
  respondToInquiry
};
