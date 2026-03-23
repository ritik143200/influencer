const express = require('express');
const router = express.Router();

const { createInquiry } = require('../controllers/inquiryController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createInquiry);

module.exports = router;
