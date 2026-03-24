const Inquiry = require('../models/Inquiry');
const Notification = require('../models/Notification');

exports.createInquiry = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            hiringFor,
            category,
            location,
            eventType,
            eventDate,
            budget,
            requirements
        } = req.body;

        console.log('Creating inquiry with data:', { name, email, phone, hiringFor, category, location, eventType, eventDate, budget });

        if (!req.user || !req.user._id) {
            console.error('Unauthorized inquiry attempt - no user in request');
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        // Validate required fields
        const missingFields = [];
        if (!name) missingFields.push('name');
        if (!email) missingFields.push('email');
        if (!phone) missingFields.push('phone');
        if (!hiringFor) missingFields.push('hiringFor');
        if (!category) missingFields.push('category');
        if (!location) missingFields.push('location');
        if (!eventType) missingFields.push('eventType');
        if (!eventDate) missingFields.push('eventDate');
        if (budget === undefined || budget === null || budget === '') missingFields.push('budget');

        if (missingFields.length > 0) {
            console.error('Missing required fields:', missingFields);
            return res.status(400).json({ 
                success: false, 
                message: `Please provide all required fields: ${missingFields.join(', ')}` 
            });
        }

        // Validate hiringFor enum
        if (!['artist', 'influencer'].includes(hiringFor)) {
            return res.status(400).json({ 
                success: false, 
                message: 'hiringFor must be either "artist" or "influencer"' 
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
            hiringFor,
            category,
            location,
            eventType,
            eventDate: new Date(eventDate),
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
                message: `New hiring inquiry from ${name} (${hiringFor})`,
                relatedId: inquiry._id
            });
            console.log('Admin notification created for inquiry:', inquiry._id);
        } catch (notifError) {
            console.error('Non-blocking error: Failed to create admin notification for inquiry', notifError);
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

        // Return inquiries the user created OR inquiries forwarded to this user (for artists)
        const inquiries = await Inquiry.find({
            $or: [
                { userId: req.user._id },
                { 'forwardedTo.userId': req.user._id }
            ]
        }).sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: inquiries.length, data: inquiries });
    } catch (error) {
        console.error('Error fetching user inquiries:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching inquiries' });
    }
};
