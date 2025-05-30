
// backend/controllers/authController.js
const { db, admin } = require("../firebase/firebaseConfig");

const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        console.log("Attempting to fetch profile for userId:", userId);

        if (!userId) {
            console.log("User ID is missing in parameters");
            return res.status(400).json({ message: "User ID is required" });
        }

        const userProfileRef = db.collection('userProfiles').doc(userId);
        console.log("Firestore reference created:", userProfileRef.path);

        const doc = await userProfileRef.get();
        console.log("Firestore get operation completed");

        if (!doc.exists) {
            console.log("Document does not exist in Firestore");
            return res.status(404).json({ message: "User profile not found" });
        }

        const profileData = doc.data();
        if (!profileData || Object.keys(profileData).length === 0) {
            console.log("Document exists but has no data");
            return res.status(200).json({ message: "User profile data is empty", userId: userId });
        }

        console.log("Document data:", profileData);
        res.status(200).json(profileData);

    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ message: "Internal server error while fetching profile", error: error.message });
    }
};

const signupUser = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "Username, email and password are required" });
    }

    try {
        try {
            await admin.auth().getUserByEmail(email);
            return res.status(400).json({ message: "User already exists with this email" });
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                // User does not exist, proceed with creation
                const firebaseUser = await admin.auth().createUser({
                    email,
                    password,
                    displayName: username,
                });

                await db.collection('users').doc(firebaseUser.uid).set({
                    username,
                    email,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                });

                try {
                    await db.collection('userProfiles').doc(firebaseUser.uid).set({
                        userId: firebaseUser.uid,
                        username, // Initialize username in profile as well
                        createdAt: admin.firestore.FieldValue.serverTimestamp(),
                        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                        // Add any other default profile fields here if needed
                    });
                    return res.status(201).json({ message: "User registered successfully", userId: firebaseUser.uid });
                } catch (firestoreError) {
                    console.error("Firestore Error during profile creation:", firestoreError);
                    // Optionally, you might want to delete the Firebase Auth user if the profile creation fails
                    await admin.auth().deleteUser(firebaseUser.uid);
                    return res.status(500).json({ message: "Error creating user profile", error: firestoreError.message });
                }

            } else {
                // Other Firebase Auth error during check
                console.error("Error checking user existence:", error);
                return res.status(500).json({ message: "Error checking user existence", error: error.message });
            }
        }
    } catch (error) {
        console.error("Signup Error:", error);
        return res.status(500).json({ message: "Internal server error during signup", error: error.message });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        const firebaseUser = await admin.auth().getUserByEmail(email);

        // Verify the password
        try {
            // Firebase Admin SDK doesn't directly provide a password verification method against the stored hash.
            // You should rely on the client-side (Firebase SDK) to handle password-based login and then send the
            // ID token to your backend for verification and session management.

            // For demonstration purposes and if you have a custom mechanism, you might try:
            // const userRecord = await admin.auth().getUserByEmail(email);
            // // However, accessing the password hash directly is not allowed for security reasons.

            // The standard flow is:
            // 1. Client-side uses Firebase Auth SDK to sign in with email and password.
            // 2. Client-side gets the ID token after successful sign-in.
            // 3. Client-side sends the ID token in the Authorization header of subsequent requests.
            // 4. Backend verifies the ID token using `admin.auth().verifyIdToken()`.

            // Since we don't have the password in the backend in plain text, we cannot directly verify it here.
            // We will proceed assuming the client-side has successfully authenticated with Firebase.

            const userDoc = await db.collection('users').doc(firebaseUser.uid).get();

            if (!userDoc.exists) {
                return res.status(404).json({ message: "User data not found in Firestore" });
            }

            const userData = userDoc.data();

            // You might want to generate a custom token here for session management
            // const customToken = await admin.auth().createCustomToken(firebaseUser.uid);

            res.status(200).json({
                message: "Login successful",
                user: {
                    userId: firebaseUser.uid,
                    username: userData.username,
                    email: userData.email,
                    // You can include the custom token here if you are using it
                    // token: customToken,
                }
            });

        } catch (passwordError) {
            console.error("Password Verification Error:", passwordError);
            return res.status(401).json({ message: "Invalid credentials" });
        }

    } catch (error) {
        console.error("Login Error:", error);

        if (error.code === 'auth/user-not-found') {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(500).json({ message: "Internal server error during login", error: error.message });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const { uid } = req.user; // UID from the decoded ID token in the 'protect' middleware
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({ message: 'Username is required.' });
        }

        // Update display name in Firebase Auth
        await admin.auth().updateUser(uid, {
            displayName: username,
        });

        // Update username in Firestore (users collection)
        const userRef = db.collection('users').doc(uid);
        await userRef.update({ username, updatedAt: admin.firestore.FieldValue.serverTimestamp() });

        // Update username in Firestore (userProfiles collection)
        const profileRef = db.collection('userProfiles').doc(uid);
        await profileRef.update({ username, updatedAt: admin.firestore.FieldValue.serverTimestamp() });

        return res.status(200).json({ message: 'Username updated successfully.' });
    } catch (error) {
        console.error('Error updating user profile:', error);
        return res.status(500).json({ message: 'Failed to update username.', error: error.message });
    }
};

const updateUserPassword = async (req, res) => {
    try {
        const { uid } = req.user; // UID from the decoded ID token
        const { newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({ message: 'New password is required.' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
        }

        await admin.auth().updateUser(uid, {
            password: newPassword,
        });

        return res.status(200).json({ message: 'Password updated successfully.' });

    } catch (error) {
        console.error('Error updating password:', error);
        return res.status(500).json({ message: 'Failed to update password.', error: error.message });
    }
};

module.exports = {
    getUserProfile,
    signupUser,
    loginUser,
    updateUserProfile,
    updateUserPassword, // Export the new controller function
};