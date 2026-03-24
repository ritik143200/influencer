const express = require('express');
const router = express.Router();

const { createInquiry, getUserInquiries } = require('../controllers/inquiryController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createInquiry);
router.get('/', protect, getUserInquiries);

module.exports = router;
