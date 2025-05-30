const admin = require("../firebase/firebaseConfig").admin; 

const protect = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];

        try {
            const decodedToken = await admin.auth().verifyIdToken(token);
            req.user = decodedToken;
            return next();
        } catch (error) {
            console.error("Token verification failed:", error.message);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    return res.status(401).json({ message: 'Not authorized, no token' });
};

module.exports = { protect };
