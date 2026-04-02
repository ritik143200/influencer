const ActivityLog = require('../models/ActivityLog');

// Get recent activities with pagination and filtering
const getRecentActivities = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Filter options
    const filters = {};
    if (req.query.type) {
      filters.type = req.query.type;
    }
    if (req.query.priority) {
      filters.priority = req.query.priority;
    }
    if (req.query.isRead !== undefined) {
      filters.isRead = req.query.isRead === 'true';
    }
    
    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filters.timestamp = {};
      if (req.query.startDate) {
        filters.timestamp.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filters.timestamp.$lte = new Date(req.query.endDate);
      }
    }
    
    // Fetch activities with population
    const activities = await ActivityLog.find(filters)
      .populate('userId', 'name email')
      .populate('influencerId', 'fullName email')
      .populate('inquiryId', 'name category status')
      .populate('performedBy', 'name email')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await ActivityLog.countDocuments(filters);
    
    // Get activity statistics
    const stats = await ActivityLog.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          latest: { $max: '$timestamp' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        activities,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        },
        stats,
        unreadCount: await ActivityLog.countDocuments({ isRead: false })
      }
    });
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activities'
    });
  }
};

// Mark activities as read
const markActivitiesAsRead = async (req, res) => {
  try {
    const { activityIds } = req.body;
    
    if (activityIds && activityIds.length > 0) {
      await ActivityLog.updateMany(
        { _id: { $in: activityIds } },
        { isRead: true }
      );
    } else {
      // Mark all as read
      await ActivityLog.updateMany(
        { isRead: false },
        { isRead: true }
      );
    }
    
    res.status(200).json({
      success: true,
      message: 'Activities marked as read'
    });
  } catch (error) {
    console.error('Error marking activities as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark activities as read'
    });
  }
};

// Get activity statistics
const getActivityStats = async (req, res) => {
  try {
    const timeRange = req.query.timeRange || '7d'; // 7d, 30d, 90d
    const startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }
    
    const stats = await ActivityLog.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            type: '$type',
            date: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$timestamp'
              }
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.type',
          dailyData: {
            $push: {
              date: '$_id.date',
              count: '$count'
            }
          },
          total: { $sum: '$count' }
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);
    
    const totalStats = await ActivityLog.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalActivities: { $sum: 1 },
          unreadActivities: {
            $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
          },
          highPriority: {
            $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] }
          }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        stats,
        total: totalStats[0] || {
          totalActivities: 0,
          unreadActivities: 0,
          highPriority: 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching activity stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity statistics'
    });
  }
};

// Delete old activities (cleanup)
const cleanupOldActivities = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 90;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const result = await ActivityLog.deleteMany({
      timestamp: { $lt: cutoffDate },
      isRead: true // Only delete read activities
    });
    
    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} old activities`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error cleaning up old activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup old activities'
    });
  }
};

module.exports = {
  getRecentActivities,
  markActivitiesAsRead,
  getActivityStats,
  cleanupOldActivities
};
