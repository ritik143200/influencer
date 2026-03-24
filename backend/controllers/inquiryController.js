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

        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        if (!name || !email || !phone || !hiringFor || !category || !location || !eventType || !eventDate || budget === undefined || budget === null || budget === '') {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }

        const inquiry = await Inquiry.create({
            userId: req.user._id,
            name,
            email,
            phone,
            hiringFor,
            category,
            location,
            eventType,
            eventDate,
            budget,
            requirements: requirements || '',
            status: 'pending'
        });

        try {
            await Notification.create({
                type: 'inquiry',
                message: `New hiring inquiry from ${name} (${hiringFor})`,
                relatedId: inquiry._id
            });
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
