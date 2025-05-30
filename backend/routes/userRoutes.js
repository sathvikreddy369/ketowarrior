const express = require("express");
const router = express.Router();
const cors = require('cors');
const { protect } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

router.use(cors());

// Profile routes
router.put("/profile", protect, userController.updateUserProfile);
router.get("/me/profile", protect, userController.getUserProfile);
router.get("/profile/:userId", protect, userController.getUserProfile);

// New suggestion routes
router.get("/profile/suggestions/all", protect, userController.getProfileSuggestions);
router.get("/profile/suggestions/allergies", protect, (req, res) => {
    res.status(200).json({ allergens: userController.COMMON_ALLERGENS });
});
router.get("/profile/suggestions/intolerances", protect, (req, res) => {
    res.status(200).json({ intolerances: userController.COMMON_INTOLERANCES });
});
router.get("/profile/suggestions/conditions", protect, (req, res) => {
    res.status(200).json({ medicalConditions: userController.COMMON_MEDICAL_CONDITIONS });
});
router.get("/profile/suggestions/dietary", protect, (req, res) => {
    res.status(200).json({ dietaryPreferences: userController.COMMON_DIETARY_PREFERENCES });
});

module.exports = router;