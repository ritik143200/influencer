const Influencer = require('../models/influencer');
const User = require('../models/User');
const Inquiry = require('../models/Inquiry');
const Notification = require('../models/Notification');
const { logInfluencerRegistration } = require('../middleware/activityLogger');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {
  uploadOptimizedAndThumbToCloudinary,
  deleteCloudinaryAsset,
  extractCloudinaryPublicIdFromUrl
} = require('../utils/imageVariants');
const { sendInfluencerWelcomeMessage } = require('../utils/whatsappService');
const {
  ensureCategoryDirectory,
  normalizeCategoryPayload
} = require('../utils/categoryHelpers');

const toDayStartUtc = (input) => {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return null;
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

const applyNormalizedCategoryData = (target, normalizedCategories) => {
  target.mainCategories = normalizedCategories.mainCategories;
  target.microCategories = normalizedCategories.microCategories;
  target.categorySelections = normalizedCategories.categorySelections;
  target.categories = normalizedCategories.microCategoryLabels;
  target.niche = normalizedCategories.microCategoryLabels;
  target.subcategories = normalizedCategories.microCategoryLabels;
  target.category = normalizedCategories.microCategoryLabels[0] || normalizedCategories.mainCategoryLabels[0] || '';
  target.subcategory = normalizedCategories.mainCategoryLabels[0] || '';
};

const pickFirstString = (...values) => {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    const normalized = String(value).trim();
    if (normalized) return normalized;
  }
  return '';
};

const parseJsonField = (value, fallback) => {
  if (typeof value !== 'string') return value ?? fallback;
  if (!value.trim()) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

// Upload and set influencer profile image (optimized + thumbnail)
// Route: POST /api/influencer/portfolio/upload
const uploadProfileImage = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const influencer = await Influencer.findById(req.user._id);
    if (!influencer) {
      return res.status(404).json({ success: false, message: 'Influencer not found' });
    }

    const uploaded = await uploadOptimizedAndThumbToCloudinary(req.file.buffer, {
      folder: 'influencer_avatars',
      basePublicId: `avatar_${influencer._id}_${Date.now()}`,
      optimizedMaxWidth: 1000,
      thumbMaxWidth: 300,
      webpQuality: 75
    });

    // Best effort cleanup of old avatar assets
    const oldUrl = influencer.profileImage || influencer.profilePicture;
    const oldPublicId = extractCloudinaryPublicIdFromUrl(oldUrl);
    await deleteCloudinaryAsset(oldPublicId);
    await deleteCloudinaryAsset(oldPublicId ? `${oldPublicId}_thumb` : null);
    await deleteCloudinaryAsset(oldPublicId ? `${oldPublicId}_opt` : null);

    influencer.profileImage = uploaded.optimized.url;
    influencer.profilePicture = uploaded.optimized.url;
    influencer.profileImageThumb = uploaded.thumb.url;
    influencer.profileImagePublicId = uploaded.optimized.publicId;
    influencer.profileImageThumbPublicId = uploaded.thumb.publicId;
    await influencer.save();

    return res.status(200).json({
      success: true,
      url: uploaded.optimized.url,
      thumbUrl: uploaded.thumb.url,
      public_id: uploaded.optimized.publicId,
      thumb_public_id: uploaded.thumb.publicId
    });
  } catch (error) {
    console.error('Profile image upload error:', error);
    return res.status(500).json({ success: false, message: 'Failed to upload image' });
  }
};

const normalizeDateArray = (dates) => {
  if (!Array.isArray(dates)) return { ok: false, error: 'dates must be an array' };

  const normalized = [];
  const seen = new Set();
  for (const raw of dates) {
    const parsed = toDayStartUtc(raw);
    if (!parsed) {
      return { ok: false, error: `Invalid date value: ${raw}` };
    }
    const key = parsed.toISOString();
    if (!seen.has(key)) {
      seen.add(key);
      normalized.push(parsed);
    }
  }
  return { ok: true, data: normalized };
};

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
      'mainCategories', 'microCategories', 'categorySelections',
      'socialLinks', 'profileImage', 'fullName', 'username',
      'bio', 'experience', 'gender', 'niche', 'category',
      'previousCollaborations', 'pricing',
      'portfolio', 'platforms', 'subcategories', 'skills',
      'profilePicture', 'budget', 'budgetMin', 'budgetMax'
    ];

    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    });

    if (req.body.socialLinks !== undefined && !String(req.body.socialLinks?.instagram || '').trim()) {
      return res.status(400).json({
        success: false,
        message: 'Instagram profile link is required'
      });
    }

    // Flatten location object { city, country } → "City, Country" string
    if (updateData.location && typeof updateData.location === 'object') {
      const { city = '', country = '' } = updateData.location;
      updateData.location = [city, country].filter(Boolean).join(', ') || '';
    }

    // Handle password change
    if (req.body.password && req.body.password.length >= 6) {
      updateData.password = await bcrypt.hash(req.body.password, 10);
    }

    const hasCategoryPayload = [
      'categories',
      'mainCategories',
      'microCategories',
      'categorySelections',
      'niche'
    ].some((field) => req.body[field] !== undefined);

    if (hasCategoryPayload) {
      const categoryDirectory = await ensureCategoryDirectory();
      const normalizedCategories = normalizeCategoryPayload(req.body, categoryDirectory);
      applyNormalizedCategoryData(updateData, normalizedCategories);
    }

    // Strip fields that would cause DB validation/constraint issues if empty
    if (updateData.gender === '' || updateData.gender === null || updateData.gender === undefined) {
      delete updateData.gender;
    }
    if (updateData.username === '' || updateData.username === null) {
      delete updateData.username;
    }

    // Always update lastUpdated (findByIdAndUpdate skips pre-save hooks)
    updateData.lastUpdated = new Date();

    // Normalize portfolio: filter empty rows, ensure objects
    if (Array.isArray(updateData.portfolio)) {
      updateData.portfolio = updateData.portfolio
        .filter((item) => {
          if (typeof item === 'string') return item.trim().length > 0;
          return (item?.title || '').trim() || (item?.url || '').trim();
        })
        .map((item) => {
          if (typeof item === 'string') return { title: '', url: item };
          return { title: (item.title || '').trim(), url: (item.url || '').trim() };
        });
    }

    const influencer = await Influencer.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: false }
    ).select('-password');

    if (!influencer) {
      return res.status(404).json({ success: false, message: 'Influencer profile not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: influencer
    });
  } catch (error) {
    console.error('updateMyProfile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile', error: error.message });
  }
};

// Get logged-in influencer availability
const getMyAvailability = async (req, res) => {
  try {
    const influencer = await Influencer.findById(req.user._id).select('unavailableDates');
    if (!influencer) {
      return res.status(404).json({ success: false, message: 'Influencer not found' });
    }

    const unavailableDates = (influencer.unavailableDates || []).map((d) =>
      new Date(d).toISOString().slice(0, 10)
    );

    return res.status(200).json({ success: true, data: { unavailableDates } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch availability', error: error.message });
  }
};

// Replace complete unavailable dates set
const updateMyAvailability = async (req, res) => {
  try {
    const parsed = normalizeDateArray(req.body.unavailableDates);
    if (!parsed.ok) {
      return res.status(400).json({ success: false, message: parsed.error });
    }

    const influencer = await Influencer.findByIdAndUpdate(
      req.user._id,
      { $set: { unavailableDates: parsed.data } },
      { new: true }
    ).select('unavailableDates');

    if (!influencer) {
      return res.status(404).json({ success: false, message: 'Influencer not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Availability updated',
      data: {
        unavailableDates: (influencer.unavailableDates || []).map((d) => new Date(d).toISOString().slice(0, 10))
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update availability', error: error.message });
  }
};

// Add dates to unavailable set
const addMyUnavailableDates = async (req, res) => {
  try {
    const parsed = normalizeDateArray(req.body.dates);
    if (!parsed.ok) {
      return res.status(400).json({ success: false, message: parsed.error });
    }

    const influencer = await Influencer.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { unavailableDates: { $each: parsed.data } } },
      { new: true }
    ).select('unavailableDates');

    if (!influencer) {
      return res.status(404).json({ success: false, message: 'Influencer not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Unavailable dates added',
      data: {
        unavailableDates: (influencer.unavailableDates || []).map((d) => new Date(d).toISOString().slice(0, 10))
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to add unavailable dates', error: error.message });
  }
};

// Remove dates from unavailable set
const removeMyUnavailableDates = async (req, res) => {
  try {
    const parsed = normalizeDateArray(req.body.dates);
    if (!parsed.ok) {
      return res.status(400).json({ success: false, message: parsed.error });
    }

    const influencer = await Influencer.findByIdAndUpdate(
      req.user._id,
      { $pull: { unavailableDates: { $in: parsed.data } } },
      { new: true }
    ).select('unavailableDates');

    if (!influencer) {
      return res.status(404).json({ success: false, message: 'Influencer not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Unavailable dates removed',
      data: {
        unavailableDates: (influencer.unavailableDates || []).map((d) => new Date(d).toISOString().slice(0, 10))
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to remove unavailable dates', error: error.message });
  }
};

// Register new influencer
const registerInfluencer = async (req, res) => {
  try {
    const {
      firstName: reqFirstName,
      lastName: reqLastName,
      fullName: reqFullName,
      name: reqName,
      email: reqEmail,
      emailId,
      emailID,
      phone: reqPhone,
      phoneNumber,
      mobile,
      mobileNumber,
      password: reqPassword,
      location: reqLocation,
      categories,
      mainCategories,
      microCategories,
      categorySelections,
      niche,
      socialLinks,
      instagram,
      youtube,
      termsAccepted
    } = req.body;

    const email = pickFirstString(reqEmail, emailId, emailID).toLowerCase();
    const phone = pickFirstString(reqPhone, phoneNumber, mobile, mobileNumber);
    const password = pickFirstString(reqPassword);
    const location = pickFirstString(reqLocation);
    const parsedCategorySelections = parseJsonField(categorySelections, categorySelections);
    const parsedSocialInput = parseJsonField(socialLinks, socialLinks);

    const hasAcceptedTerms = termsAccepted === undefined || termsAccepted === true || termsAccepted === 'true' || termsAccepted === '1' || termsAccepted === 'on';

    // Validate basic account fields before any database/category work.
    const missingRequiredFields = [
      !pickFirstString(reqFullName, reqName, reqFirstName) ? 'name' : '',
      !email ? 'email' : '',
      !phone ? 'phone' : '',
      !password ? 'password' : '',
      !location ? 'location' : ''
    ].filter(Boolean);

    if (missingRequiredFields.length) {
      return res.status(400).json({
        success: false,
        message: `Please fill required fields: ${missingRequiredFields.join(', ')}`
      });
    }

    if (!hasAcceptedTerms) {
      return res.status(400).json({
        success: false,
        message: 'Please accept the terms to continue'
      });
    }

    const categoryDirectory = await ensureCategoryDirectory();
    const normalizedCategories = normalizeCategoryPayload({
      categories,
      mainCategories,
      microCategories,
      categorySelections: parsedCategorySelections,
      niche
    }, categoryDirectory);

    if (normalizedCategories.microCategories.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one micro category'
      });
    }

    // Check if this email is already registered as a user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'This email is already registered as a user'
      });
    }

    // Check if this email is already registered as an influencer
    const existingInfluencer = await Influencer.findOne({ email });
    if (existingInfluencer) {
      return res.status(400).json({
        success: false,
        message: 'This email is already registered as an influencer'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Parse social links if it's a string
    let parsedSocialLinks = parsedSocialInput;
    if (typeof parsedSocialLinks === 'string') {
      try {
        parsedSocialLinks = JSON.parse(parsedSocialLinks);
      } catch (e) {
        parsedSocialLinks = { instagram: '', youtube: '' };
      }
    }

    parsedSocialLinks = {
      ...(parsedSocialLinks || {}),
      instagram: pickFirstString(parsedSocialLinks?.instagram, instagram),
      youtube: pickFirstString(parsedSocialLinks?.youtube, youtube)
    };

    if (!parsedSocialLinks || !String(parsedSocialLinks.instagram || '').trim()) {
      return res.status(400).json({
        success: false,
        message: 'Instagram profile link is required'
      });
    }

    // Derive name fields: prefer explicit firstName/lastName, else derive from fullName
    let finalFirst = pickFirstString(reqFirstName);
    let finalLast = pickFirstString(reqLastName);
    let finalFull = pickFirstString(reqFullName, reqName);
    if (!finalFirst && !finalLast && finalFull) {
      const parts = finalFull.trim().split(/\s+/);
      finalFirst = parts[0] || '';
      finalLast = parts.slice(1).join(' ') || '';
    }
    if (!finalFull) {
      finalFull = [finalFirst, finalLast].filter(Boolean).join(' ') || undefined;
    }

    // Create new influencer
    const newInfluencer = new Influencer({
      firstName: finalFirst || undefined,
      lastName: finalLast || undefined,
      fullName: finalFull,
      email,
      phone,
      password: hashedPassword,
      profileType: 'influencer',
      location: location || '',
      socialLinks: parsedSocialLinks,
      termsAccepted: hasAcceptedTerms
    });

    applyNormalizedCategoryData(newInfluencer, normalizedCategories);

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

    // Log influencer registration activity
    try {
      await logInfluencerRegistration(newInfluencer);
    } catch (err) {
      console.error('Failed to log influencer registration activity:', err);
    }

    // Send Welcome WhatsApp Message via AiSensy
    sendInfluencerWelcomeMessage(newInfluencer.phone, newInfluencer.fullName || newInfluencer.firstName);

    // Generate JWT token for automatic login
    const token = jwt.sign(
      { id: newInfluencer._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );

    res.status(201).json({
      success: true,
      message: 'Influencer registration successful! Your application is under review.',
      token: token,
      data: {
        id: newInfluencer._id,
        email: newInfluencer.email,
        fullName: newInfluencer.fullName,
        phone: newInfluencer.phone,
        role: newInfluencer.role || 'influencer',
        profileType: newInfluencer.profileType,
        verificationStatus: newInfluencer.verificationStatus,
        categories: newInfluencer.categories,
        mainCategories: newInfluencer.mainCategories,
        microCategories: newInfluencer.microCategories,
        categorySelections: newInfluencer.categorySelections,
        niche: newInfluencer.niche,
        location: newInfluencer.location,
        socialLinks: newInfluencer.socialLinks,
        profileImage: newInfluencer.profileImage,
        profilePicture: newInfluencer.profilePicture
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
    const influencers = await Influencer.find({ profileType: 'influencer' })
      .sort({ registrationDate: -1 })
      .select('-password'); // Exclude password but include all other fields
    
    // Transform influencers to include virtual fields
    const influencersWithCompletion = influencers.map(influencer => {
      const influencerObj = influencer.toObject(); // Convert to plain object with virtuals
      return influencerObj;
    });
    
    res.status(200).json({
      success: true,
      data: influencersWithCompletion
    });
  } catch (error) {
    console.error('Error fetching all influencers:', error);
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
      'mainCategories', 'microCategories', 'categorySelections',
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

    const hasCategoryPayload = [
      'categories',
      'mainCategories',
      'microCategories',
      'categorySelections',
      'niche'
    ].some((field) => req.body[field] !== undefined);

    if (hasCategoryPayload) {
      const categoryDirectory = await ensureCategoryDirectory();
      const normalizedCategories = normalizeCategoryPayload(req.body, categoryDirectory);
      applyNormalizedCategoryData(updateData, normalizedCategories);
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
    const categoryDirectory = await ensureCategoryDirectory();
    const normalizedCategory = normalizeCategoryPayload({ categories: [category], mainCategories: [category] }, categoryDirectory);

    // Build search filter
    let filter = { profileType: 'influencer' };
    
    if (query) {
      filter.$or = [
        { email: { $regex: query, $options: 'i' } }
      ];
    }
    
    if (category) {
      filter.$and = filter.$and || [];
      const categoryOr = [];

      if (normalizedCategory.mainCategories.length > 0) {
        categoryOr.push({ mainCategories: { $in: normalizedCategory.mainCategories } });
      }

      if (normalizedCategory.microCategories.length > 0) {
        categoryOr.push({ microCategories: { $in: normalizedCategory.microCategories } });
        categoryOr.push({ categories: { $in: normalizedCategory.microCategoryLabels } });
        categoryOr.push({ niche: { $in: normalizedCategory.microCategoryLabels } });
      }

      if (categoryOr.length === 0) {
        categoryOr.push({ categories: { $regex: category, $options: 'i' } });
      }

      filter.$and.push({ $or: categoryOr });
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

// Get influencer's inquiries (forwarded to them)
const getMyInquiries = async (req, res) => {
  try {
    // Search within the forwardedTo array for the logged-in influencer's ID
    const inquiries = await Inquiry.find({ 
      'forwardedTo.userId': req.user._id 
    })
    .populate('userId', 'name email phone')
    .populate('forwardedTo.userId', 'firstName lastName email fullName profileType')
    .populate('forwardedTo.forwardedBy', 'name email')
    .sort({ createdAt: -1 });
    
    // Transform each inquiry to show only this influencer's individual status
    const transformedInquiries = inquiries.map(inquiry => {
      const inquiryObj = inquiry.toObject();
      
      // Find this influencer's entry in forwardedTo
      const myForwardedEntry = inquiryObj.forwardedTo.find(
        f => f.userId && (f.userId._id?.toString?.() === req.user._id.toString() || f.userId.toString?.() === req.user._id.toString())
      );
      
      if (myForwardedEntry) {
        // Map individual acceptanceStatus to a status string that frontend can understand
        let displayStatus;
        
        // Check if inquiry has been assigned to someone (and it's not this influencer)
        const hasAssignedInfluencer = inquiryObj.assignedInfluencer?.userId;
        const isThisInfluencerAssigned = hasAssignedInfluencer && 
          (inquiryObj.assignedInfluencer.userId?.toString?.() === req.user._id.toString() || 
           inquiryObj.assignedInfluencer.userId === req.user._id.toString());
        const isAssignedToOtherInfluencer = hasAssignedInfluencer && !isThisInfluencerAssigned;
        
        // If assigned to this influencer, or assigned to another influencer, show completed status
        if (isThisInfluencerAssigned) {
          displayStatus = 'completed'; // Assigned to this influencer - completed/success
        } else if (isAssignedToOtherInfluencer) {
          displayStatus = 'completed'; // Assigned to someone else - inquiry no longer available
        } else if (myForwardedEntry.acceptanceStatus === 'accepted') {
          displayStatus = 'artist_accepted'; // This influencer accepted (and wasn't auto-rejected)
        } else if (myForwardedEntry.acceptanceStatus === 'rejected') {
          displayStatus = 'artist_rejected';
        } else if (myForwardedEntry.acceptanceStatus === 'auto-rejected') {
          displayStatus = 'artist_rejected'; // Show as rejected to user
        } else {
          displayStatus = 'forwarded'; // pending status
        }
        
        // Replace the global status with the individual status for this influencer
        inquiryObj.status = displayStatus;
      }
      
      return inquiryObj;
    });
    
    res.status(200).json({
      success: true,
      data: transformedInquiries
    });
  } catch (error) {
    console.error('Error fetching influencer inquiries:', error);
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

    // Check if this inquiry was actually forwarded to this influencer
    const forwardIndex = inquiry.forwardedTo && inquiry.forwardedTo.findIndex(
      f => f.userId && f.userId.toString() === req.user._id.toString()
    );

    if (forwardIndex === -1 || forwardIndex === undefined) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to respond to this inquiry (not forwarded to you)'
      });
    }

    // Update ONLY this influencer's record in forwardedTo array
    const acceptanceStatus = status === 'accepted' ? 'accepted' : 'rejected';
    inquiry.forwardedTo[forwardIndex].acceptanceStatus = acceptanceStatus;
    inquiry.forwardedTo[forwardIndex].response = responseMessage || '';
    
    if (status === 'accepted') {
      inquiry.forwardedTo[forwardIndex].acceptedAt = new Date();
    } else {
      inquiry.forwardedTo[forwardIndex].rejectedAt = new Date();
    }

    // If accepted, set as assigned influencer (one-time assignment, first to accept)
    if (status === 'accepted' && !inquiry.assignedInfluencer?.userId) {
      inquiry.assignedInfluencer = {
        userId: req.user._id,
        assignedBy: req.user._id,
        assignedAt: new Date()
      };
      
      // Update global inquiry status only when someone accepts
      inquiry.status = 'artist_accepted';
      inquiry.artistStatus = 'accepted';
      inquiry.progressPercentage = 70;

      // Mark event date as unavailable for this influencer
      if (inquiry.eventDate) {
        const busyDay = toDayStartUtc(inquiry.eventDate);
        if (busyDay) {
          await Influencer.findByIdAndUpdate(req.user._id, {
            $addToSet: { unavailableDates: busyDay }
          });
        }
      }

      // Add to workflow history
      inquiry.workflowHistory.push({
        stage: 'artist_review',
        status: 'artist_accepted',
        updatedBy: req.user._id,
        notes: responseMessage || 'Influencer accepted the inquiry'
      });
    } else if (status === 'rejected') {
      // Check if all forwarded influencers have rejected
      // Exclude the current user's entry (already updated above) — check everyone else
      const allRejected = inquiry.forwardedTo.every(f => {
        const isCurrentUser = f.userId && f.userId.toString() === req.user._id.toString();
        if (isCurrentUser) {
          // Current user just set their status to 'rejected' — count it
          return true;
        }
        return f.acceptanceStatus === 'rejected' || f.acceptanceStatus === 'auto-rejected';
      });
      
      if (allRejected) {
        // If all have rejected, set overall status to artist_rejected
        inquiry.status = 'artist_rejected';
        inquiry.artistStatus = 'rejected';
        inquiry.progressPercentage = 30;
      }
      
      inquiry.workflowHistory.push({
        stage: 'artist_review',
        status: 'artist_rejected',
        updatedBy: req.user._id,
        notes: responseMessage || 'Influencer rejected the inquiry'
      });
    }

    await inquiry.save();

    // Return populated inquiry so frontend gets fresh data
    const populated = await Inquiry.findById(id)
      .populate('userId', 'name email phone')
      .populate('assignedInfluencer.userId', 'firstName lastName email name profileType fullName')
      .populate('forwardedTo.userId', 'firstName lastName email name profileType fullName')
      .populate('workflowHistory.updatedBy', 'name email');

    res.status(200).json({
      success: true,
      message: `Inquiry ${status}ed successfully`,
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
  getMyAvailability,
  updateMyAvailability,
  addMyUnavailableDates,
  removeMyUnavailableDates,
  upload,
  getMyInquiries,
  respondToInquiry,
  uploadProfileImage
};
