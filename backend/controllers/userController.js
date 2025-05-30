const { db, admin } = require("../firebase/firebaseConfig");
const { body, validationResult } = require('express-validator');

// Validation middleware for updating user profile
const validateUpdateProfile = [
    body('username').optional().trim().notEmpty().withMessage('Username cannot be empty'),
    body('dob').optional().isISO8601().toDate().withMessage('Invalid date format for date of birth'),
    body('gender').optional().isIn(['male', 'female', 'other', 'prefer-not-to-say']).withMessage('Invalid gender'),
    body('height').optional().isNumeric().withMessage('Height must be a number'),
    body('weight').optional().isNumeric().withMessage('Weight must be a number'),
    body('macrosToTrack').optional().isArray().withMessage('macrosToTrack must be an array'),
    body('macroTargets').optional().isObject().withMessage('macroTargets must be an object'),
    body('allergies').optional().isArray().withMessage('Allergies must be an array'),
    body('intolerances').optional().isArray().withMessage('Intolerances must be an array'),
    body('medicalConditions').optional().isArray().withMessage('Medical conditions must be an array'),
    body('dietaryPreferences').optional().isArray().withMessage('Dietary preferences must be an array'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];

// Common allergens and intolerances for suggestions
const COMMON_ALLERGENS = [
    'Dairy', 'Eggs', 'Tree nuts', 'Peanuts', 'Shellfish', 
    'Wheat', 'Soy', 'Fish', 'Sesame', 'Mustard'
];

const COMMON_INTOLERANCES = [
    'Lactose', 'Gluten', 'Fructose', 'Histamine', 
    'Caffeine', 'Alcohol', 'Sulfites', 'FODMAPs'
];

const COMMON_MEDICAL_CONDITIONS = [
    'Diabetes', 'High blood pressure', 'Heart disease', 
    'Celiac disease', 'Irritable bowel syndrome (IBS)',
    'Crohn\'s disease', 'Ulcerative colitis', 'GERD',
    'Kidney disease', 'Thyroid disorder'
];

const COMMON_DIETARY_PREFERENCES = [
    'Vegetarian', 'Vegan', 'Pescatarian', 
    'Gluten-free', 'Dairy-free', 'Keto',
    'Paleo', 'Mediterranean', 'Low-carb',
    'Low-sodium', 'Halal', 'Kosher'
];

const getUserProfile = async (req, res) => {
    try {
        let userIdToFetch;

        if (req.params.userId) {
            userIdToFetch = req.params.userId;
        } else if (req.user && req.user.uid) {
            userIdToFetch = req.user.uid;
        } else {
            return res.status(400).json({ message: "User ID not provided or user not authenticated" });
        }

        const userProfileRef = db.collection('userProfiles').doc(userIdToFetch);
        const doc = await userProfileRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: "User profile not found" });
        }

        const profileData = doc.data();
        
        // Add empty arrays if these fields don't exist
        const completeProfileData = {
            ...profileData,
            allergies: profileData.allergies || [],
            intolerances: profileData.intolerances || [],
            medicalConditions: profileData.medicalConditions || [],
            dietaryPreferences: profileData.dietaryPreferences || []
        };

        res.status(200).json({
            ...completeProfileData,
            // Include suggestions for the frontend
            suggestions: {
                allergens: COMMON_ALLERGENS,
                intolerances: COMMON_INTOLERANCES,
                medicalConditions: COMMON_MEDICAL_CONDITIONS,
                dietaryPreferences: COMMON_DIETARY_PREFERENCES
            }
        });

    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ message: "Internal server error while fetching profile", error: error.message });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.uid;
        const { 
            username, 
            dob, 
            gender, 
            height, 
            weight, 
            macrosToTrack, 
            macroTargets,
            allergies,
            intolerances,
            medicalConditions,
            dietaryPreferences
        } = req.body;

        if (!userId) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        const userProfileRef = db.collection('userProfiles').doc(userId);

        const profileDataToUpdate = {
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        // Basic profile info
        if (username !== undefined) profileDataToUpdate.username = username;
        if (dob !== undefined) profileDataToUpdate.dob = dob;
        if (gender !== undefined) profileDataToUpdate.gender = gender;
        if (height !== undefined) profileDataToUpdate.height = parseFloat(height);
        if (weight !== undefined) profileDataToUpdate.weight = parseFloat(weight);
        
        // Nutrition tracking
        if (macrosToTrack !== undefined) profileDataToUpdate.macrosToTrack = macrosToTrack;
        if (macroTargets !== undefined) profileDataToUpdate.macroTargets = macroTargets;
        
        // New health-related fields
        if (allergies !== undefined) profileDataToUpdate.allergies = allergies;
        if (intolerances !== undefined) profileDataToUpdate.intolerances = intolerances;
        if (medicalConditions !== undefined) profileDataToUpdate.medicalConditions = medicalConditions;
        if (dietaryPreferences !== undefined) profileDataToUpdate.dietaryPreferences = dietaryPreferences;

        await userProfileRef.set(profileDataToUpdate, { merge: true });

        return res.status(200).json({ 
            message: "Profile updated successfully",
            updatedFields: Object.keys(profileDataToUpdate).filter(key => key !== 'updatedAt')
        });

    } catch (error) {
        console.error("Error updating user profile:", error);
        return res.status(500).json({ message: "Internal server error while updating profile", error: error.message });
    }
};

// Get suggestions for allergies/intolerances/conditions
const getProfileSuggestions = async (req, res) => {
    try {
        res.status(200).json({
            allergens: COMMON_ALLERGENS,
            intolerances: COMMON_INTOLERANCES,
            medicalConditions: COMMON_MEDICAL_CONDITIONS,
            dietaryPreferences: COMMON_DIETARY_PREFERENCES
        });
    } catch (error) {
        console.error("Error getting suggestions:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

module.exports = {
    getUserProfile,
    updateUserProfile: [validateUpdateProfile, updateUserProfile],
    getProfileSuggestions
};