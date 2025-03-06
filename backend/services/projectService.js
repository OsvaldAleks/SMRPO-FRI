const { db, auth } = require("../firebase"); // Import Firestore and Firebase Auth

async function addProject() {
  try {  
    const userRef = db.collection("users").doc(userRecord.uid);
    await userRef.set({
      name: "testName",
    });
  
    console.log("Project successfully created in Firestore:", userRecord.uid);
    } catch (error) {
      console.error("Error adding project:", error);
    }
  }
  
  module.exports = {addProject};