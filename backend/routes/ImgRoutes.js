const express = require('express');
const router = express.Router();
const multer = require('multer');
const ImgController = require('../controllers/ImgController');

// Configure multer for handling file uploads (adjust as needed)
const storage = multer.memoryStorage(); // Store the image in memory as a buffer
const upload = multer({ storage: storage });

// Route for handling image analysis requests
// 'image' is the name of the field in the form-data
router.post('/analyze-image', upload.single('image'), ImgController.handleImageSearch);

module.exports = router;