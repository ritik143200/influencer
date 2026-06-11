// Booking import removed
const User = require('../models/User');
const Influencer = require('../models/influencer');
const Inquiry = require('../models/Inquiry');
const { logInquiryStatusUpdate, logInfluencerStatusUpdate } = require('../middleware/activityLogger');
const {
    ensureCategoryDirectory,
    collectInfluencerMicroCategoryCounts
} = require('../utils/categoryHelpers');

const toDayRangeUtc = (dateInput) => {
    const d = new Date(dateInput);
    if (Number.isNaN(d.getTime())) return null;

    const dayStart = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    const dayEnd = new Date(dayStart);
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);
    return { dayStart, dayEnd };
};

let overviewCache = null;
let lastCacheUpdate = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const clearOverviewCache = () => {
    overviewCache = null;
    lastCacheUpdate = 0;
};

const escapeRegex = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const toComparableList = (...values) => {
    const tokens = [];

    values.flat(Infinity).forEach((value) => {
        if (value === undefined || value === null) return;
        if (typeof value === 'object') {
            Object.values(value).forEach((nested) => tokens.push(nested));
            return;
        }
        String(value)
            .split(',')
            .map((item) => item.trim().toLowerCase())
            .filter(Boolean)
            .forEach((item) => tokens.push(item));
    });

    return [...new Set(tokens)];
};

const intersect = (left = [], right = []) => {
    const rightSet = new Set(right);
    return left.filter((item) => rightSet.has(item));
};

const getLocationText = (location) => {
    if (!location) return '';
    if (typeof location === 'string') return location.toLowerCase();
    return [location.city, location.state, location.country, location.address]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
};

const toNumber = (value) => {
    if (value === undefined || value === null || value === '') return null;
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    if (typeof value === 'object') {
        const nestedValues = Object.values(value)
            .map(toNumber)
            .filter((nested) => nested !== null);
        return nestedValues.length > 0 ? Math.max(...nestedValues) : null;
    }
    const cleaned = String(value).replace(/[^\d.]/g, '');
    if (!cleaned) return null;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
};

const getInfluencerBudgetRange = (influencer = {}) => {
    const pricing = influencer.pricing || {};
    const knownValues = [
        influencer.budgetMin,
        influencer.budgetMax,
        influencer.budget,
        pricing.collaborationCharges,
        pricing.reel,
        pricing.reelCreation,
        pricing.story,
        pricing.collab,
        pricing.staticPost,
        pricing.other,
        ...(Array.isArray(pricing.custom) ? pricing.custom.map((item) => item.amount) : [])
    ]
        .map(toNumber)
        .filter((value) => value !== null && value >= 0);

    if (knownValues.length === 0) {
        return { min: null, max: null };
    }

    return {
        min: toNumber(influencer.budgetMin) ?? Math.min(...knownValues),
        max: toNumber(influencer.budgetMax) ?? Math.max(...knownValues)
    };
};

const calculateProfileCompleteness = (influencer = {}) => {
    const checks = [
        influencer.fullName || influencer.firstName,
        influencer.email,
        influencer.phone,
        getLocationText(influencer.location),
        influencer.bio,
        toComparableList(influencer.mainCategories, influencer.microCategories, influencer.categories, influencer.niche).length > 0,
        influencer.socialLinks?.instagram || influencer.platforms?.instagram?.url,
        influencer.socialLinks?.youtube || influencer.platforms?.youtube?.url,
        influencer.profileImage && !String(influencer.profileImage).includes('picsum.photos'),
        Array.isArray(influencer.portfolio) && influencer.portfolio.length > 0
    ];

    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
};

const getFollowerSignal = (influencer = {}) => {
    const platformValues = Object.values(influencer.platforms || {})
        .flatMap((platform) => [platform?.followers, platform?.subscribers])
        .map(toNumber)
        .filter((value) => value !== null);

    if (platformValues.length === 0) return 0;
    const highest = Math.max(...platformValues);
    if (highest >= 1000000) return 10;
    if (highest >= 100000) return 8;
    if (highest >= 10000) return 6;
    if (highest >= 1000) return 4;
    return 2;
};

const scoreInfluencerForInquiry = (inquiry, influencer) => {
    const inquiryMain = toComparableList(inquiry.mainCategories, inquiry.hiringFor);
    const inquiryMicro = toComparableList(inquiry.microCategories, inquiry.category);
    const influencerMain = toComparableList(
        influencer.mainCategories,
        influencer.subcategory,
        influencer.categorySelections?.map((item) => item.mainCategorySlug)
    );
    const influencerMicro = toComparableList(
        influencer.microCategories,
        influencer.categories,
        influencer.niche,
        influencer.subcategories,
        influencer.category,
        influencer.categorySelections?.map((item) => item.microCategorySlug)
    );

    const mainMatches = intersect(inquiryMain, influencerMain);
    const microMatches = intersect(inquiryMicro, influencerMicro);
    const reasons = [];
    let score = 0;

    if (microMatches.length > 0) {
        score += Math.min(55, 38 + microMatches.length * 6);
        reasons.push(`Micro category match: ${microMatches.slice(0, 3).join(', ')}`);
    }

    if (mainMatches.length > 0) {
        score += Math.min(25, 18 + mainMatches.length * 4);
        reasons.push(`Main category match: ${mainMatches.slice(0, 2).join(', ')}`);
    }

    const inquiryLocation = getLocationText(inquiry.location);
    const influencerLocation = getLocationText(influencer.location);
    if (inquiryLocation && influencerLocation) {
        const locationTokens = inquiryLocation.split(/\s+/).filter((token) => token.length > 2);
        const hasLocationMatch = locationTokens.some((token) => influencerLocation.includes(token));
        if (hasLocationMatch || influencerLocation.includes(inquiryLocation) || inquiryLocation.includes(influencerLocation)) {
            score += 15;
            reasons.push('Location fit');
        }
    }

    const inquiryBudget = toNumber(inquiry.budget);
    const budgetRange = getInfluencerBudgetRange(influencer);
    if (inquiryBudget !== null) {
        if (budgetRange.min === null && budgetRange.max === null) {
            score += 4;
            reasons.push('Budget open for review');
        } else if (
            (budgetRange.min === null || inquiryBudget >= budgetRange.min) &&
            (budgetRange.max === null || inquiryBudget >= budgetRange.max || inquiryBudget <= budgetRange.max * 1.25)
        ) {
            score += 12;
            reasons.push('Budget fit');
        } else if (budgetRange.min !== null && inquiryBudget >= budgetRange.min * 0.75) {
            score += 6;
            reasons.push('Near budget fit');
        }
    }

    const completeness = calculateProfileCompleteness(influencer);
    score += Math.round((completeness / 100) * 8);
    if (completeness >= 70) reasons.push(`Profile ${completeness}% complete`);

    if (influencer.verificationStatus === 'verified') {
        score += 5;
        reasons.push('Verified creator');
    }

    const followerSignal = getFollowerSignal(influencer);
    if (followerSignal > 0) {
        score += followerSignal;
        reasons.push('Audience data available');
    }

    return {
        score: Math.min(100, Math.round(score)),
        reasons,
        mainMatches,
        microMatches,
        profileCompletion: completeness,
        budgetRange
    };
};

// @desc    Get admin overview analytics (counts + top inquirer)
// @route   GET /api/admin/overview
// @access  Private/Admin
const getAdminOverview = async (req, res) => {
    try {
        // Check cache first
        const now = Date.now();
        if (overviewCache && (now - lastCacheUpdate < CACHE_TTL)) {
            return res.status(200).json({
                success: true,
                data: overviewCache,
                fromCache: true
            });
        }

        const statsPromise = Inquiry.aggregate([
            {
                $facet: {
                    counts: [
                        {
                            $group: {
                                _id: null,
                                total: { $sum: 1 },
                                pending: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $or: [
                                                    { $eq: [{ $toLower: "$status" }, "pending"] },
                                                    { $eq: [{ $toLower: "$adminStatus" }, "pending"] },
                                                    { $eq: [{ $toLower: "$status" }, "sent"] }
                                                ]
                                            },
                                            1,
                                            0
                                        ]
                                    }
                                },
                                completed: {
                                    $sum: {
                                        $cond: [{ $eq: [{ $toLower: "$status" }, "completed"] }, 1, 0]
                                    }
                                }
                            }
                        }
                    ],
                    topInquirer: [
                        { $match: { userId: { $ne: null } } },
                        { $group: { _id: "$userId", inquiriesCount: { $sum: 1 } } },
                        { $sort: { inquiriesCount: -1 } },
                        { $limit: 1 },
                        {
                            $lookup: {
                                from: 'users',
                                localField: '_id',
                                foreignField: '_id',
                                as: 'userDetails'
                            }
                        },
                        { $unwind: '$userDetails' },
                        {
                            $project: {
                                userId: '$_id',
                                inquiriesCount: 1,
                                name: '$userDetails.name',
                                email: '$userDetails.email'
                            }
                        }
                    ]
                }
            }
        ]);

        const [totalUsers, totalInfluencers, statsData, categoryDirectory, influencerCategoryRows] = await Promise.all([
            User.countDocuments(),
            Influencer.countDocuments({ profileType: 'influencer' }),
            statsPromise,
            ensureCategoryDirectory(),
            Influencer.find({ profileType: 'influencer' }).select('mainCategories microCategories categorySelections categories niche').lean()
        ]);

        const counts = statsData[0].counts[0] || { total: 0, pending: 0, completed: 0 };
        const topInquirer = statsData[0].topInquirer[0] || null;
        const { microCounts, mainCounts, index } = collectInfluencerMicroCategoryCounts(influencerCategoryRows, categoryDirectory);

        const topMicroCategories = Object.entries(microCounts)
            .map(([slug, count]) => ({
                slug,
                name: index.microBySlug.get(slug)?.name || slug,
                count
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        const mainCategoryBreakdown = Object.entries(mainCounts)
            .map(([slug, count]) => ({
                slug,
                name: index.mainBySlug.get(slug)?.name || slug,
                count
            }))
            .sort((a, b) => b.count - a.count);

        const overviewData = {
            totalUsers,
            totalInfluencers,
            totalInquiries: counts.total,
            pendingInquiries: counts.pending,
            processedInquiries: counts.total - counts.pending,
            completedInquiries: counts.completed,
            topInquirer,
            topMicroCategories,
            mainCategoryBreakdown
        };

        // Update cache
        overviewCache = overviewData;
        lastCacheUpdate = Date.now();

        res.status(200).json({
            success: true,
            data: overviewData
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

        // Invalidate cache
        clearOverviewCache();

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

        // Invalidate cache
        clearOverviewCache();

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
        const {
            status,
            adminStatus,
            artistStatus,
            hiringFor,
            category,
            mainCategory,
            microCategory,
            search,
            from,
            to,
            minBudget,
            maxBudget,
            page = 1,
            limit = 100
        } = req.query;

        const filter = {};

        if (status && status !== 'all') filter.status = status;
        if (adminStatus && adminStatus !== 'all') filter.adminStatus = adminStatus;
        if (artistStatus && artistStatus !== 'all') filter.artistStatus = artistStatus;
        if (hiringFor && hiringFor !== 'all') filter.hiringFor = hiringFor;
        if (mainCategory && mainCategory !== 'all') filter.mainCategories = mainCategory;
        if (microCategory && microCategory !== 'all') filter.microCategories = microCategory;

        if (category && category !== 'all') {
            const categoryRegex = new RegExp(escapeRegex(category), 'i');
            filter.$or = [
                { category: categoryRegex },
                { mainCategories: categoryRegex },
                { microCategories: categoryRegex }
            ];
        }

        if (search && search.trim()) {
            const searchRegex = new RegExp(escapeRegex(search.trim()), 'i');
            const searchOr = [
                { name: searchRegex },
                { email: searchRegex },
                { phone: searchRegex },
                { campaignName: searchRegex },
                { requirements: searchRegex },
                { location: searchRegex },
                { category: searchRegex },
                { hiringFor: searchRegex }
            ];
            filter.$and = filter.$and || [];
            filter.$and.push({ $or: searchOr });
        }

        if (from || to) {
            filter.createdAt = {};
            if (from) filter.createdAt.$gte = new Date(from);
            if (to) {
                const end = new Date(to);
                end.setHours(23, 59, 59, 999);
                filter.createdAt.$lte = end;
            }
        }

        if (minBudget || maxBudget) {
            filter.budget = {};
            if (minBudget) filter.budget.$gte = Number(minBudget);
            if (maxBudget) filter.budget.$lte = Number(maxBudget);
        }

        const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 250);
        const safePage = Math.max(Number(page) || 1, 1);
        const skip = (safePage - 1) * safeLimit;

        const [inquiries, total] = await Promise.all([
            Inquiry.find(filter)
            .populate('userId', 'name email phone')
            .populate('assignedInfluencer.userId', 'firstName lastName email name profileType fullName')
            .populate('forwardedTo.userId', 'firstName lastName email name profileType fullName')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(safeLimit),
            Inquiry.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            count: inquiries.length,
            total,
            page: safePage,
            pages: Math.ceil(total / safeLimit),
            data: inquiries
        });
    } catch (error) {
        console.error('Error fetching all inquiries:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching all inquiries',
            error: error.message
        });
    }
};

// @desc    Get best influencer matches for one brand inquiry
// @route   GET /api/admin/inquiries/:id/matches
// @access  Private/Admin
const getInquiryMatches = async (req, res) => {
    try {
        const { id } = req.params;
        const safeLimit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
        const minScore = Math.max(Number(req.query.minScore) || 1, 0);

        const inquiry = await Inquiry.findById(id).lean();
        if (!inquiry) {
            return res.status(404).json({ success: false, message: 'Inquiry not found' });
        }

        const influencers = await Influencer.find({
            profileType: 'influencer',
            isActive: true
        })
            .select('-password -resetPasswordToken -resetPasswordExpires')
            .lean();

        const matches = influencers
            .map((influencer) => {
                const match = scoreInfluencerForInquiry(inquiry, influencer);
                return {
                    influencer,
                    matchScore: match.score,
                    reasons: match.reasons,
                    mainMatches: match.mainMatches,
                    microMatches: match.microMatches,
                    profileCompletion: match.profileCompletion,
                    budgetRange: match.budgetRange
                };
            })
            .filter((item) => item.matchScore >= minScore)
            .sort((a, b) => {
                if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
                return new Date(b.influencer.registrationDate || b.influencer.createdAt || 0) -
                    new Date(a.influencer.registrationDate || a.influencer.createdAt || 0);
            })
            .slice(0, safeLimit);

        return res.status(200).json({
            success: true,
            count: matches.length,
            data: matches,
            meta: {
                inquiryId: inquiry._id,
                campaignName: inquiry.campaignName,
                mainCategories: inquiry.mainCategories || [],
                microCategories: inquiry.microCategories || [],
                location: inquiry.location,
                budget: inquiry.budget,
                algorithm: 'rule-based-v1'
            }
        });
    } catch (error) {
        console.error('Error matching influencers for inquiry:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while matching influencers',
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

        // Invalidate cache
        clearOverviewCache();

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

        // Invalidate cache
        clearOverviewCache();

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

        // Invalidate cache
        clearOverviewCache();

        // Populate and return
        const populated = await Inquiry.findById(id)
            .populate('userId', 'name email phone')
            .populate('assignedInfluencer.userId', 'name email fullName')
            .populate('forwardedTo.userId', 'firstName lastName email name profileType fullName')
            .populate('workflowHistory.updatedBy', 'name email');

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

// @desc    Update featured influencers for home page
// @route   PUT /api/admin/featured-influencers
// @access  Private/Admin
const updateFeaturedInfluencers = async (req, res) => {
    try {
        const { featuredIds } = req.body;
        
        if (!Array.isArray(featuredIds)) {
            return res.status(400).json({ success: false, message: 'featuredIds must be an array' });
        }

        // First, set all to trending: false, featuredOrder: 0
        await Influencer.updateMany({}, { $set: { trending: false, featuredOrder: 0 } });

        // Then update the selected ones with their new order
        const bulkOps = featuredIds.map((id, index) => ({
            updateOne: {
                filter: { _id: id },
                update: { $set: { trending: true, featuredOrder: index } }
            }
        }));

        if (bulkOps.length > 0) {
            await Influencer.bulkWrite(bulkOps);
        }

        // Invalidate cache
        clearOverviewCache();

        res.status(200).json({ success: true, message: 'Featured influencers updated successfully' });
    } catch (error) {
        console.error('Error updating featured influencers:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

module.exports = {
    getAllInquiries,
    getInquiryMatches,
    updateInquiryStatus,
    getAllUsers,
    updateUserAction,
    deleteUser,
    forwardInquiry,
    assignInquiryToArtist,
    getInquiryStats,
    getAvailableInfluencersByDate,
    updateArtistStatus,
    getAdminOverview,
    updateFeaturedInfluencers
};
