// routes/searchRoutes.js
const express = require('express');
const router = express.Router();
const { searchFood, getSuggestions } = require('../controllers/searchController');

router.get('/search', searchFood);
router.get('/suggestions', getSuggestions);

module.exports = router;