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
const { uploadPortfolio } = require('../config/cloudinary');


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
router.post('/portfolio/upload', protect, uploadPortfolio.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  res.status(200).json({
    success: true,
    url: req.file.path,
    public_id: req.file.filename
  });
});


// Protected: inquiry management for influencers
router.get('/inquiries', protect, getMyInquiries);
router.patch('/inquiries/:id/respond', protect, respondToInquiry);

// Other routes
router.get('/:id', getInfluencerById);
router.get('/', getAllInfluencers);
router.put('/:id', updateInfluencer);
router.delete('/:id', deleteInfluencer);

module.exports = router;
