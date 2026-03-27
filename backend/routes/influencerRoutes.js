const express = require('express');
const router = express.Router();
const {
  registerInfluencer,
  getAllInfluencers,
  getInfluencerById,
  updateInfluencer,
  deleteInfluencer,
  searchInfluencers,
  getMyProfile,
  updateMyProfile,
  upload,
  getMyInquiries,
  respondToInquiry
} = require('../controllers/influencerController');
const { protect } = require('../middleware/authMiddleware');

// Configure file upload middleware
const uploadMiddleware = upload.fields([
  { name: 'portfolio', maxCount: 10 },
  { name: 'idProof', maxCount: 1 }
]);

// Public routes
router.post('/register', uploadMiddleware, registerInfluencer);
router.get('/search', searchInfluencers);

// Protected: logged-in influencer's own profile
router.get('/me', protect, getMyProfile);
router.put('/me', protect, updateMyProfile);

// Protected: inquiry management for influencers
router.get('/inquiries', protect, getMyInquiries);
router.patch('/inquiries/:id/respond', protect, respondToInquiry);

// Other routes
router.get('/:id', getInfluencerById);
router.get('/', getAllInfluencers);
router.put('/:id', updateInfluencer);
router.delete('/:id', deleteInfluencer);

module.exports = router;
