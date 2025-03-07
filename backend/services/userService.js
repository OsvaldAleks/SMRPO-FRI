const { db, auth } = require("../firebase"); // Import Firestore and Firebase Auth

async function addUser(userData) {
  try {
    const { email, password, name, surname, username, system_rights, status } = userData;

    // Backend validation: Check for missing fields
    if (!email || !password || !name || !surname || !username || !system_rights || !status) {
      console.log("Error: All fields are required.");
      return;
    }

    // Check if username already exists
    const usernameQuery = await db.collection("users").where("username", "==", username).get();
    if (!usernameQuery.empty) {
      console.log("Error: Username already exists.");
      return;
    }

    // Create user in Firebase Authentication
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: `${name} ${surname}`,
    });

    // Save user to Firestore
    await db.collection("users").doc(userRecord.uid).set({
      id: userRecord.uid,
      name,
      surname,
      email,
      username,
      system_rights,
      status,
      last_online: null, // Update on login
    });

    console.log("User successfully created:", userRecord.uid);
  } catch (error) {
    console.error("Error adding user:", error);
  }
}

async function getUser(userId) {
  try {
    const userRef = db.collection("users").doc(userId);
    const doc = await userRef.get();

    if (!doc.exists) {
      console.log("Uporabnik ne obstaja.");
      return null;
    } else {
      const userData = doc.data();
      console.log("Podatki o uporabniku:", userData);
      return userData;
    }
  } catch (error) {
    console.error("Napaka pri pridobivanju podatkov o uporabniku:", error);
    throw error;
  }
}

async function getUsers() {
  const usersRef = db.collection("users");
  const snapshot = await usersRef.get();

  if (snapshot.empty) {
      console.log("No users found.");
      return [];
  }

  const users = [];
  snapshot.forEach((doc) => {
      const userData = doc.data();
      userData.id = doc.id;
      users.push(userData);
  });

  return users;
}

module.exports = {getUser,
    getUsers,
    addUser};
