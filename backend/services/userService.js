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


// Update user information (name, surname, username)
async function updateUserInfo(userId, userData) {
  try {
    const { name, surname, username } = userData;

    // Validate required fields
    if (!name || !surname || !username) {
      throw new Error("Name, surname, and username are required.");
    }

    const normalizedUsername = username.toLowerCase(); // Convert input to lowercase

    // Check if username is already taken by another user (case-insensitive)
    const usernameQuery = await db.collection("users")
      .where("username_lowercase", "==", normalizedUsername) // Query against lowercase field
      .get();

    // Check if the found username belongs to a different user
    if (!usernameQuery.empty && usernameQuery.docs[0].id !== userId) {
      throw new Error("Username already exists.");
    }

    // Update user in Firestore with both original and lowercase username
    await db.collection("users").doc(userId).update({
      name,
      surname,
      username, // Store original case
      username_lowercase: normalizedUsername, // Store lowercase version for queries
    });

    return {
      success: true,
      message: "User information updated successfully.",
    };
  } catch (error) {
    console.error("Error updating user:", error);
    return {
      success: false,
      message: error.message || "Failed to update user information.",
    };
  }
}

// Update user password
async function updateUserPassword(userId, newPassword) {
  try {
    await auth.updateUser(userId, {
      password: newPassword,
    });

    return {
      success: true,
      message: "Password updated successfully.",
    };
  } catch (error) {
    console.error("Error updating password:", error);
    return {
      success: false,
      message: error.message || "Failed to update password.",
    };
  }
}


module.exports = {
  getUser,
  getUsers,
  addUser,
  updateUserStatus,
  updateUserInfo,  // Add this
  updateUserPassword,  // Add this
};
