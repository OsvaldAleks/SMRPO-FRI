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
      previous_online: null, // Update on login

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
      return null;
    } else {
      return doc.data();
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
}

async function getUsers() {
  const usersRef = db.collection("users");
  const snapshot = await usersRef.get();

  if (snapshot.empty) {
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

// New function to update user status
async function updateUserStatus(userId, status) {
  try {
    const userRef = db.collection("users").doc(userId);

    // Ensure the user exists
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      throw new Error("User not found");
    }

    // Get current data
    const userData = userDoc.data();

    if (status === "offline") {
      // Move last_online to previous_online, then update last_online
      await userRef.update({
        status: "offline",
        //previous_online: userData.last_online, // Store the old last_online value
        //last_online: new Date().toISOString(),
      });
    } else {
      // Just update status to "online"
      await userRef.update({
        status: "online",
        previous_online: userData.last_online, // Store the old last_online value
        last_online: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Error updating user status:", error);
    throw error;
  }
}


module.exports = {
  getUser,
  getUsers,
  addUser,
  updateUserStatus,
};
