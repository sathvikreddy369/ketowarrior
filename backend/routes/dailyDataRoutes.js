// backend/routes/dailyDataRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const dailyDataController = require('../controllers/dailyDataController');

// ✅ Add a meal and update daily totals (Firebase Firestore) - PROTECTED
router.post("/daily-totals/add", protect, dailyDataController.addMeal);

// ✅ Remove a meal and update daily totals (Firebase Firestore) - PROTECTED
router.post("/daily-totals/remove", protect, dailyDataController.removeMeal);

// ✅ Get daily totals (Firebase Firestore) - PROTECTED
router.get("/daily-totals", protect, dailyDataController.getDailyTotals);

// ✅ Update daily totals (Firebase Firestore) - PROTECTED
router.put("/daily-totals", protect, dailyDataController.updateDailyTotals);

// ✅ Get weekly averages (Firebase Firestore) - PROTECTED
router.get("/weekly-average", protect, dailyDataController.getWeeklyAverage);

// ✅ Get monthly averages (Firebase Firestore) - PROTECTED
router.get("/monthly-average", protect, dailyDataController.getMonthlyAverage);

// ✅ Get daily details for chart (Firebase Firestore) - PROTECTED
router.get("/daily-totals/daily-chart", protect, dailyDataController.getDailyDetailsChart);

// ✅ Get weekly details for chart (by day) (Firebase Firestore) - PROTECTED
router.get("/daily-totals/weekly-details-chart", protect, dailyDataController.getWeeklyDetailsChart);

// ✅ Get monthly details for chart (by week) (Firebase Firestore) - PROTECTED
router.get("/daily-totals/monthly-chart-by-week", protect, dailyDataController.getMonthlyDetailsChart);

module.exports = router;