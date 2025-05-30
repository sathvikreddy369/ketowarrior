// firebase/firebaseConfig.js
const admin = require('firebase-admin');

// **IMPORTANT:** Replace with the path to your Firebase Admin SDK service account key JSON file.
const serviceAccount = require('../config/blackpanther-2ee05-firebase-adminsdk-fbsvc-e82f8336ef.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // You might need to configure the database URL if you are using Realtime Database
  // databaseURL: "YOUR_DATABASE_URL"
});

const db = admin.firestore(); // Use Firestore
// If you are using Realtime Database, you would use:
// const db = admin.database();

module.exports = { admin, db };