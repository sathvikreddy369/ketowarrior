// backend/controllers/dailyDataController.js //everything ok charts also working
const { db } = require("../firebase/firebaseConfig");
//const { Timestamp } = require('firebase-admin/firestore');
const { updateDailyMacroStreak } = require('./streakController');

const addMeal = async (req, res) => {
    try {
        const { userId, mealName, foodItem } = req.body;
        const today = new Date();
        const formattedToday = today.toISOString().split('T')[0];
        const logTime = new Date().toISOString();

        // Validation
        if (!foodItem || !foodItem.foodId || !foodItem.quantity || !foodItem.unit ||
            isNaN(foodItem.quantity) || !['grams', 'ml', 'count'].includes(foodItem.unit) ||
            isNaN(foodItem.calories) || isNaN(foodItem.protein) || isNaN(foodItem.fat) || isNaN(foodItem.carbs)) {
            return res.status(400).json({ error: "Invalid food item data." });
        }

        const dailyDataRef = db.collection('dailyData').doc(`${userId}-${formattedToday}`);
        const doc = await dailyDataRef.get();

        let dailyData = doc.exists
            ? doc.data()
            : {
                userId,
                date: formattedToday,
                meals: [],
                dailyTotal: { calories: 0, protein: 0, fat: 0, carbs: 0 },
                logTimes: {}, // Initialize logTimes for new documents
            };

        // Ensure logTimes is always an object
        if (!dailyData.logTimes || typeof dailyData.logTimes !== 'object') {
            dailyData.logTimes = {};
        }

        const mealIndex = dailyData.meals.findIndex(meal => meal.mealName === mealName);
        if (mealIndex !== -1) {
            dailyData.meals[mealIndex].foodItems.push({ ...foodItem, loggedAt: logTime });
            if (!dailyData.logTimes[mealName]) {
                dailyData.logTimes[mealName] = [];
            }
            dailyData.logTimes[mealName].push(logTime);
        } else {
            dailyData.meals.push({
                mealName,
                mealNumber: dailyData.meals.length + 1,
                foodItems: [{ ...foodItem, loggedAt: logTime }],
            });
            dailyData.logTimes[mealName] = [logTime];
        }

        // Add the macros sent from the client
        dailyData.dailyTotal.calories += parseFloat(foodItem.calories) || 0;
        dailyData.dailyTotal.protein += parseFloat(foodItem.protein) || 0;
        dailyData.dailyTotal.fat += parseFloat(foodItem.fat) || 0;
        dailyData.dailyTotal.carbs += parseFloat(foodItem.carbs) || 0;

        await dailyDataRef.set(dailyData);
        res.status(200).json({ message: "Meal added successfully!", dailyData });

        // Update daily macro streak after successful meal addition
        await updateDailyMacroStreak(userId, formattedToday);

    } catch (error) {
        console.error("❌ Error adding meal:", error);
        res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
};

const removeMeal = async (req, res) => {
    try {
        const userId = req.user.uid;
        const { mealName, foodItemId } = req.body;

        if (!userId || !mealName || !foodItemId) {
            return res.status(400).json({ error: "userId, mealName, and foodItemId are required." });
        }

        const today = new Date();
        const formattedToday = today.toISOString().split('T')[0];
        const dailyDataRef = db.collection('dailyData').doc(`${userId}-${formattedToday}`);
        const doc = await dailyDataRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: "Daily data not found for today." });
        }

        const dailyData = doc.data();
        const mealIndex = dailyData.meals.findIndex(meal => meal.mealName === mealName);

        if (mealIndex === -1) {
            return res.status(404).json({ message: "Meal not found." });
        }

        const initialFoodItemsLength = dailyData.meals[mealIndex].foodItems.length;
        dailyData.meals[mealIndex].foodItems = dailyData.meals[mealIndex].foodItems.filter(item => item.foodId !== foodItemId);

        if (dailyData.meals[mealIndex].foodItems.length === initialFoodItemsLength) {
            return res.status(404).json({ message: "Food item not found in the meal." });
        }

        // Update logTimes
        if (dailyData.logTimes && dailyData.logTimes[mealName]) {
            const loggedAtToRemove = dailyData.meals[mealIndex].foodItems.find(item => item.foodId === foodItemId)?.loggedAt;
            if (loggedAtToRemove) {
                dailyData.logTimes[mealName] = dailyData.logTimes[mealName].filter(logTime => logTime !== loggedAtToRemove);
                if (dailyData.logTimes[mealName].length === 0) {
                    delete dailyData.logTimes[mealName];
                }
            }
        }

        // Remove empty meals and their logTimes
        dailyData.meals = dailyData.meals.filter(meal => {
            const isEmpty = meal.foodItems.length === 0;
            if (isEmpty && dailyData.logTimes && dailyData.logTimes[meal.mealName]) {
                delete dailyData.logTimes[meal.mealName];
            }
            return !isEmpty;
        });

        dailyData.dailyTotal = { calories: 0, protein: 0, fat: 0, carbs: 0 };
        dailyData.meals.forEach(meal =>
            meal.foodItems.forEach(item => {
                dailyData.dailyTotal.calories += parseFloat(item.calories) || 0;
                dailyData.dailyTotal.protein += parseFloat(item.protein) || 0;
                dailyData.dailyTotal.fat += parseFloat(item.fat) || 0;
                dailyData.dailyTotal.carbs += parseFloat(item.carbohydrate || item.carbs) || 0;
            })
        );

        await dailyDataRef.set(dailyData);
        res.status(200).json({ message: "Food item removed successfully.", dailyData });
        await updateDailyMacroStreak(userId, formattedToday);

    } catch (error) {
        console.error("❌ Error removing food item:", error);
        res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
};

const getDailyTotals = async (req, res) => {
    try {
        const userId = req.user.uid;
        const today = new Date();
        const formattedToday = today.toISOString().split('T')[0];

        const dailyDataRef = db.collection('dailyData').doc(`${userId}-${formattedToday}`);
        const userProfileRef = db.collection('users').doc(userId); // Assuming you have a 'users' collection

        const [dailyDoc, userProfileDoc] = await Promise.all([dailyDataRef.get(), userProfileRef.get()]);

        let dailyData = null;
        if (dailyDoc.exists) {
            dailyData = dailyDoc.data();
        } else {
            dailyData = {
                dailyTotal: { calories: 0, protein: 0, fat: 0, carbs: 0 },
                meals: []
            };
        }

        let targets = null;
        if (userProfileDoc.exists && userProfileDoc.data().targets) {
            targets = userProfileDoc.data().targets;
        } else {
            // Provide default targets if the user profile doesn't have them
            targets = { calories: 2000, protein: 100, fat: 70, carbs: 250 }; // Example defaults
        }

        res.status(200).json({
            dailyTotal: dailyData.dailyTotal || { calories: 0, protein: 0, fat: 0, carbs: 0 },
            meals: dailyData.meals || [],
            logTimes: dailyData.logTimes || {},
            targets: targets // Include the targets in the response
        });
    } catch (error) {
        console.error("❌ Error fetching daily totals:", error);
        res.status(500).json({ error: "Internal server error", message: error.message });
    }
};

const updateDailyTotals = async (req, res) => {
    try {
        const userId = req.user.uid; // Get userId from protected route
        const { meals, dailyTotal, date } = req.body;
        // const timestamp = Timestamp.fromDate(new Date()); // Removed Firebase Timestamp
        const updatedTime = new Date().toISOString(); // Log update time

        if (!date) {
            return res.status(400).json({ error: "Date is required for updating daily totals." });
        }

        // Create a document reference with the provided date
        const dailyDataRef = db.collection('dailyData').doc(`${userId}-${date}`);

        // Update the document
        await dailyDataRef.set({
            userId,
            date,
            meals,
            dailyTotal,
            updatedAt: updatedTime // Log the update time
        }, { merge: true });

        // Optionally update log times if needed based on the update
        // You might need more logic here depending on how updates affect log times

        res.status(200).json({ message: "Daily totals updated successfully", updatedAt: updatedTime });
    } catch (error) {
        console.error("❌ Error updating daily totals:", error);
        res.status(500).json({ error: "Internal server error", message: error.message });
    }
};

const getWeeklyAverage = async (req, res) => {
    try {
        const userId = req.user.uid;

        const today = new Date();
        const day = today.getDay();
        const diffToMonday = day === 0 ? -6 : 1 - day;

        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() + diffToMonday);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        const startOfWeekFormatted = startOfWeek.toISOString().split('T')[0];
        const endOfWeekFormatted = endOfWeek.toISOString().split('T')[0];

        const snapshot = await db.collection('dailyData')
            .where('userId', '==', userId)
            .where('date', '>=', startOfWeekFormatted)
            .where('date', '<=', endOfWeekFormatted)
            .get();

        if (snapshot.empty) {
            return res.status(200).json({
                calories: 0,
                protein: 0,
                fat: 0,
                carbs: 0,
                trackedDays: 0,
                trackedDates: [],
                weekOf: `${startOfWeekFormatted} - ${endOfWeekFormatted}`
            });
        }

        let weeklyTotals = { calories: 0, protein: 0, fat: 0, carbs: 0 };
        let numDays = 0;
        let trackedDates = [];

        snapshot.forEach(doc => {
            const data = doc.data();
            const totals = data.dailyTotal;
            if (totals) {
                weeklyTotals.calories += totals.calories || 0;
                weeklyTotals.protein += totals.protein || 0;
                weeklyTotals.fat += totals.fat || 0;
                weeklyTotals.carbs += totals.carbs || 0;
                numDays++;
                trackedDates.push(data.date);
            }
        });

        const weeklyAverage = {
            calories: numDays > 0 ? weeklyTotals.calories / numDays : 0,
            protein: numDays > 0 ? weeklyTotals.protein / numDays : 0,
            fat: numDays > 0 ? weeklyTotals.fat / numDays : 0,
            carbs: numDays > 0 ? weeklyTotals.carbs / numDays : 0,
            trackedDays: numDays,
            trackedDates,
            weekOf: `${startOfWeekFormatted} - ${endOfWeekFormatted}`
        };

        res.status(200).json(weeklyAverage);

    } catch (error) {
        console.error("❌ Error fetching weekly average:", error);
        res.status(500).json({ error: "Internal server error", message: error.message });
    }
};


const getMonthlyAverage = async (req, res) => {
    try {
        const userId = req.user.uid;
        const today = new Date();

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        const startOfMonthFormatted = startOfMonth.toISOString().split('T')[0];
        const endOfMonthFormatted = endOfMonth.toISOString().split('T')[0];

        const snapshot = await db.collection('dailyData')
            .where('userId', '==', userId)
            .where('date', '>=', startOfMonthFormatted)
            .where('date', '<=', endOfMonthFormatted)
            .get();

        if (snapshot.empty) {
            return res.status(200).json({
                calories: 0,
                protein: 0,
                fat: 0,
                carbs: 0,
                trackedDays: 0,
                trackedDates: [],
                month: today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            });
        }

        let monthlyTotals = { calories: 0, protein: 0, fat: 0, carbs: 0 };
        let numDays = 0;
        let trackedDates = [];

        snapshot.forEach(doc => {
            const data = doc.data();
            const totals = data.dailyTotal;
            if (totals) {
                monthlyTotals.calories += totals.calories || 0;
                monthlyTotals.protein += totals.protein || 0;
                monthlyTotals.fat += totals.fat || 0;
                monthlyTotals.carbs += totals.carbs || 0;
                numDays++;
                trackedDates.push(data.date);
            }
        });

        const monthlyAverage = {
            calories: numDays > 0 ? monthlyTotals.calories / numDays : 0,
            protein: numDays > 0 ? monthlyTotals.protein / numDays : 0,
            fat: numDays > 0 ? monthlyTotals.fat / numDays : 0,
            carbs: numDays > 0 ? monthlyTotals.carbs / numDays : 0,
            trackedDays: numDays,
            trackedDates,
            month: today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        };

        res.status(200).json(monthlyAverage);

    } catch (error) {
        console.error("❌ Error fetching monthly average:", error);
        res.status(500).json({ error: "Internal server error", message: error.message });
    }
};



const getDailyDetailsChart = async (req, res) => {
    try {
        const userId = req.user.uid; // Get userId from protected route
        const today = new Date();
        const formattedToday = today.toISOString().split('T')[0];

        const dailyDataRef = db.collection('dailyData').doc(`${userId}-${formattedToday}`);

        const doc = await dailyDataRef.get();

        if (!doc.exists) {
            return res.status(200).json({
                date: formattedToday,
                calories: 0,
                protein: 0,
                fat: 0,
                carbs: 0,
            });
        }

        const dailyData = doc.data();
        res.status(200).json({
            date: formattedToday,
            calories: dailyData.dailyTotal?.calories || 0,
            protein: dailyData.dailyTotal?.protein || 0,
            fat: dailyData.dailyTotal?.fat || 0,
            carbs: dailyData.dailyTotal?.carbs || 0,
        });
    } catch (error) {
        console.error("❌ Error fetching daily details for chart:", error);
        res.status(500).json({ error: "Internal server error", message: error.message });
    }
};

const getWeeklyDetailsChart = async (req, res) => {
    try {
        const userId = req.user.uid;
        const today = new Date();

        // Monday as the first day
        const day = today.getDay();
        const mondayOffset = day === 0 ? -6 : 1 - day;
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() + mondayOffset);

        const datesOfWeek = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            datesOfWeek.push(day.toISOString().split('T')[0]); // 'YYYY-MM-DD'
        }

        const snapshot = await db.collection('dailyData')
            .where('userId', '==', userId)
            .where('date', 'in', datesOfWeek)
            .get();

        if (snapshot.empty) {
            return res.status(200).json([]);
        }

        const chartData = datesOfWeek.map(dateStr => {
            const doc = snapshot.docs.find(d => d.data().date === dateStr);
            const label = new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });

            if (doc) {
                const data = doc.data();
                return {
                    day: label,
                    calories: data.dailyTotal?.calories || 0,
                    protein: data.dailyTotal?.protein || 0,
                    fat: data.dailyTotal?.fat || 0,
                    carbs: data.dailyTotal?.carbs || 0,
                };
            } else {
                return { day: label, calories: 0, protein: 0, fat: 0, carbs: 0 };
            }
        });

        res.status(200).json(chartData);
    } catch (error) {
        console.error("❌ Error fetching weekly details:", error);
        res.status(500).json({ error: "Internal server error", message: error.message });
    }
};


const getMonthlyDetailsChart = async (req, res) => {
    try {
        const userId = req.user.uid;
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        // Format dates to 'YYYY-MM-DD'
        const formattedStart = startOfMonth.toISOString().split('T')[0];
        const formattedEnd = endOfMonth.toISOString().split('T')[0];

        const snapshot = await db.collection('dailyData')
            .where('userId', '==', userId)
            .where('date', '>=', formattedStart)
            .where('date', '<=', formattedEnd)
            .get();

        if (snapshot.empty) {
            return res.status(200).json([]);
        }

        // Helper to find Monday of the week
        const getMonday = (date) => {
            const d = new Date(date);
            const day = d.getDay();
            const diff = day === 0 ? -6 : 1 - day; // Sunday = -6, Monday = 0
            d.setDate(d.getDate() + diff);
            return new Date(d.getFullYear(), d.getMonth(), d.getDate()); // Strip time
        };

        const weeklyAggregatedData = {};

        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.date && data.dailyTotal) {
                const date = new Date(data.date);
                const monday = getMonday(date);

                const weekKey = monday.toISOString().split('T')[0]; // 'YYYY-MM-DD'
                const weekLabel = `Week of ${monday.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`;

                if (!weeklyAggregatedData[weekKey]) {
                    weeklyAggregatedData[weekKey] = {
                        week: weekLabel,
                        calories: 0,
                        protein: 0,
                        fat: 0,
                        carbs: 0,
                    };
                }

                weeklyAggregatedData[weekKey].calories += data.dailyTotal.calories || 0;
                weeklyAggregatedData[weekKey].protein += data.dailyTotal.protein || 0;
                weeklyAggregatedData[weekKey].fat += data.dailyTotal.fat || 0;
                weeklyAggregatedData[weekKey].carbs += data.dailyTotal.carbs || 0;
            }
        });

        // Return grouped data sorted by week start date
        const result = Object.entries(weeklyAggregatedData)
            .sort(([a], [b]) => new Date(a) - new Date(b))
            .map(([, value]) => value);

        res.status(200).json(result);
    } catch (error) {
        console.error("❌ Error fetching monthly details for chart (by week):", error);
        res.status(500).json({
            error: "Internal server error",
            message: error.message,
        });
    }
};


module.exports = {
    addMeal,
    removeMeal,
    getDailyTotals,
    updateDailyTotals,
    getWeeklyAverage,
    getMonthlyAverage,
    getDailyDetailsChart,
    getWeeklyDetailsChart,
    getMonthlyDetailsChart,
};