const admin = require('firebase-admin');

// Initialize Firebase Admin SDK (replace with your credentials if not already initialized)
const serviceAccount = require('./config/blackpanther-2ee05-firebase-adminsdk-fbsvc-e82f8336ef.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  //databaseURL: 'your-firebase-database-url' // Optional, if you use Realtime Database
});

const db = admin.firestore();

const userId = 'ZZ5BmhJz2kYEHK4i8px6d6uwO6B2';

const testData = [
  { date: '2025-04-15', reached_targets: true, protein_achieved: 55, carbs_achieved: 210, fat_achieved: 55, protein_target: 50, carbs_target: 200, fat_target: 60, timestampSeconds: 1744708800 },
  { date: '2025-04-16', reached_targets: true, protein_achieved: 52, carbs_achieved: 205, fat_achieved: 58, protein_target: 50, carbs_target: 200, fat_target: 60, timestampSeconds: 1744795200 },
  { date: '2025-04-17', reached_targets: true, protein_achieved: 60, carbs_achieved: 220, fat_achieved: 59, protein_target: 50, carbs_target: 200, fat_target: 60, timestampSeconds: 1744881600 },
  { date: '2025-04-18', reached_targets: true, protein_achieved: 58, carbs_achieved: 215, fat_achieved: 57, protein_target: 50, carbs_target: 200, fat_target: 60, timestampSeconds: 1744968000 },
  { date: '2025-04-12', reached_targets: true, protein_achieved: 45, carbs_achieved: 190, fat_achieved: 62, protein_target: 40, carbs_target: 180, fat_target: 65, timestampSeconds: 1744449600 },
  { date: '2025-03-18', reached_targets: true, protein_achieved: 51, carbs_achieved: 201, fat_achieved: 56, protein_target: 48, carbs_target: 195, fat_target: 60, timestampSeconds: 1742371200 },
  { date: '2025-04-14', reached_targets: false, protein_achieved: 30, carbs_achieved: 150, fat_achieved: 70, protein_target: 40, carbs_target: 180, fat_target: 65, timestampSeconds: 1744622400 },
  { date: '2025-05-15', reached_targets: true, protein_achieved: 55, carbs_achieved: 210, fat_achieved: 55, protein_target: 50, carbs_target: 200, fat_target: 60, timestampSeconds: 1744708800 },
  { date: '2025-05-16', reached_targets: true, protein_achieved: 52, carbs_achieved: 205, fat_achieved: 58, protein_target: 50, carbs_target: 200, fat_target: 60, timestampSeconds: 1744795200 },
  { date: '2025-05-17', reached_targets: true, protein_achieved: 60, carbs_achieved: 220, fat_achieved: 59, protein_target: 50, carbs_target: 200, fat_target: 60, timestampSeconds: 1744881600 },
  { date: '2025-05-18', reached_targets: true, protein_achieved: 58, carbs_achieved: 215, fat_achieved: 57, protein_target: 50, carbs_target: 200, fat_target: 60, timestampSeconds: 1744968000 },
  { date: '2025-05-12', reached_targets: true, protein_achieved: 45, carbs_achieved: 190, fat_achieved: 62, protein_target: 40, carbs_target: 180, fat_target: 65, timestampSeconds: 1744449600 },
  { date: '2025-05-18', reached_targets: true, protein_achieved: 51, carbs_achieved: 201, fat_achieved: 56, protein_target: 48, carbs_target: 195, fat_target: 60, timestampSeconds: 1742371200 },
  { date: '2025-05-14', reached_targets: false, protein_achieved: 30, carbs_achieved: 150, fat_achieved: 70, protein_target: 40, carbs_target: 180, fat_target: 65, timestampSeconds: 1744622400 },
];

async function addTestData() {
    for (const data of testData) {
      const docId = `${userId}-${data.date}`;
      const timestamp = new admin.firestore.Timestamp(data.timestampSeconds, 0); // Use the constructor
      await db.collection('daily_macro_streaks').doc(docId).set({
        user_id: userId,
        date: data.date,
        reached_targets: data.reached_targets,
        protein_achieved: data.protein_achieved,
        carbs_achieved: data.carbs_achieved,
        fat_achieved: data.fat_achieved,
        protein_target: data.protein_target,
        carbs_target: data.carbs_target,
        fat_target: data.fat_target,
        timestamp: timestamp,
      });
      console.log(`Added document: ${docId}`);
    }
    console.log('Test data added successfully!');
  }

addTestData().catch(error => {
  console.error('Error adding test data:', error);
});