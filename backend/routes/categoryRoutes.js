const express = require('express');
const router = express.Router();
const {
  getCategoryDirectory,
  getCategorySummary
} = require('../controllers/categoryController');

router.get('/', getCategoryDirectory);
router.get('/summary', getCategorySummary);

module.exports = router;
