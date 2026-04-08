const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { protect } = require('../middleware/authMiddleware');

// Submit a contact form (publicly accessible)
router.post('/', contactController.submitContact);

// Get all contacts (admin only)
router.get('/', protect, contactController.getAllContacts);

// Get contact statistics (admin only)
router.get('/stats', protect, contactController.getContactStats);

// Get contact by ID (admin only)
router.get('/:id', protect, contactController.getContactById);

// Update contact status or admin notes (admin only)
router.put('/:id', protect, contactController.updateContact);

// Delete contact (admin only)
router.delete('/:id', protect, contactController.deleteContact);

module.exports = router;
