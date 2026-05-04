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
  getMyAvailability,
  updateMyAvailability,
  addMyUnavailableDates,
  removeMyUnavailableDates,
  upload,
  getMyInquiries,
  respondToInquiry,
  uploadProfileImage
} = require('../controllers/influencerController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');

const influencerOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'influencer') {
    return res.status(403).json({ success: false, message: 'Only influencers can manage availability' });
  }
  return next();
};


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
router.get('/me/availability', protect, influencerOnly, getMyAvailability);
router.put('/me/availability', protect, influencerOnly, updateMyAvailability);
router.post('/me/availability/add', protect, influencerOnly, addMyUnavailableDates);
router.post('/me/availability/remove', protect, influencerOnly, removeMyUnavailableDates);

// Memory upload for image processing
const uploadMemory = multer({ storage: multer.memoryStorage() });

router.post('/portfolio/upload', protect, uploadMemory.single('image'), uploadProfileImage);


// Protected: inquiry management for influencers
router.get('/inquiries', protect, getMyInquiries);
router.patch('/inquiries/:id/respond', protect, respondToInquiry);

// Other routes
router.get('/:id', getInfluencerById);
router.get('/', getAllInfluencers);
router.put('/:id', updateInfluencer);
router.delete('/:id', deleteInfluencer);

module.exports = router;
