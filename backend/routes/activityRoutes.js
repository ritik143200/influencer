const express = require('express');
const router = express.Router();
const {
  getRecentActivities,
  markActivitiesAsRead,
  getActivityStats,
  cleanupOldActivities
} = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');

// Admin-only middleware
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

// Apply auth and admin checks to all routes
router.use(protect);
router.use(adminOnly);

// Get recent activities with pagination and filtering
router.get('/', getRecentActivities);

// Get activity statistics
router.get('/stats', getActivityStats);

// Mark activities as read
router.patch('/mark-read', markActivitiesAsRead);

// Cleanup old activities (admin only)
router.delete('/cleanup', cleanupOldActivities);

module.exports = router;
