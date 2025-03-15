const { db, auth } = require("../firebase"); // Import Firestore and Firebase Auth

async function addUser(userData) {
  try {
    const { email, password, name, surname, username, system_rights, status } = userData;

    if (!email || !password || !name || !surname || !username || !system_rights || !status) {
      console.log("Error: All fields are required.");
      return;
    }

    const usernameQuery = await db.collection("users").where("username", "==", username).get();
    if (!usernameQuery.empty) {
      console.log("Error: Username already exists.");
      return;
    }

    const userRecord = await auth.createUser({
      email,
      password,
      displayName: `${name} ${surname}`,
    });

    await db.collection("users").doc(userRecord.uid).set({
      id: userRecord.uid,
      name,
      surname,
      email,
      username,
      system_rights,
      status,
      last_online: null,
      previous_online: null,
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
