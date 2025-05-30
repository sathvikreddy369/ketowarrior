const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const searchRoutes = require("./routes/searchRoutes");
const dailyDataRoutes = require("./routes/dailyDataRoutes");
const userRoutes = require("./routes/userRoutes");
const streakRoutes = require('./routes/streakRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const ImgRoutes = require('./routes/ImgRoutes');

connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", searchRoutes);
app.use("/api", dailyDataRoutes);
app.use('/api/users', userRoutes);
app.use('/api/streaks', streakRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/images', ImgRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: err.message
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));