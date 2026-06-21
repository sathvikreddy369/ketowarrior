# 🥗 KetoWarrior

**Your Personal Keto Diet Companion**

Preview Link: https://ketowarrior.vercel.app/

---

## 📋 Table of Contents
- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 About

KetoWarrior is a comprehensive web application designed to help users manage and optimize their ketogenic diet journey. It provides tools for meal planning, macro tracking, recipe recommendations, and AI-powered nutritional insights to keep you on track with your health goals.

---

## ✨ Features

- **Meal Planning**: Create and organize your daily meal plans
- **Macro Tracking**: Monitor your carbohydrates, proteins, and fats
- **Recipe Library**: Browse and search keto-friendly recipes
- **AI-Powered Recommendations**: Get personalized meal suggestions using Google Gemini API
- **User Authentication**: Secure login with Firebase Authentication
- **Progress Analytics**: Visualize your dietary progress with charts
- **Email Notifications**: Stay updated with scheduled email reminders
- **Responsive Design**: Beautiful UI that works on desktop and mobile devices

---

## 🛠️ Tech Stack

### Frontend
- **React 19.0.0** - Modern UI framework with Vite bundler
- **Tailwind CSS** - Utility-first CSS framework
- **Bootstrap 5.3.3** - Responsive component library
- **Chart.js & Recharts** - Data visualization
- **Framer Motion** - Animation library
- **Axios** - HTTP client
- **React Router** - Client-side routing

### Backend
- **Node.js & Express.js** - Server framework
- **MongoDB & Mongoose** - NoSQL database
- **Firebase** - Authentication and hosting
- **Google Generative AI** - AI-powered recommendations
- **JWT** - Secure token authentication
- **Nodemailer & EmailJS** - Email services

### Additional Tools
- **Multer** - File upload handling
- **Node-Cron** - Scheduled tasks
- **Winston** - Logging
- **BCryptjs** - Password encryption
- **Dotenv** - Environment variables

### Languages
- **JavaScript** - 80.4%
- **CSS** - 16.3%
- **Python** - 3.2%
- **HTML** - 0.1%

---

## 📁 Project Structure

```
ketowarrior/
├── my-react-app/          # Frontend React application
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── backend/               # Node.js Express backend
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── package.json
│   └── server.js
└── README.md
```

---

## 🚀 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB account (for database)
- Firebase account (for authentication)
- Google Cloud account (for Generative AI API)

### Frontend Setup

```bash
cd my-react-app
npm install
npm run dev
```

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory with the following:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
FIREBASE_API_KEY=your_firebase_api_key
GOOGLE_API_KEY=your_google_generative_ai_key
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_password
```

Then start the backend server:

```bash
npm start
```

---

## 💻 Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/sathvikreddy369/ketowarrior.git
   cd ketowarrior
   ```

2. Install dependencies for both frontend and backend (see Installation section)

3. Set up environment variables in both directories

4. Start the backend server first, then the frontend development server

5. Open https://ketowarrior.vercel.app/ in your browser or visit `http://localhost:5173` for local development

---

## 📖 Usage

### Creating an Account
1. Visit the application homepage
2. Click on "Sign Up"
3. Enter your email and password
4. Verify your email address

### Tracking Your Macros
1. Log in to your account
2. Navigate to "Meal Tracker"
3. Add foods to your daily log
4. Monitor your macro distribution (carbs, protein, fat)

### Getting Recipe Recommendations
1. Go to "Recipes" section
2. Browse the recipe library or search by ingredients
3. Get AI-powered suggestions based on your preferences
4. Click on recipes to see detailed nutritional information

### Viewing Your Progress
1. Check the "Analytics" dashboard
2. View charts showing your macro trends
3. Monitor your progress over weeks and months

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the ISC License.

---

## 📧 Support

For issues, questions, or feedback, please open an issue on GitHub or contact the maintainer.

---

## 🙏 Acknowledgments

- Google Generative AI for powering recipe recommendations
- Firebase for authentication and hosting
- MongoDB for database support
- All contributors and users of KetoWarrior

---

**Stay strong, stay in ketosis! 💪🥑**
