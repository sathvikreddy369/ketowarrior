// // backend/controllers/streakController.js
// const { db } = require("../firebase/firebaseConfig");
// const { Timestamp } = require('firebase-admin/firestore');

// // Helper function to get user profile and targets
// const getUserProfile = async (userId) => {
//     const userProfileRef = db.collection('userProfiles').doc(userId); // Assuming your user profile collection is named 'userProfiles'
//     const doc = await userProfileRef.get();
//     if (doc.exists) {
//         return doc.data().macroTargets || {}; // Assuming macroTargets is an object in the user profile
//     }
//     return {};
// };

// const updateDailyMacroStreak = async (userId, date) => {
//     try {
//         const dailyDataRef = db.collection('dailyData').doc(`${userId}-${date}`);
//         const dailyDataDoc = await dailyDataRef.get();
//         const dailyData = dailyDataDoc.data();

//         const userMacroTargets = await getUserProfile(userId);
//         const { protein: proteinTarget = 0, carbs: carbsTarget = 0, fat: fatTarget = 0 } = userMacroTargets;

//         if (!dailyData || !dailyData.dailyTotal) {
//             // No daily data for this date, so targets not reached
//             await db.collection('daily_macro_streaks').doc(`${userId}-${date}`).set({
//                 user_id: userId,
//                 date: date,
//                 reached_targets: false,
//                 protein_achieved: 0,
//                 carbs_achieved: 0,
//                 fat_achieved: 0,
//                 protein_target: proteinTarget,
//                 carbs_target: carbsTarget,
//                 fat_target: fatTarget,
//                 timestamp: Timestamp.fromDate(new Date()),
//             }, { merge: true });
//             return;
//         }

//         const { protein: proteinAchieved = 0, carbs: carbsAchieved = 0, fat: fatAchieved = 0 } = dailyData.dailyTotal;

//         // Define your logic for reaching targets (e.g., achieved >= target)
//         const reachedProtein = parseFloat(proteinAchieved) >= parseFloat(proteinTarget);
//         const reachedCarbs = parseFloat(carbsAchieved) >= parseFloat(carbsTarget);
//         const reachedFat = parseFloat(fatAchieved) >= parseFloat(fatTarget);

//         const reachedTargets = reachedProtein && reachedCarbs && reachedFat;

//         await db.collection('daily_macro_streaks').doc(`${userId}-${date}`).set({
//             user_id: userId,
//             date: date,
//             reached_targets: reachedTargets,
//             protein_achieved: parseFloat(proteinAchieved),
//             carbs_achieved: parseFloat(carbsAchieved),
//             fat_achieved: parseFloat(fatAchieved),
//             protein_target: parseFloat(proteinTarget),
//             carbs_target: parseFloat(carbsTarget),
//             fat_target: parseFloat(fatTarget),
//             timestamp: Timestamp.fromDate(new Date()),
//         }, { merge: true });

//         console.log(`Streak data updated for user ${userId} on ${date}: Reached targets - ${reachedTargets}`);

//     } catch (error) {
//         console.error("❌ Error updating daily macro streak:", error);
//     }
// };

// const calculateLongestMacroStreak = async (userId) => {
//     try {
//         const streaksSnapshot = await db.collection('daily_macro_streaks')
//             .where('user_id', '==', userId)
//             .orderBy('date')
//             .get();

//         if (streaksSnapshot.empty) {
//             return 0;
//         }

//         let longestStreak = 0;
//         let currentStreak = 0;
//         let previousDate = null;

//         streaksSnapshot.forEach(doc => {
//             const streakData = doc.data();
//             const currentDate = streakData.date;
//             const reachedTargets = streakData.reached_targets;

//             if (reachedTargets) {
//                 if (!previousDate) {
//                     currentStreak = 1;
//                 } else {
//                     const prevDateObj = new Date(previousDate);
//                     const currentDateObj = new Date(currentDate);
//                     const timeDifference = currentDateObj.getTime() - prevDateObj.getTime();
//                     const dayDifference = timeDifference / (1000 * 3600 * 24);

//                     if (dayDifference === 1) {
//                         currentStreak++;
//                     } else {
//                         currentStreak = 1;
//                     }
//                 }
//                 longestStreak = Math.max(longestStreak, currentStreak);
//             } else {
//                 currentStreak = 0;
//             }
//             previousDate = currentDate;
//         });

//         return longestStreak;

//     } catch (error) {
//         console.error("❌ Error calculating longest macro streak:", error);
//         return 0;
//     }
// };

// const getWeeklyMacroStreakData = async (userId) => {
//     try {
//         const today = new Date();
//         const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
//         const endOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + (6 - today.getDay()));
//         const formattedStart = startOfWeek.toISOString().split('T')[0];
//         const formattedEnd = endOfWeek.toISOString().split('T')[0];

//         const snapshot = await db.collection('daily_macro_streaks')
//             .where('user_id', '==', userId)
//             .where('date', '>=', formattedStart)
//             .where('date', '<=', formattedEnd)
//             .orderBy('date')
//             .get();

//         let reachedTargetDays = 0;
//         snapshot.forEach(doc => {
//             if (doc.data().reached_targets) {
//                 reachedTargetDays++;
//             }
//         });

//         return { reachedTargetDays };

//     } catch (error) {
//         console.error("❌ Error fetching weekly macro streak data:", error);
//         return { reachedTargetDays: 0 };
//     }
// };

// const getMonthlyMacroStreakData = async (userId) => {
//     try {
//         const today = new Date();
//         const year = today.getFullYear();
//         const month = today.getMonth();
//         const firstDayOfMonth = new Date(year, month, 1).toISOString().split('T')[0];
//         const lastDayOfMonth = new Date(year, month + 1, 0).toISOString().split('T')[0];

//         const snapshot = await db.collection('daily_macro_streaks')
//             .where('user_id', '==', userId)
//             .where('date', '>=', firstDayOfMonth)
//             .where('date', '<=', lastDayOfMonth)
//             .orderBy('date')
//             .get();

//         const weeklyData = {};
//         const daysInMonth = [];

//         snapshot.forEach(doc => {
//             const data = doc.data();
//             if (data.reached_targets) {
//                 daysInMonth.push(data.date);
//             }
//         });

//         // Group by week
//         for (let i = 0; i < daysInMonth.length; i++) {
//             const date = new Date(daysInMonth[i]);
//             const weekNumber = getWeekNumber(date);
//             const yearWeek = `${date.getFullYear()}-W${weekNumber}`;
//             weeklyData[yearWeek] = (weeklyData[yearWeek] || 0) + 1;
//         }

//         return weeklyData;

//     } catch (error) {
//         console.error("❌ Error fetching monthly macro streak data:", error);
//         return {};
//     }
// };

// // Helper function to get week number
// function getWeekNumber(d) {
//     d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
//     const dayNum = d.getUTCDay() || 7;
//     d.setDate(d.getUTCDate() + 4 - dayNum);
//     const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
//     return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
// }

// const getPastMonthsMacroStreakData = async (userId, numberOfMonths) => {
//     try {
//         const today = new Date();
//         const endDate = new Date(today);
//         const startDate = new Date(today);
//         startDate.setMonth(today.getMonth() - numberOfMonths);

//         const formattedStart = startDate.toISOString().split('T')[0];
//         const formattedEnd = endDate.toISOString().split('T')[0];

//         const snapshot = await db.collection('daily_macro_streaks')
//             .where('user_id', '==', userId)
//             .where('date', '>=', formattedStart)
//             .where('date', '<=', formattedEnd)
//             .orderBy('date')
//             .get();

//         const monthlyData = {};

//         snapshot.forEach(doc => {
//             const data = doc.data();
//             if (data.reached_targets) {
//                 const yearMonth = data.date.substring(0, 7); // YYYY-MM
//                 monthlyData[yearMonth] = (monthlyData[yearMonth] || 0) + 1;
//             }
//         });

//         return monthlyData;

//     } catch (error) {
//         console.error("❌ Error fetching past months macro streak data:", error);
//         return {};
//     }
// };

// const calculateCurrentConsecutiveStreak = async (userId) => {
//     try {
//         const streaksSnapshot = await db.collection('daily_macro_streaks')
//             .where('user_id', '==', userId)
//             .orderBy('date', 'desc')
//             .get();

//         if (streaksSnapshot.empty) {
//             return 0;
//         }

//         let currentStreak = 0;
//         const today = new Date().toISOString().split('T')[0]; // Get today's date in 'YYYY-MM-DD' format

//         for (const doc of streaksSnapshot.docs) {
//             const streakData = doc.data();
//             const currentDate = streakData.date;

//             // Stop if the date is in the future (shouldn't happen if data is correct)
//             if (currentDate > today) {
//                 continue;
//             }

//             if (streakData.reached_targets) {
//                 const streakDateObj = new Date(currentDate);
//                 const todayObj = new Date(today);
//                 const diffTime = Math.abs(todayObj - streakDateObj);
//                 const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

//                 // Check if the date is within the current consecutive sequence
//                 const expectedDate = new Date(today);
//                 expectedDate.setDate(todayObj.getDate() - currentStreak);

//                 if (streakDateObj.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
//                     currentStreak++;
//                 } else if (currentStreak === 0 && streakDateObj.toISOString().split('T')[0] === today) {
//                     currentStreak = 1;
//                 } else {
//                     break; // Streak broken
//                 }
//             } else if (currentStreak > 0) {
//                 break; // Streak broken
//             }
//         }

//         return currentStreak;

//     } catch (error) {
//         console.error("❌ Error calculating current consecutive streak:", error);
//         return 0;
//     }
// };

// module.exports = {
//     updateDailyMacroStreak,
//     calculateLongestMacroStreak,
//     getWeeklyMacroStreakData,
//     getMonthlyMacroStreakData,
//     getPastMonthsMacroStreakData,
//     calculateCurrentConsecutiveStreak, // Export the new function
    
// };
// //fine till here






//working thing... calorie data update cheyananthavarku
const { db } = require("../firebase/firebaseConfig");
const { Timestamp } = require('firebase-admin/firestore');

// Helper function to get user profile and targets
const getUserProfile = async (userId) => {
    const userProfileRef = db.collection('userProfiles').doc(userId); // Assuming your user profile collection is named 'userProfiles'
    const doc = await userProfileRef.get();
    if (doc.exists) {
        return doc.data().macroTargets || {}; // Assuming macroTargets is an object in the user profile
    }
    return {};
};

const updateDailyMacroStreak = async (userId, date) => {
    try {
        // const dailyDataRef = db.collection('dailyData').doc(`<span class="math-inline">\{userId\}\-</span>{date}`);
        const dailyDataRef = db.collection('dailyData').doc(`${userId}-${date}`);
        const dailyDataDoc = await dailyDataRef.get();
        const dailyData = dailyDataDoc.data();

        const userMacroTargets = await getUserProfile(userId);
        const { protein: proteinTarget = 0, carbs: carbsTarget = 0, fat: fatTarget = 0,calories: caloriesTarget = 0 } = userMacroTargets;

        if (!dailyData || !dailyData.dailyTotal) {
            // No daily data for this date, so targets not reached
            await db.collection('daily_macro_streaks').doc(`<span class="math-inline">\{userId\}\-</span>{date}`).set({
                user_id: userId,
                date: date,
                reached_targets: false,
                protein_achieved: 0,
                carbs_achieved: 0,
                fat_achieved: 0,
                calories_achieved: 0,
                protein_target: proteinTarget,
                carbs_target: carbsTarget,
                fat_target: fatTarget,
                caloriesTarget: caloriesTarget,
                timestamp: Timestamp.fromDate(new Date()),
            }, { merge: true });
            return;
        }

        const { protein: proteinAchieved = 0, carbs: carbsAchieved = 0, fat: fatAchieved = 0, caloriesAchieved = 0 } = dailyData.dailyTotal;

        // Define your logic for reaching targets (e.g., achieved >= target)
        const reachedProtein = parseFloat(proteinAchieved) >= parseFloat(proteinTarget);
        const reachedCarbs = parseFloat(carbsAchieved) >= parseFloat(carbsTarget);
        const reachedFat = parseFloat(fatAchieved) >= parseFloat(fatTarget);
        const reachedCalories = parseFloat(caloriesAchieved) >= parseFloat(caloriesTarget);
        const reachedTargets = reachedProtein && reachedCarbs && reachedFat;

        // await db.collection('daily_macro_streaks').doc(`<span class="math-inline">\{userId\}\-</span>{date}`).set({
            await db.collection('daily_macro_streaks').doc(`${userId}-${date}`).set({
            user_id: userId,
            date: date,
            reached_targets: reachedTargets,
            protein_achieved: parseFloat(proteinAchieved),
            carbs_achieved: parseFloat(carbsAchieved),
            fat_achieved: parseFloat(fatAchieved),
            calories_achieved: parseFloat(caloriesAchieved),
            protein_target: parseFloat(proteinTarget),
            carbs_target: parseFloat(carbsTarget),
            fat_target: parseFloat(fatTarget),
            calories_target: parseFloat(caloriesTarget),
            timestamp: Timestamp.fromDate(new Date()),
        }, { merge: true });

        console.log(`Streak data updated for user ${userId} on ${date}: Reached targets - ${reachedTargets}`);

    } catch (error) {
        console.error("❌ Error updating daily macro streak:", error);
    }
};

const calculateLongestMacroStreak = async (req, res) => {
    try {
        const userId = req.user.uid;
        const streaksSnapshot = await db.collection('daily_macro_streaks')
            .where('user_id', '==', userId)
            .orderBy('date')
            .get();

        if (streaksSnapshot.empty) {
            return res.status(200).json({ longestStreak: 0 });
        }

        let longestStreak = 0;
        let currentStreak = 0;
        let previousDate = null;

        streaksSnapshot.forEach(doc => {
            const streakData = doc.data();
            const currentDate = streakData.date;
            const reachedTargets = streakData.reached_targets;

            if (reachedTargets) {
                if (!previousDate) {
                    currentStreak = 1;
                } else {
                    const prevDateObj = new Date(previousDate);
                    const currentDateObj = new Date(currentDate);
                    const timeDifference = currentDateObj.getTime() - prevDateObj.getTime();
                    const dayDifference = timeDifference / (1000 * 3600 * 24);

                    if (dayDifference === 1) {
                        currentStreak++;
                    } else {
                        currentStreak = 1;
                    }
                }
                longestStreak = Math.max(longestStreak, currentStreak);
            } else {
                currentStreak = 0;
            }
            previousDate = currentDate;
        });

        res.status(200).json({ longestStreak });

    } catch (error) {
        console.error("❌ Error calculating longest macro streak:", error);
        res.status(500).json({ error: "Internal server error", message: error.message });
    }
};

const getWeeklyMacroStreakData = async (req, res) => {
    try {
        const userId = req.user.uid;
        const today = new Date();
        const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
        const endOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + (6 - today.getDay()));
        const formattedStart = startOfWeek.toISOString().split('T')[0];
        const formattedEnd = endOfWeek.toISOString().split('T')[0];

        const snapshot = await db.collection('daily_macro_streaks')
            .where('user_id', '==', userId)
            .where('date', '>=', formattedStart)
            .where('date', '<=', formattedEnd)
            .orderBy('date')
            .get();

        let reachedTargetDays = 0;
        snapshot.forEach(doc => {
            if (doc.data().reached_targets) {
                reachedTargetDays++;
            }
        });

        res.status(200).json({ reachedTargetDays });

    } catch (error) {
        console.error("❌ Error fetching weekly macro streak data:", error);
        res.status(500).json({ error: "Internal server error", message: error.message });
    }
};

const getMonthlyMacroStreakData = async (req, res) => {
    try {
        const userId = req.user.uid;
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).toISOString().split('T')[0];
        const lastDayOfMonth = new Date(year, month + 1, 0).toISOString().split('T')[0];

        const snapshot = await db.collection('daily_macro_streaks')
            .where('user_id', '==', userId)
            .where('date', '>=', firstDayOfMonth)
            .where('date', '<=', lastDayOfMonth)
            .orderBy('date')
            .get();

        const weeklyData = {};
        const daysInMonth = [];

        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.reached_targets) {
                daysInMonth.push(data.date);
            }
        });

        // Group by week
        for (let i = 0; i < daysInMonth.length; i++) {
            const date = new Date(daysInMonth[i]);
            const weekNumber = getWeekNumber(date);
            const yearWeek = `<span class="math-inline">\{date\.getFullYear\(\)\}\-W</span>{weekNumber}`;
            weeklyData[yearWeek] = (weeklyData[yearWeek] || 0) + 1;
        }

        res.status(200).json(weeklyData);

    } catch (error) {
        console.error("❌ Error fetching monthly macro streak data:", error);
        res.status(500).json({ error: "Internal server error", message: error.message });
    }
};

// Helper function to get week number
function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

const getPastMonthsMacroStreakData = async (req, res) => {
    try {
        const userId = req.user.uid;
        const numberOfMonths = parseInt(req.params.months);
        const today = new Date();
        const endDate = new Date(today);
        const startDate = new Date(today);
        startDate.setMonth(today.getMonth() - numberOfMonths);

        const formattedStart = startDate.toISOString().split('T')[0];
        const formattedEnd = endDate.toISOString().split('T')[0];

        const snapshot = await db.collection('daily_macro_streaks')
            .where('user_id', '==', userId)
            .where('date', '>=', formattedStart)
            .where('date', '<=', formattedEnd)
            .orderBy('date')
            .get();

        const monthlyData = {};

        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.reached_targets) {
                const yearMonth = data.date.substring(0, 7); // YYYY-MM
                monthlyData[yearMonth] = (monthlyData[yearMonth] || 0) + 1;
            }
        });

        res.status(200).json(monthlyData);

    } catch (error) {
        console.error("❌ Error fetching past months macro streak data:", error);
        res.status(500).json({ error: "Internal server error", message: error.message });
    }
};

const calculateCurrentConsecutiveStreak = async (req, res) => {
    try {
        const userId = req.user.uid;
        const streaksSnapshot = await db.collection('daily_macro_streaks')
            .where('user_id', '==', userId)
            .orderBy('date', 'desc')
            .get();

        if (streaksSnapshot.empty) {
            return res.status(200).json({ streakLength: 0 });
        }

        let currentStreak = 0;
        const today = new Date().toISOString().split('T')[0]; // Get today's date in 'YYYY-MM-DD' format

        for (const doc of streaksSnapshot.docs) {
            const streakData = doc.data();
            const currentDate = streakData.date;

            // Stop if the date is in the future (shouldn't happen if data is correct)
            if (currentDate > today) {
                continue;
            }

            if (streakData.reached_targets) {
                const streakDateObj = new Date(currentDate);
                const todayObj = new Date(today);
                const diffTime = Math.abs(todayObj - streakDateObj);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                // Check if the date is within the current consecutive sequence
                const expectedDate = new Date(today);
                expectedDate.setDate(todayObj.getDate() - currentStreak);

                if (streakDateObj.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
                    currentStreak++;
                } else if (currentStreak === 0 && streakDateObj.toISOString().split('T')[0] === today) {
                    currentStreak = 1;
                } else {
                    break; // Streak broken
                }
            } else if (currentStreak > 0) {
                break; // Streak broken
            }
        }

        res.status(200).json({ streakLength: currentStreak });

    } catch (error) {
        console.error("❌ Error calculating current consecutive streak:", error);
        res.status(500).json({ error: "Internal server error", message: error.message });
    }
};

const getDailyWeeklyMacroStreakData = async (req, res) => {
    try {
        const userId = req.user.uid;
        const today = new Date();
        const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
        const endOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + (6 - today.getDay()));
        const formattedStart = startOfWeek.toISOString().split('T')[0];
        const formattedEnd = endOfWeek.toISOString().split('T')[0];

        const snapshot = await db.collection('daily_macro_streaks')
            .where('user_id', '==', userId)
            .where('date', '>=', formattedStart)
            .where('date', '<=', formattedEnd)
            .orderBy('date')
            .get();

        const dailyStreaks = [];
        const currentDate = new Date(formattedStart);

        while (currentDate <= endOfWeek) {
            const formattedCurrentDate = currentDate.toISOString().split('T')[0];
            const doc = snapshot.docs.find(doc => doc.data().date === formattedCurrentDate);
            const metTarget = doc ? doc.data().reached_targets : null; // null for days with no data yet

            dailyStreaks.push({
                date: formattedCurrentDate,
                metTarget: metTarget,
            });

            currentDate.setDate(currentDate.getDate() + 1);
        }

        res.status(200).json({ dailyStreaks });

    } catch (error) {
        console.error("❌ Error fetching daily weekly macro streak data:", error);
        res.status(500).json({ error: "Internal server error", message: error.message });
    }
};

const getDailyDataForMonth = async (req, res) => {
    const { year, month } = req.params;
    const userId = req.user.uid;

    try {
        const firstDayOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1); // Month is 0-indexed in JavaScript
        const lastDayOfMonth = new Date(parseInt(year), parseInt(month), 0);
        const formattedStart = firstDayOfMonth.toISOString().split('T')[0];
        const formattedEnd = lastDayOfMonth.toISOString().split('T')[0];

        const snapshot = await db.collection('daily_macro_streaks')
            .where('user_id', '==', userId)
            .where('date', '>=', formattedStart)
            .where('date', '<=', formattedEnd)
            .orderBy('date')
            .get();

        const dailyStreaks = [];
        const currentDate = new Date(formattedStart);

        while (currentDate <= lastDayOfMonth){
            const formattedCurrentDate = currentDate.toISOString().split('T')[0];
            const doc = snapshot.docs.find(doc => doc.data().date === formattedCurrentDate);
            const metTarget = doc ? doc.data().reached_targets : null;

            dailyStreaks.push({
                date: formattedCurrentDate,
                metTarget: metTarget,
            });

            currentDate.setDate(currentDate.getDate() + 1);
        }

        res.status(200).json({ dailyStreaks });

    } catch (error) {
        console.error("❌ Error fetching daily data for month:", error);
        res.status(500).json({ error: "Internal server error", message: error.message });
    }
};

module.exports = {
    updateDailyMacroStreak,
    calculateLongestMacroStreak,
    getWeeklyMacroStreakData,
    getMonthlyMacroStreakData,
    getPastMonthsMacroStreakData,
    calculateCurrentConsecutiveStreak,
    getDailyWeeklyMacroStreakData,
    getDailyDataForMonth,
};