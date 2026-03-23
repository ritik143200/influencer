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
