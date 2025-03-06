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
  const userRef = db.collection("users").doc(userId);
  const doc = await userRef.get();

  if (!doc.exists) {
    console.log("Uporabnik ne obstaja.");
  } else {
    console.log("Podatki o uporabniku:", doc.data());
  }
}

async function getUsers() {
  // Check if Firestore is initialized
  if (!db) {
      console.error('Firestore is not initialized!');
      return [];
  }

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
