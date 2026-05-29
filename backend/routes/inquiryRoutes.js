const express = require('express');
const router = express.Router();

const { createInquiry, getUserInquiries, updateInquiry } = require('../controllers/inquiryController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createInquiry);
router.get('/', protect, getUserInquiries);
router.put('/:id', protect, updateInquiry);

module.exports = router;
