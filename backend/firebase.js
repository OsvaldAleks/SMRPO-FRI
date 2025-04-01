const admin = require("firebase-admin");

// Ensure correct path to service account key
const serviceAccount = require("./smrpo-project-firebase-adminsdk-fbsvc-05eb93516b.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Firestore database instance
const db = admin.firestore();

// Firebase Authentication instance
const auth = admin.auth();

module.exports = { db, auth };
