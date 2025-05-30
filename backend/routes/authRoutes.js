// //before forgot-password, settings
// const express = require("express");
// const router = express.Router();
// const cors = require('cors');
// const { protect } = require('../middleware/authMiddleware');
// const authController = require('../controllers/authController');
// const corsOptions = {
//     origin: ['https://your-frontend-domain.com', 'https://another-trusted-domain.com'],
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//     credentials: true, // If you need to handle cookies across origins
//     optionsSuccessStatus: 204,
//   };
// router.use(cors(corsOptions));
// // Global CORS Handling (Optional: restrict origin in prod)
// router.use(cors());

// // @route   POST /api/auth/signup
// // @desc    Register a new user
// // @access  Public
// router.post("/signup", authController.signupUser);

// // @route   POST /api/auth/login
// // @desc    Login existing user
// // @access  Public
// router.post("/login", authController.loginUser);

// // @route   GET /api/auth/profile/:userId
// // @desc    Get user profile from Firestore
// // @access  Protected
// router.get("/profile/:userId", protect, authController.getUserProfile);

// module.exports = router;




// // backend/routes/auth.js
// const express = require("express");
// const router = express.Router();
// const cors = require('cors');
// const { protect } = require('../middleware/authMiddleware');
// const authController = require('../controllers/authController');

// // CORS configuration (adjust origins as needed for production)
// const corsOptions = {
//     origin: ['http://localhost:5173', 'https://your-production-frontend.com'], // Example origins
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//     credentials: true, // If you need to handle cookies across origins
//     optionsSuccessStatus: 204,
// };
// router.use(cors(corsOptions));

// // @route    POST /api/auth/signup
// // @desc     Register a new user
// // @access   Public
// router.post("/signup", authController.signupUser);

// // @route    POST /api/auth/login
// // @desc     Login existing user
// // @access   Public
// router.post("/login", authController.loginUser);

// // @route    GET /api/auth/profile/:userId
// // @desc     Get user profile from Firestore
// // @access   Protected
// router.get("/profile/:userId", protect, authController.getUserProfile);

// // @route    PUT /api/auth/profile
// // @desc     Update user profile (currently for username)
// // @access   Protected
// router.put("/profile", protect, authController.updateUserProfile);

// module.exports = router;



// backend/routes/auth.js
const express = require("express");
const router = express.Router();
const cors = require('cors');
const { protect } = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');

// CORS configuration (adjust origins as needed for production)
const corsOptions = {
    origin: ['http://localhost:5173', 'https://your-production-frontend.com'], // Example origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // If you need to handle cookies across origins
    optionsSuccessStatus: 204,
};
router.use(cors(corsOptions));

// @route     POST /api/auth/signup
// @desc      Register a new user
// @access    Public
router.post("/signup", authController.signupUser);

// @route     POST /api/auth/login
// @desc      Login existing user
// @access    Public
router.post("/login", authController.loginUser);

// @route     GET /api/auth/profile/:userId
// @desc      Get user profile from Firestore
// @access    Protected
router.get("/profile/:userId", protect, authController.getUserProfile);

// @route     PUT /api/auth/profile
// @desc      Update user profile (currently for username)
// @access    Protected
router.put("/profile", protect, authController.updateUserProfile);

// @route     PUT /api/auth/password
// @desc      Update user password
// @access    Protected
router.put("/password", protect, authController.updateUserPassword);

module.exports = router;