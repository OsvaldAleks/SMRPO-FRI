const { db, auth } = require("../firebase"); // Import Firestore and Firebase Auth

async function addUser(userData) {
  try {
    const { email, password, name, surname, username, system_rights, status } = userData;

    // Validate required fields
    if (!email || !password || !name || !surname || !username || !system_rights || !status) {
      throw new Error("All fields are required.");
    }

    const normalizedUsername = username.toLowerCase(); // Convert input username to lowercase

    // Check if username already exists (case-insensitive)
    const usernameQuery = await db.collection("users")
      .where("username", "==", normalizedUsername) // Query in lowercase
      .get();

    if (!usernameQuery.empty) {
      throw new Error("Username already exists.");
    }

    // Create user in Firebase Authentication
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: `${name} ${surname}`,
    });

    // Add user to Firestore with lowercase username
    await db.collection("users").doc(userRecord.uid).set({
      id: userRecord.uid,
      name,
      surname,
      email,
      username: normalizedUsername, // Store in lowercase
      system_rights,
      status,
      last_online: null,
      previous_online: null,
    });

    // Return success response
    return {
      success: true,
      message: "User successfully created.",
      uid: userRecord.uid,
    };
  } catch (error) {
    // Log the error for debugging
    console.error("Error adding user:", error);

    // Return error response
    return {
      success: false,
      message: error.message || "Failed to add user.",
    };
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

// Update user status and handle last/previous online
async function updateUserStatus(userId, status) {
  try {
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      throw new Error("User not found");
    }

    const userData = userDoc.data();

    if (status === "offline") {
      await userRef.update({
        status: "offline",
      });
    } else {
      await userRef.update({
        status: "online",
        previous_online: userData.last_online,
        last_online: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Error updating user status:", error);
    throw error;
  }
}

// Function to set all users to offline before the server shuts down
async function setAllUsersOffline() {
  try {
    const usersRef = db.collection("users");
    const snapshot = await usersRef.get();

    const batch = db.batch();
    snapshot.forEach((doc) => {
      batch.update(doc.ref, { status: "offline" });
    });

    await batch.commit();
    console.log("All users set to offline before shutdown.");
  } catch (error) {
    console.error("Error setting all users offline:", error);
  }
}

// Ensure all users go offline before the server shuts down
process.on("exit", setAllUsersOffline);
process.on("SIGINT", async () => {
  await setAllUsersOffline();
  process.exit();
});
process.on("SIGTERM", async () => {
  await setAllUsersOffline();
  process.exit();
});

module.exports = {
  getUser,
  getUsers,
  addUser,
  updateUserStatus,
};
