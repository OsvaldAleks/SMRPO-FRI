const admin = require("firebase-admin");

// Ensure correct path to service account key
const serviceAccount = require("../smrpo-project-firebase-adminsdk-fbsvc-f5d63459ad.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Firestore database instance
const db = admin.firestore();

// Firebase Authentication instance
const auth = admin.auth();

module.exports = { db, auth };
