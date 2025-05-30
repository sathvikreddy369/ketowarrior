// // backend/routes/streakRoutes.js
// const express = require("express");
// const router = express.Router();
// const { protect } = require('../middleware/authMiddleware');
// const streakController = require('../controllers/streakController');

// // ✅ Get the longest macro achievement streak - PROTECTED
// router.get("/longest-streak", protect, async (req, res) => {
//     try {
//         const userId = req.user.uid;
//         const longestStreak = await streakController.calculateLongestMacroStreak(userId);
//         res.status(200).json({ longestStreak });
//     } catch (error) {
//         console.error("❌ Error fetching longest streak:", error);
//         res.status(500).json({ error: "Internal server error", message: error.message });
//     }
// });

// // ✅ Get weekly macro achievement data (number of days reached target) - PROTECTED
// router.get("/weekly-streak", protect, async (req, res) => {
//     try {
//         const userId = req.user.uid;
//         const weeklyData = await streakController.getWeeklyMacroStreakData(userId);
//         res.status(200).json(weeklyData);
//     } catch (error) {
//         console.error("❌ Error fetching weekly streak data:", error);
//         res.status(500).json({ error: "Internal server error", message: error.message });
//     }
// });

// // ✅ Get monthly macro achievement data (weekly breakdown of days reached target) - PROTECTED
// router.get("/monthly-streak", protect, async (req, res) => {
//     try {
//         const userId = req.user.uid;
//         const monthlyData = await streakController.getMonthlyMacroStreakData(userId);
//         res.status(200).json(monthlyData);
//     } catch (error) {
//         console.error("❌ Error fetching monthly streak data:", error);
//         res.status(500).json({ error: "Internal server error", message: error.message });
//     }
// });

// // ✅ Get past X months macro achievement data (monthly breakdown of days reached target) - PROTECTED
// router.get("/past-months-streak/:months", protect, async (req, res) => {
//     try {
//         const userId = req.user.uid;
//         const numberOfMonths = parseInt(req.params.months);
//         if (isNaN(numberOfMonths) || numberOfMonths <= 0) {
//             return res.status(400).json({ error: "Invalid number of months." });
//         }
//         const pastMonthsData = await streakController.getPastMonthsMacroStreakData(userId, numberOfMonths);
//         res.status(200).json(pastMonthsData);
//     } catch (error) {
//         console.error("❌ Error fetching past months streak data:", error);
//         res.status(500).json({ error: "Internal server error", message: error.message });
//     }
// });

// // ✅ Get the current consecutive macro achievement streak - PROTECTED
// router.get("/consistency-streak", protect, async (req, res) => {
//     try {
//         const userId = req.user.uid;
//         const consistencyStreak = await streakController.calculateCurrentConsecutiveStreak(userId);
//         res.status(200).json({ streakLength: consistencyStreak });
//     } catch (error) {
//         console.error("❌ Error fetching current consecutive streak:", error);
//         res.status(500).json({ error: "Internal server error", message: error.message });
//     }
// });

// module.exports = router;
// // till here fine








const express = require("express");
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const streakController = require('../controllers/streakController');

// ✅ Get the longest macro achievement streak - PROTECTED
router.get("/longest-streak", protect, streakController.calculateLongestMacroStreak);

// ✅ Get weekly macro achievement data (number of days reached target) - PROTECTED
router.get("/weekly-streak", protect, streakController.getWeeklyMacroStreakData);

// ✅ Get monthly macro achievement data (weekly breakdown of days reached target) - PROTECTED
router.get("/monthly-streak", protect, streakController.getMonthlyMacroStreakData);

// ✅ Get past X months macro achievement data (monthly breakdown of days reached target) - PROTECTED
router.get("/past-months-streak/:months", protect, async (req, res) => {
    try {
        const userId = req.user.uid;
        const numberOfMonths = parseInt(req.params.months);
        if (isNaN(numberOfMonths) || numberOfMonths <= 0) {
            return res.status(400).json({ error: "Invalid number of months." });
        }
        const pastMonthsData = await streakController.getPastMonthsMacroStreakData(userId, numberOfMonths);
        res.status(200).json(pastMonthsData);
    } catch (error) {
        console.error("❌ Error fetching past months streak data:", error);
        res.status(500).json({ error: "Internal server error", message: error.message });
    }
});

// ✅ Get the current consecutive macro achievement streak - PROTECTED
router.get("/consistency-streak", protect, streakController.calculateCurrentConsecutiveStreak);

// ✅ NEW: Get daily macro achievement data for the current week - PROTECTED
router.get("/weekly-daily", protect, streakController.getDailyWeeklyMacroStreakData);

// ✅ NEW: Get daily macro achievement data for a specific month - PROTECTED
router.get("/month/:year/:month/daily", protect, streakController.getDailyDataForMonth);

module.exports = router;