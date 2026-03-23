const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const {
    getAllBookings, updateBookingStatus,
    getAllInquiries, updateInquiryStatus,
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
router.patch('/inquiries/:id/:action', updateInquiryStatus);

// Users Routing
router.get('/users', getAllUsers);
router.post('/users/:id/:action', updateUserAction);
router.delete('/users/:id', deleteUser);

// Notifications Routing
router.get('/notifications', getAdminNotifications);
router.patch('/notifications/read-all', markAllAsRead);
router.patch('/notifications/:id/read', markAsRead);

module.exports = router;
