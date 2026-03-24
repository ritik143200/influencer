const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const {
    getAllBookings, updateBookingStatus,
    getAllInquiries, updateInquiryStatus, forwardInquiry, assignInquiryToArtist, getInquiryStats,
    getAllUsers, updateUserAction, deleteUser
} = require('../controllers/adminController');
const {
    getAdminNotifications, markAsRead, markAllAsRead
} = require('../controllers/notificationController');

// Ensure only admins can access these routes
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

// Apply auth & admin checks to all routes
router.use(protect);
router.use(adminOnly);

// Booking routes removed

// Inquiries Routing
router.get('/inquiries', getAllInquiries);
router.get('/inquiries/stats', getInquiryStats);
router.patch('/inquiries/:id/:action', updateInquiryStatus);
router.post('/inquiries/:id/forward', forwardInquiry);
router.patch('/inquiries/:id/assign/:artistId', assignInquiryToArtist);
router.patch('/inquiries/:id/assign/demo', (req, res) => {
  // Demo route for testing completion without selecting specific artist
  assignInquiryToArtist(req, res);
});

// Users Routing
router.get('/users', getAllUsers);
router.post('/users/:id/:action', updateUserAction);
router.delete('/users/:id', deleteUser);

// Artists Routing
router.patch('/artists/:id/status', updateArtistStatus);

// Notifications Routing
router.get('/notifications', getAdminNotifications);
router.patch('/notifications/read-all', markAllAsRead);
router.patch('/notifications/:id/read', markAsRead);

module.exports = router;
