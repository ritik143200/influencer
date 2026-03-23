const express = require('express');
const router = express.Router();
const {
  registerArtist,
  getAllArtists,
  getArtistById,
  updateArtist,
  deleteArtist,
  searchArtists,
  getMyProfile,
  updateMyProfile,
  upload
} = require('../controllers/artistController');
const { protect } = require('../middleware/authMiddleware');

// Configure file upload middleware
const uploadMiddleware = upload.fields([
  { name: 'portfolio', maxCount: 10 },
  { name: 'idProof', maxCount: 1 }
]);

// Public routes
router.post('/register', uploadMiddleware, registerArtist);
router.get('/search', searchArtists);

// Protected: logged-in artist's own profile
router.get('/me', protect, getMyProfile);
router.put('/me', protect, updateMyProfile);

// Other routes
router.get('/:id', getArtistById);
router.get('/', getAllArtists);
router.put('/:id', updateArtist);
router.delete('/:id', deleteArtist);

module.exports = router;
