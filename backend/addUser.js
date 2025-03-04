const { db, auth } = require("./firebase"); // Import Firestore and Firebase Auth

async function addUser() {
  try {
    // Adding a user to Firebase Authentication
    const userRecord = await auth.createUser({
      email: "janez.novak@email.com",
      password: "securepassword123",
      displayName: "Janez Novak",
    });

    // Link to firestore base
    const userRef = db.collection("users").doc(userRecord.uid);
    await userRef.set({
      id: userRecord.uid,
      name: "Janez",
      surname: "Novak",
      email: "janez.novak@email.com",
      username: "janez123",
      system_rights: "Developer",
      status: "active",
      last_online: null, // update on login
    });

    console.log("User successfully created in Firebase Authentication & Firestore:", userRecord.uid);
  } catch (error) {
    console.error("Error adding user:", error);
  }
}

addUser();
