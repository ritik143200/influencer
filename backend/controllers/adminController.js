// Booking import removed
const User = require('../models/User');
const Influencer = require('../models/influencer');
const Inquiry = require('../models/Inquiry');

// @desc    Update artist status (activate/deactivate)
// @route   PATCH /api/admin/artists/:id/status
// @access  Private/Admin
const updateArtistStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const influencer = await Influencer.findById(id);
        if (!influencer) {
            return res.status(404).json({ success: false, message: 'Artist not found' });
        }

        influencer.isActive = isActive;
        await artist.save();

        res.status(200).json({ 
            success: true, 
            message: `Artist ${isActive ? 'activated' : 'deactivated'} successfully`,
            data: artist
        });
    } catch (error) {
        console.error('Error updating artist status:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while updating artist status',
            error: error.message 
        });
    }
};

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
            .populate('forwardedTo.userId', 'firstName lastName email name profileType fullName')
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
        const { notes } = req.body;

        const inquiry = await Inquiry.findById(id);
        if (!inquiry) {
            return res.status(404).json({ success: false, message: 'Inquiry not found' });
        }

        let newStatus, newProgress;
        
        if (action === 'accept') {
            newStatus = 'admin_accepted';
            newProgress = 40;
            inquiry.adminStatus = 'accepted';
        } else if (action === 'reject') {
            newStatus = 'admin_rejected';
            newProgress = 100;
            inquiry.adminStatus = 'rejected';
        } else {
            return res.status(400).json({ success: false, message: 'Invalid action. Use: accept, reject' });
        }

        inquiry.status = newStatus;
        inquiry.progressPercentage = newProgress;
        
        // Add to workflow history
        inquiry.workflowHistory.push({
            stage: 'admin_review',
            status: newStatus,
            updatedBy: req.user._id,
            notes: notes || `Admin ${action}ed the inquiry`
        });

        await inquiry.save();

        const populated = await Inquiry.findById(id)
            .populate('userId', 'name email phone')
            .populate('forwardedTo.userId', 'firstName lastName email name profileType fullName')
            .populate('workflowHistory.updatedBy', 'name email');

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
        const { recipients, notes } = req.body; // array of userIds

        if (!Array.isArray(recipients) || recipients.length === 0) {
            return res.status(400).json({ success: false, message: 'Provide recipients array of userIds' });
        }

        console.log('Admin forwarding inquiry', { inquiryId: id, recipients, forwardedBy: req.user?._id });

        // Validate recipients exist and are artists/influencers
        const validArtists = await Influencer.find({ _id: { $in: recipients } }).select('_id role firstName lastName email name profileType');
        const validIds = validArtists.map(u => String(u._id));
        const invalid = recipients.filter(r => !validIds.includes(String(r)));
        if (invalid.length > 0) {
            return res.status(400).json({ success: false, message: 'Some recipients not found', invalid });
        }
        const inquiry = await Inquiry.findById(id);
        if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found' });

        // Update status and progress
        inquiry.status = 'forwarded';
        inquiry.progressPercentage = 60;

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

        // Add to workflow history
        inquiry.workflowHistory.push({
            stage: 'forwarded',
            status: 'forwarded',
            updatedBy: req.user._id,
            notes: notes || `Inquiry forwarded to ${recipients.length} artist(s)/influencer(s)`
        });

        await inquiry.save();

        // Return populated inquiry
        const populated = await Inquiry.findById(id)
            .populate('userId', 'name email phone')
            .populate('forwardedTo.userId', 'firstName lastName email name profileType')
            .populate('workflowHistory.updatedBy', 'name email');

        console.log('Forwarded inquiry saved, additions:', additions);
        res.status(200).json({ success: true, data: populated, added: additions });
    } catch (error) {
        console.error('Error forwarding inquiry:', error);
        res.status(500).json({ success: false, message: 'Server error while forwarding inquiry' });
    }
};

// @desc    Assign inquiry to specific artist and complete workflow
// @route   PATCH /api/admin/inquiries/:id/assign/:artistId
// @access  Private/Admin
const assignInquiryToArtist = async (req, res) => {
    try {
        const { id } = req.params;
        let { artistId } = req.params;
        const { notes } = req.body;

        const inquiry = await Inquiry.findById(id);
        if (!inquiry) {
            return res.status(404).json({ success: false, message: 'Inquiry not found' });
        }

        // Handle demo case - use a dummy artist ID
        if (artistId === 'demo') {
            console.log('Demo completion for inquiry:', id);
            inquiry.assignedInfluencer = {
                userId: null, // No specific artist for demo
                assignedBy: req.user._id,
                assignedAt: new Date()
            };
            inquiry.status = 'completed';
            inquiry.progressPercentage = 100;

            // Add to workflow history
            inquiry.workflowHistory.push({
                stage: 'completed',
                status: 'completed',
                updatedBy: req.user._id,
                notes: notes || 'Inquiry completed by admin (demo mode)'
            });
        } else {
            // Validate artist exists
            const artist = await Influencer.findById(artistId);
            if (!artist) {
                return res.status(404).json({ success: false, message: 'Artist not found' });
            }

            inquiry.assignedInfluencer = {
                userId: artistId,
                assignedBy: req.user._id,
                assignedAt: new Date()
            };

            inquiry.status = 'completed';
            inquiry.progressPercentage = 100;

            // Add to workflow history
            inquiry.workflowHistory.push({
                stage: 'completed',
                status: 'completed',
                updatedBy: req.user._id,
                notes: notes || `Inquiry assigned to ${artist.name || artist.fullName}`
            });
        }

        await inquiry.save();

        const populated = await Inquiry.findById(id)
            .populate('userId', 'name email phone')
            .populate('assignedInfluencer.userId', 'name email fullName')
            .populate('forwardedTo.userId', 'firstName lastName email name profileType fullName')
            .populate('workflowHistory.updatedBy', 'name email');

        res.status(200).json({ success: true, data: populated });
    } catch (error) {
        console.error('Error assigning inquiry to artist:', error);
        res.status(500).json({ success: false, message: 'Server error while assigning inquiry' });
    }
};

// @desc    Get workflow statistics
// @route   GET /api/admin/inquiries/stats
// @access  Private/Admin
const getInquiryStats = async (req, res) => {
    try {
        const stats = await Inquiry.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const totalInquiries = await Inquiry.countDocuments();
        const pendingAdmin = await Inquiry.countDocuments({ adminStatus: 'pending' });
        const pendingArtist = await Inquiry.countDocuments({ artistStatus: 'pending' });

        res.status(200).json({
            success: true,
            data: {
                total: totalInquiries,
                byStatus: stats,
                pendingAdmin,
                pendingArtist
            }
        });
    } catch (error) {
        console.error('Error fetching inquiry stats:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching stats' });
    }
};

module.exports = {
    getAllInquiries,
    updateInquiryStatus,
    getAllUsers,
    updateUserAction,
    deleteUser,
    forwardInquiry,
    assignInquiryToArtist,
    getInquiryStats,
    updateArtistStatus
};
