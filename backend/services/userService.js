const { db, auth } = require("../firebase"); // Import Firestore and Firebase Auth

function isUserDeleted(userData) {
  return (
    !userData.email &&
    !userData.name &&
    !userData.surname &&
    !userData.system_rights
  );
}


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
      .where("username_lowercase", "==", normalizedUsername) // Query in lowercase
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
      const userData = doc.data();
      return userData;
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

  if (snapshot.empty) return [];

  const users = [];
  snapshot.forEach((doc) => {
    const userData = doc.data();
    if (!isUserDeleted(userData)) {
      userData.id = doc.id;
      users.push(userData);
    }
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
    if (isUserDeleted(userData)) throw new Error("Cannot update status of deleted user");

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
      const userData = doc.data();
      if (!isUserDeleted(userData)) {
        batch.update(doc.ref, { status: "offline" });
      }
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


async function updateUserInfo(userId, userData) {
  try {
    const userRef = db.collection("users").doc(userId);
    const existingUserDoc = await userRef.get();

    if (!existingUserDoc.exists) {
      throw new Error("User not found.");
    }

    const existingUserData = existingUserDoc.data();
    if (isUserDeleted(existingUserData)) {
      throw new Error("Cannot update deleted user.");
    }

    const { name, surname, username, email, system_rights } = userData;

    if (!name || !surname || !username) {
      throw new Error("Name, surname, and username are required.");
    }

    const normalizedUsername = username.toLowerCase();

    const usernameQuery = await db.collection("users")
      .where("username_lowercase", "==", normalizedUsername)
      .get();

    if (!usernameQuery.empty && usernameQuery.docs[0].id !== userId) {
      throw new Error("Username already exists.");
    }

    const updateFields = {
      name,
      surname,
      username,
      username_lowercase: normalizedUsername,
    };

    if (email) {
      updateFields.email = email;
      await auth.updateUser(userId, { email }); // <- update in Firebase Auth
    }

    if (system_rights) updateFields.system_rights = system_rights;

    await db.collection("users").doc(userId).update(updateFields);

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
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists || isUserDeleted(userDoc.data())) {
      throw new Error("Cannot update password for deleted user.");
    }

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

async function deleteUser(userId) {
  try {
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return {
        success: false,
        message: "User not found.",
      };
    }

    // Soft-delete user in Firestore
    const updateFields = {
      name: "",
      surname: "",
      email: "",
      system_rights: "",
      status: "",
      normalizedUsername: "",
      last_online: null,
      previous_online: null
    };
    await userRef.update(updateFields);

    // Unclaim user's subtasks in all user stories
    const storiesSnapshot = await db.collection("userStories").get();

    const batch = db.batch();

    storiesSnapshot.forEach((doc) => {
      const storyData = doc.data();
      const subtasks = storyData.subtasks || [];

      let updated = false;
      const updatedSubtasks = subtasks.map((subtask) => {
        if (subtask.developerId === userId) {
          updated = true;
          return {
            ...subtask,
            developerId: null,
            devName: null,
            isDone: subtask.isDone ?? false,
          };
        }
        return { ...subtask, isDone: subtask.isDone ?? false };
      });

      if (updated) {
        const activeSubtasks = updatedSubtasks.filter(task => !task.deleted);
        const anyClaimed = activeSubtasks.some(task => task.developerId);
        const newStatus = anyClaimed ? "In progress" : "Product backlog";

        batch.set(doc.ref, {
          subtasks: updatedSubtasks,
          status: newStatus,
        }, { merge: true });
      }
    });

    await batch.commit();

    // Fully delete user from Firebase Auth
    await auth.deleteUser(userId);

    return {
      success: true,
      message: "User successfully deleted, subtasks unclaimed, and Auth entry removed.",
    };

  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      success: false,
      message: error.message || "Failed to delete user.",
    };
  }
}


module.exports = {
  getUser,
  getUsers,
  addUser,
  updateUserStatus,
  updateUserInfo,
  updateUserPassword,
  deleteUser
};
