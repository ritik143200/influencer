const Inquiry = require('../models/Inquiry');
const Notification = require('../models/Notification');
const { logInquirySubmission } = require('../middleware/activityLogger');
const {
    ensureCategoryDirectory,
    normalizeCategoryPayload
} = require('../utils/categoryHelpers');

exports.createInquiry = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            campaignName,
            hiringFor,
            category,
            mainCategories,
            microCategories,
            categorySelections,
            location,
            eventDate,
            budget,
            requirements
        } = req.body;

        console.log('Creating inquiry with data:', { name, email, phone, campaignName, hiringFor, category, mainCategories, microCategories, location, eventDate, budget });

        if (!req.user || !req.user._id) {
            console.error('Unauthorized inquiry attempt - no user in request');
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        const requesterRole = req.user.role || req.user.profileType;
        if (requesterRole === 'influencer') {
            return res.status(403).json({
                success: false,
                message: 'Influencer accounts cannot create brand inquiries'
            });
        }

        const categoryDirectory = await ensureCategoryDirectory();
        const normalizedCategories = normalizeCategoryPayload({
            hiringFor,
            category,
            mainCategories,
            microCategories,
            categorySelections
        }, categoryDirectory);

        const resolvedHiringFor = normalizedCategories.primaryLegacyHiringValue || String(hiringFor || '').trim();
        const resolvedCategoryLabel = normalizedCategories.microCategoryLabels.join(', ') || String(category || '').trim();

        // Validate required fields
        const missingFields = [];
        if (!String(name || '').trim()) missingFields.push('name');
        if (!String(email || '').trim()) missingFields.push('email');
        if (!String(phone || '').trim()) missingFields.push('phone');
        if (!resolvedHiringFor) missingFields.push('hiringFor');
        if (!resolvedCategoryLabel) missingFields.push('category');
        if (!String(location || '').trim()) missingFields.push('location');
        if (budget === undefined || budget === null || budget === '') missingFields.push('budget');

        if (missingFields.length > 0) {
            console.error('Missing required fields:', missingFields);
            return res.status(400).json({ 
                success: false, 
                message: `Please provide all required fields: ${missingFields.join(', ')}` 
            });
        }

        // Validate hiringFor enum
        if (!['artist', 'influencer', 'creator', 'celebrity', 'city page', 'meme page'].includes(resolvedHiringFor)) {
            return res.status(400).json({ 
                success: false, 
                message: 'hiringFor must be "artist", "influencer", "creator", "celebrity", "city page", or "meme page"' 
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide a valid email address' 
            });
        }

        // Validate budget
        const budgetNum = Number(budget);
        if (isNaN(budgetNum) || budgetNum <= 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Budget must be a positive number' 
            });
        }

        // Create inquiry with new workflow status
        const inquiry = await Inquiry.create({
            userId: req.user._id,
            name,
            email,
            phone,
            campaignName: campaignName || '',
            hiringFor: resolvedHiringFor,
            category: resolvedCategoryLabel,
            mainCategories: normalizedCategories.mainCategories,
            microCategories: normalizedCategories.microCategories,
            categorySelections: normalizedCategories.categorySelections,
            location,
            eventDate: eventDate ? new Date(eventDate) : new Date(),
            budget: budgetNum,
            requirements: requirements || '',
            status: 'sent', // Use new workflow status
            progressPercentage: 10, // Start with 10% progress
            adminStatus: 'pending',
            artistStatus: 'pending',
            workflowHistory: [{
                stage: 'submitted',
                status: 'sent',
                updatedBy: req.user._id,
                notes: 'Inquiry submitted by user',
                updatedAt: new Date()
            }]
        });

        console.log('Inquiry created successfully:', inquiry._id);

        try {
            await Notification.create({
                type: 'inquiry',
                message: `New hiring inquiry from ${name} (${resolvedHiringFor})`,
                relatedId: inquiry._id
            });
            console.log('Admin notification created for inquiry:', inquiry._id);
        } catch (notifError) {
            console.error('Non-blocking error: Failed to create admin notification for inquiry', notifError);
        }

        // Log inquiry submission activity
        try {
            await logInquirySubmission(inquiry);
        } catch (err) {
            console.error('Failed to log inquiry submission activity:', err);
        }

        res.status(201).json({
            success: true,
            message: 'Inquiry submitted successfully',
            data: inquiry
        });
    } catch (error) {
        console.error('Error creating inquiry:', error);
        console.error('Error stack:', error.stack);
        
        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: validationErrors
            });
        }

        // Handle duplicate key errors
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Duplicate entry detected'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error while creating inquiry',
            error: error.message
        });
    }
};

// @desc    Get inquiries for the logged-in user
// @route   GET /api/inquiries
exports.getUserInquiries = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        const isInfluencerAccount = req.user.role === 'influencer' || req.user.profileType === 'influencer';
        const filter = isInfluencerAccount
            ? { 'forwardedTo.userId': req.user._id }
            : { userId: req.user._id };

        const inquiries = await Inquiry.find(filter)
            .populate('userId', 'name email phone role')
            .populate('assignedInfluencer.userId', 'firstName lastName fullName username email phone profileType role category categories mainCategories microCategories')
            .populate('forwardedTo.userId', 'firstName lastName fullName username email phone profileType role category categories mainCategories microCategories')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: inquiries.length, data: inquiries });
    } catch (error) {
        console.error('Error fetching user inquiries:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching inquiries' });
    }
};

// @desc    Update a brand inquiry owned by the logged-in brand/user
// @route   PUT /api/inquiries/:id
exports.updateInquiry = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        const requesterRole = req.user.role || req.user.profileType;
        if (requesterRole === 'influencer') {
            return res.status(403).json({
                success: false,
                message: 'Influencer accounts cannot edit brand inquiries'
            });
        }

        const inquiry = await Inquiry.findOne({ _id: req.params.id, userId: req.user._id });
        if (!inquiry) {
            return res.status(404).json({ success: false, message: 'Inquiry not found for this brand account' });
        }

        if (['completed', 'artist_accepted'].includes(inquiry.status)) {
            return res.status(400).json({
                success: false,
                message: 'This campaign can no longer be edited after influencer acceptance or completion'
            });
        }

        const {
            name,
            email,
            phone,
            campaignName,
            hiringFor,
            category,
            mainCategories,
            microCategories,
            categorySelections,
            location,
            eventDate,
            budget,
            requirements
        } = req.body;

        const categoryDirectory = await ensureCategoryDirectory();
        const normalizedCategories = normalizeCategoryPayload({
            hiringFor,
            category,
            mainCategories,
            microCategories,
            categorySelections
        }, categoryDirectory);

        const resolvedHiringFor = normalizedCategories.primaryLegacyHiringValue || hiringFor || inquiry.hiringFor;
        const resolvedCategoryLabel = normalizedCategories.microCategoryLabels.join(', ') || category || inquiry.category;

        if (resolvedHiringFor && !['artist', 'influencer', 'creator', 'celebrity', 'city page', 'meme page'].includes(resolvedHiringFor)) {
            return res.status(400).json({
                success: false,
                message: 'hiringFor must be "artist", "influencer", "creator", "celebrity", "city page", or "meme page"'
            });
        }

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
        }

        if (budget !== undefined && budget !== null && budget !== '') {
            const budgetNum = Number(budget);
            if (isNaN(budgetNum) || budgetNum <= 0) {
                return res.status(400).json({ success: false, message: 'Budget must be a positive number' });
            }
            inquiry.budget = budgetNum;
        }

        if (name !== undefined) inquiry.name = name;
        if (email !== undefined) inquiry.email = email;
        if (phone !== undefined) inquiry.phone = phone;
        if (campaignName !== undefined) inquiry.campaignName = campaignName;
        if (resolvedHiringFor) inquiry.hiringFor = resolvedHiringFor;
        if (resolvedCategoryLabel) inquiry.category = resolvedCategoryLabel;
        if (normalizedCategories.mainCategories.length > 0) inquiry.mainCategories = normalizedCategories.mainCategories;
        if (normalizedCategories.microCategories.length > 0) inquiry.microCategories = normalizedCategories.microCategories;
        if (normalizedCategories.categorySelections.length > 0) inquiry.categorySelections = normalizedCategories.categorySelections;
        if (location !== undefined) inquiry.location = location;
        if (eventDate !== undefined) inquiry.eventDate = eventDate ? new Date(eventDate) : inquiry.eventDate;
        if (requirements !== undefined) inquiry.requirements = requirements;

        inquiry.workflowHistory.push({
            stage: 'brand_edit',
            status: inquiry.status,
            updatedBy: req.user._id,
            notes: 'Campaign details updated by brand',
            updatedAt: new Date()
        });

        await inquiry.save();

        const populated = await Inquiry.findById(inquiry._id)
            .populate('userId', 'name email phone role')
            .populate('assignedInfluencer.userId', 'firstName lastName fullName username email phone profileType role category categories mainCategories microCategories')
            .populate('forwardedTo.userId', 'firstName lastName fullName username email phone profileType role category categories mainCategories microCategories');

        res.status(200).json({
            success: true,
            message: 'Campaign updated successfully',
            data: populated
        });
    } catch (error) {
        console.error('Error updating inquiry:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating inquiry',
            error: error.message
        });
    }
};
