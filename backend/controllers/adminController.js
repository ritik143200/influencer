// Booking import removed
const User = require('../models/User');
const Inquiry = require('../models/Inquiry');

// @desc    Get all bookings (Admin)
// @route   GET /api/admin/bookings
// @access  Private/Admin
// Booking-related functions removed

// @desc    Get all users (Admin)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching all users:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching users', error: error.message });
    }
};

// @desc    Update user status (Admin)
// @route   POST /api/admin/users/:id/:action
// @access  Private/Admin
const updateUserAction = async (req, res) => {
    try {
        const { id, action } = req.params;

        let status;
        if (action === 'block') status = 'blocked';
        else if (action === 'unblock') status = 'active';
        else if (action === 'suspend') status = 'suspended';
        else return res.status(400).json({ message: 'Invalid action' });

        const user = await User.findById(id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.status = status;
        await user.save();

        res.status(200).json(user);
    } catch (error) {
        console.error(`Error updating user status:`, error);
        res.status(500).json({ success: false, message: 'Server error while updating user', error: error.message });
    }
};

// @desc    Delete user permanently (Admin)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json({ success: true, message: 'User deleted permanently' });
    } catch (error) {
        console.error(`Error deleting user:`, error);
        res.status(500).json({ success: false, message: 'Server error while deleting user', error: error.message });
    }
};

// @desc    Get all inquiries (Admin)
// @route   GET /api/admin/inquiries
// @access  Private/Admin
const getAllInquiries = async (req, res) => {
    try {
        const inquiries = await Inquiry.find()
            .populate('userId', 'name email phone')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: inquiries.length, data: inquiries });
    } catch (error) {
        console.error('Error fetching all inquiries:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching all inquiries',
            error: error.message
        });
    }
};

// @desc    Update inquiry status (Admin)
// @route   PATCH /api/admin/inquiries/:id/:action
// @access  Private/Admin
const updateInquiryStatus = async (req, res) => {
    try {
        const { id, action } = req.params;

        let status;
        if (action === 'accept') status = 'accepted';
        else if (action === 'reject') status = 'rejected';
        else return res.status(400).json({ success: false, message: 'Invalid action. Use: accept, reject' });

        const inquiry = await Inquiry.findById(id);
        if (!inquiry) {
            return res.status(404).json({ success: false, message: 'Inquiry not found' });
        }

        inquiry.status = status;
        await inquiry.save();

        const populated = await Inquiry.findById(id)
            .populate('userId', 'name email phone');

        res.status(200).json({ success: true, data: populated });
    } catch (error) {
        console.error('Error updating inquiry status:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating inquiry',
            error: error.message
        });
    }
};

// @desc    Forward an inquiry to one or more artists/influencers
// @route   POST /api/admin/inquiries/:id/forward
// @access  Private/Admin
const forwardInquiry = async (req, res) => {
    try {
        const { id } = req.params;
        const { recipients } = req.body; // array of userIds

        if (!Array.isArray(recipients) || recipients.length === 0) {
            return res.status(400).json({ success: false, message: 'Provide recipients array of userIds' });
        }

        console.log('Admin forwarding inquiry', { inquiryId: id, recipients, forwardedBy: req.user?._id });

        // Validate recipients exist and are artists/influencers
        const validUsers = await User.find({ _id: { $in: recipients } }).select('_id role firstName lastName email name');
        const validIds = validUsers.map(u => String(u._id));
        const invalid = recipients.filter(r => !validIds.includes(String(r)));
        if (invalid.length > 0) {
            return res.status(400).json({ success: false, message: 'Some recipients not found', invalid });
        }
        const inquiry = await Inquiry.findById(id);
        if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found' });

        // Add recipients to forwardedTo if not already present
        const existing = new Set((inquiry.forwardedTo || []).map(f => String(f.userId)));
        const additions = [];
        for (const rid of recipients) {
            if (!existing.has(String(rid))) {
                inquiry.forwardedTo = inquiry.forwardedTo || [];
                inquiry.forwardedTo.push({ userId: rid, forwardedBy: req.user._id });
                additions.push(rid);
            }
        }

        await inquiry.save();

        // Return populated inquiry
        const populated = await Inquiry.findById(id)
            .populate('userId', 'name email phone')
            .populate('forwardedTo.userId', 'firstName lastName email name role');

        console.log('Forwarded inquiry saved, additions:', additions);
        res.status(200).json({ success: true, data: populated, added: additions });
    } catch (error) {
        console.error('Error forwarding inquiry:', error);
        res.status(500).json({ success: false, message: 'Server error while forwarding inquiry' });
    }
};

module.exports = {
    getAllInquiries,
    updateInquiryStatus,
    getAllUsers,
    updateUserAction,
    deleteUser,
    forwardInquiry
};
