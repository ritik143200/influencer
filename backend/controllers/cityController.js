const City = require('../models/City');

// @desc    Get cities with optional autocomplete search
// @route   GET /api/cities?q=mum
// @access  Public
const getCities = async (req, res) => {
  try {
    const { q = '' } = req.query;
    const query = {};

    if (q.trim().length > 0) {
      const searchStr = q.trim();
      // Search in name or normalizedName, case-insensitive
      query.$or = [
        { name: { $regex: `^${searchStr}`, $options: 'i' } },
        { normalizedName: { $regex: `^${searchStr.toLowerCase()}`, $options: 'i' } }
      ];
    }

    const cities = await City.find(query)
      .select('name state -_id')
      .sort({ name: 1 })
      .limit(20)
      .lean();

    res.status(200).json({ success: true, data: cities });
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching cities' });
  }
};

// @desc    Add a new city (Admin only)
// @route   POST /api/cities
// @access  Private/Admin
const addCity = async (req, res) => {
  try {
    const { name, state } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'City name is required' });
    }

    const city = await City.create({ name: name.trim(), state: (state || '').trim() });
    res.status(201).json({ success: true, data: city });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'City already exists' });
    }
    console.error('Error adding city:', error);
    res.status(500).json({ success: false, message: 'Server error while adding city' });
  }
};

// @desc    Toggle city active status (Admin only)
// @route   PATCH /api/cities/:id/status
// @access  Private/Admin
const toggleCityStatus = async (req, res) => {
  try {
    const city = await City.findById(req.params.id);
    if (!city) return res.status(404).json({ success: false, message: 'City not found' });

    city.isActive = !city.isActive;
    await city.save();
    res.status(200).json({ success: true, data: city });
  } catch (error) {
    console.error('Error toggling city status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete a city permanently (Admin only)
// @route   DELETE /api/cities/:id
// @access  Private/Admin
const deleteCity = async (req, res) => {
  try {
    const city = await City.findByIdAndDelete(req.params.id);
    if (!city) return res.status(404).json({ success: false, message: 'City not found' });

    res.status(200).json({ success: true, message: 'City deleted successfully' });
  } catch (error) {
    console.error('Error deleting city:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all cities for admin management
// @route   GET /api/cities/all
// @access  Private/Admin
const getAllCitiesAdmin = async (req, res) => {
  try {
    const cities = await City.find().sort({ name: 1 }).lean();
    res.status(200).json({ success: true, count: cities.length, data: cities });
  } catch (error) {
    console.error('Error fetching all cities:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getCities, addCity, toggleCityStatus, deleteCity, getAllCitiesAdmin };
