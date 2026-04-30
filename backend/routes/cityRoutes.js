const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const { getCities, addCity, toggleCityStatus, deleteCity, getAllCitiesAdmin } = require('../controllers/cityController');

// Admin-only guard (mirrors adminRoutes.js pattern)
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  res.status(403).json({ message: 'Not authorized as an admin' });
};

// ─── Public ──────────────────────────────────────────────────────────────────
// GET /api/cities?q=mum  →  autocomplete (no auth required)
router.get('/', getCities);

// ─── Admin ────────────────────────────────────────────────────────────────────
// GET /api/cities/all        →  all cities for admin panel
router.get('/all', protect, adminOnly, getAllCitiesAdmin);

// POST /api/cities           →  add a city
router.post('/', protect, adminOnly, addCity);

// PATCH /api/cities/:id/status  →  toggle active/inactive
router.patch('/:id/status', protect, adminOnly, toggleCityStatus);

// DELETE /api/cities/:id     →  remove a city
router.delete('/:id', protect, adminOnly, deleteCity);

module.exports = router;
