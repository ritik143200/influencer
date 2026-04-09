// Booking import removed
const User = require('../models/User');
const Influencer = require('../models/influencer');
const Inquiry = require('../models/Inquiry');
const { logInquiryStatusUpdate, logInfluencerStatusUpdate } = require('../middleware/activityLogger');

const toDayRangeUtc = (dateInput) => {
    const d = new Date(dateInput);
    if (Number.isNaN(d.getTime())) return null;

    const dayStart = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    const dayEnd = new Date(dayStart);
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);
    return { dayStart, dayEnd };
};

// @desc    Get admin overview analytics (counts + top inquirer)
// @route   GET /api/admin/overview
// @access  Private/Admin
const getAdminOverview = async (req, res) => {
    try {
        const [totalUsers, totalInfluencers, inquiries] = await Promise.all([
            User.countDocuments(),
            Influencer.countDocuments({ profileType: 'influencer' }),
            Inquiry.find().select('userId status adminStatus createdAt').populate('userId', 'name email fullName')
        ]);

        const totalInquiries = inquiries.length;

        const isPendingInquiry = (inq) => {
            const status = (inq.status || '').toLowerCase();
            const adminStatus = (inq.adminStatus || '').toLowerCase();
            return status === 'pending' || adminStatus === 'pending' || status === 'sent';
        };

        const pendingInquiries = inquiries.filter(isPendingInquiry).length;
        const processedInquiries = totalInquiries - pendingInquiries;
        const completedInquiries = inquiries.filter(inq => {
            const status = (inq.status || '').toLowerCase();
            const adminStatus = (inq.adminStatus || '').toLowerCase();
            const artistStatus = (inq.artistStatus || '').toLowerCase();
            
            // Only count inquiries that are fully completed (status === 'completed')
            return status === 'completed';
        }).length;

        const countsByUserId = new Map();
        for (const inq of inquiries) {
            if (!inq.userId) continue;
            const id = String(inq.userId._id || inq.userId);
            countsByUserId.set(id, (countsByUserId.get(id) || 0) + 1);
        }

        let topInquirer = null;
        for (const [userId, count] of countsByUserId.entries()) {
            if (!topInquirer || count > topInquirer.inquiriesCount) {
                const sampleInquiry = inquiries.find(i => String(i.userId?._id || i.userId) === userId);
                const u = sampleInquiry?.userId;
                topInquirer = {
                    userId,
                    inquiriesCount: count,
                    name: u?.name || u?.fullName || null,
                    email: u?.email || null
                };
            }
        }

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalInfluencers,
                totalInquiries,
                pendingInquiries,
                processedInquiries,
                completedInquiries,
                topInquirer
            }
        });
    } catch (error) {
        console.error('Error fetching admin overview:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching overview analytics', error: error.message });
    }
};

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

        const oldStatus = influencer.isActive;
        influencer.isActive = isActive;
        await influencer.save();

        // Log influencer status update activity
        try {
            await logInfluencerStatusUpdate(id, oldStatus, isActive, req.user._id);
        } catch (err) {
            console.error('Failed to log influencer status update activity:', err);
        }

        res.status(200).json({ 
            success: true, 
            message: `Artist ${isActive ? 'activated' : 'deactivated'} successfully`,
            data: influencer
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
            .populate('assignedInfluencer.userId', 'firstName lastName email name profileType fullName')
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

        const oldStatus = inquiry.status;
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

        // Log inquiry status update activity
        try {
            await logInquiryStatusUpdate(id, oldStatus, newStatus, req.user._id);
        } catch (err) {
            console.error('Failed to log inquiry status update activity:', err);
        }

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
        // Auth check
        if (!req.user || !req.user._id) {
            console.error('Unauthorized assign attempt - no user in request');
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }

        const { id, artistId } = req.params;
        const { notes } = req.body;

        console.log('Assign request:', { inquiryId: id, artistId, userId: req.user._id });

        // Validate inquiry exists
        const inquiry = await Inquiry.findById(id);
        if (!inquiry) {
            console.error('Inquiry not found:', id);
            return res.status(404).json({ success: false, message: 'Inquiry not found' });
        }

        console.log('Inquiry found, current status:', inquiry.status);

        // Handle demo case
        if (artistId === 'demo') {
            console.log('Demo completion mode for inquiry:', id);
            inquiry.assignedInfluencer = {
                userId: null,
                assignedBy: req.user._id,
                assignedAt: new Date()
            };
            inquiry.status = 'completed';
            inquiry.progressPercentage = 100;

            inquiry.workflowHistory.push({
                stage: 'completed',
                status: 'completed',
                updatedBy: req.user._id,
                notes: notes || 'Inquiry completed by admin (demo mode)'
            });

            console.log('Demo mode: inquiry prepared for save');
        } else {
            // Non-demo: validate and assign to specific artist
            console.log('Real artist assignment mode, validating artist:', artistId);

            // Validate artist ID format
            if (!artistId || artistId.length < 10) {
                console.error('Invalid artist ID format:', artistId);
                return res.status(400).json({ success: false, message: 'Invalid artist ID' });
            }

            // Validate artist exists
            const artist = await Influencer.findById(artistId);
            if (!artist) {
                console.error('Artist not found:', artistId);
                return res.status(404).json({ success: false, message: 'Artist/Influencer not found' });
            }

            console.log('Artist found:', artist.name || artist.fullName);

            inquiry.assignedInfluencer = {
                userId: artistId,
                assignedBy: req.user._id,
                assignedAt: new Date()
            };

            inquiry.status = 'completed';
            inquiry.progressPercentage = 100;

            // Auto-reject all OTHER influencers in forwardedTo
            if (inquiry.forwardedTo && Array.isArray(inquiry.forwardedTo) && inquiry.forwardedTo.length > 0) {
                console.log(`Processing ${inquiry.forwardedTo.length} forwarded influencers for auto-rejection`);
                
                inquiry.forwardedTo.forEach((forward, idx) => {
                    try {
                        if (forward && forward.userId) {
                            const forwardUserId = forward.userId.toString ? forward.userId.toString() : String(forward.userId);
                            const targetArtistId = String(artistId);

                            if (forwardUserId !== targetArtistId) {
                                console.log(`Auto-rejecting influencer ${idx}:`, forwardUserId);
                                forward.acceptanceStatus = 'auto-rejected';
                                forward.rejectedAt = new Date();
                                forward.response = 'Assignment given to another influencer';
                            } else {
                                console.log(`Keeping influencer ${idx} (assigned):`, forwardUserId);
                                forward.acceptanceStatus = 'accepted'; // Ensure accepted stays
                            }
                        }
                    } catch (err) {
                        console.error(`Error processing forward ${idx}:`, err.message);
                    }
                });
            }

            inquiry.workflowHistory.push({
                stage: 'completed',
                status: 'completed',
                updatedBy: req.user._id,
                notes: notes || `Inquiry assigned to ${artist.name || artist.fullName}`
            });

            console.log('Inquiry prepared for save with artist assignment');
        }

        // Save inquiry
        await inquiry.save();
        console.log('Inquiry saved successfully');

        // Populate and return
        const populated = await Inquiry.findById(id)
            .populate('userId', 'name email phone')
            .populate('assignedInfluencer.userId', 'name email fullName')
            .populate('forwardedTo.userId', 'firstName lastName email name profileType fullName')
            .populate('workflowHistory.updatedBy', 'name email');

        console.log('Inquiry populated and returning response');
        res.status(200).json({ success: true, data: populated });
    } catch (error) {
        console.error('Error assigning inquiry to artist:', error.message);
        console.error('Error stack:', error.stack);
        console.error('Full error object:', error);
        
        // Send detailed error info
        res.status(500).json({ 
            success: false, 
            message: `Server error while assigning inquiry: ${error.message}`,
            errorDetails: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            errorName: error.name
        });
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

// @desc    Get available influencers for selected date
// @route   GET /api/admin/influencers/available?date=YYYY-MM-DD
// @access  Private/Admin
const getAvailableInfluencersByDate = async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) {
            return res.status(400).json({ success: false, message: 'date query param is required (YYYY-MM-DD)' });
        }

        const range = toDayRangeUtc(date);
        if (!range) {
            return res.status(400).json({ success: false, message: 'Invalid date format' });
        }

        const { dayStart, dayEnd } = range;
        const available = await Influencer.find({
            profileType: 'influencer',
            isActive: true,
            $or: [
                { unavailableDates: { $exists: false } },
                { unavailableDates: { $size: 0 } },
                { unavailableDates: { $not: { $elemMatch: { $gte: dayStart, $lt: dayEnd } } } }
            ]
        })
            .select('-password')
            .sort({ registrationDate: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            data: available,
            meta: { selectedDate: dayStart.toISOString().slice(0, 10), count: available.length }
        });
    } catch (error) {
        console.error('Error fetching available influencers by date:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch available influencers', error: error.message });
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
    getAvailableInfluencersByDate,
    updateArtistStatus,
    getAdminOverview
};
