const mongoose = require("mongoose");

const DailyDataSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    date: {
        type: String, // "YYYY-MM-DD" format
        required: true,
    },
    meals: [
        {
            mealName: { type: String, required: true },
            mealNumber: { type: Number, required: true },
            foodItems: [
                {
                    foodId: { type: String, required: true },
                    name: { type: String, required: true },
                    calories: { type: Number, required: true },
                    protein: { type: Number, required: true },
                    fat: { type: Number, required: true },
                    carbohydrate: { type: Number, required: true },
                },
            ],
        },
    ],
    dailyTotal: {
        calories: Number,
        protein: Number,
        fat: Number,
        carbs: Number,
    },
    weeklyAverage: {
        calories: Number,
        protein: Number,
        fat: Number,
        carbs: Number,
    },
    monthlyAverage: {
        calories: Number,
        protein: Number,
        fat: Number,
        carbs: Number,
    },
});

module.exports = mongoose.model("DailyData", DailyDataSchema);