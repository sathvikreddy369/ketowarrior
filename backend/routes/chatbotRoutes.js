const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

router.post('/chat', chatbotController.handleChatMessage);
router.get('/nutrition/:foodName', chatbotController.getFoodNutrition);

module.exports = router;