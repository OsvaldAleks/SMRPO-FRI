const { db, auth } = require("./firebase");

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

// Example usage
addUser({
  email: "janez.novak@email.com",
  password: "securepassword123",
  name: "Janez",
  surname: "Novak",
  username: "janez123",
  system_rights: "Developer",
  status: "active",
});
