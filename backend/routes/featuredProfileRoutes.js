const express = require('express');
const router = express.Router();
const { uploadPortfolio } = require('../config/cloudinary');
const { protect } = require('../middleware/authMiddleware');
const {
  getFeaturedProfiles,
  getAllFeaturedProfiles,
  createFeaturedProfile,
  updateFeaturedProfile,
  reorderFeaturedProfiles,
  deleteFeaturedProfile
} = require('../controllers/featuredProfileController');

// Ensure only admins can access these routes
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

// Public route
router.get('/', getFeaturedProfiles);

// Admin routes
router.use(protect);
router.use(adminOnly);

const uploadFields = uploadPortfolio.fields([
  { name: 'image', maxCount: 1 },
  { name: 'portfolio', maxCount: 10 }
]);

router.get('/admin', getAllFeaturedProfiles);
router.post('/', uploadFields, createFeaturedProfile);
router.put('/reorder', reorderFeaturedProfiles);
router.put('/:id', uploadFields, updateFeaturedProfile);
router.delete('/:id', deleteFeaturedProfile);

module.exports = router;
