const db = require("./firebase");

async function getUser(userId) {
  const userRef = db.collection("users").doc(userId);
  const doc = await userRef.get();

  if (!doc.exists) {
    console.log("Uporabnik ne obstaja.");
  } else {
    console.log("Podatki o uporabniku:", doc.data());
  }
}

getUser("user_123");
