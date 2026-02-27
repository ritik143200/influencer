const express = require('express');
const router = express.Router();
const {
  registerArtist,
  getAllArtists,
  getArtistById,
  updateArtist,
  deleteArtist,
  searchArtists,
  upload
} = require('../controllers/artistController');

// Configure file upload middleware
const uploadMiddleware = upload.fields([
  { name: 'portfolio', maxCount: 10 },
  { name: 'idProof', maxCount: 1 }
]);

// Public routes
router.post('/register', uploadMiddleware, registerArtist);
router.get('/search', searchArtists);
router.get('/:id', getArtistById);

// Protected routes (add authentication middleware later)
router.get('/', getAllArtists);
router.put('/:id', updateArtist);
router.delete('/:id', deleteArtist);

module.exports = router;
