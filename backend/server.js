
const express = require("express");
const cors = require("cors");
const { db, auth } = require("./firebase");
const { getUsers } = require("./services/userService");

const app = express();
app.use(cors()); // Allow frontend to access API
app.use(express.json()); // Enable JSON body parsing

const PORT = process.env.PORT || 5000;

app.post("/register", async (req, res) => {
  const { name, surname, email, password, username, system_rights, status } = req.body;

  try {
    // Validate input fields
    if (!email || !password || !name || !surname || !username || !system_rights || !status) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if username exists
    const usernameQuery = await db.collection("users").where("username", "==", username).get();
    if (!usernameQuery.empty) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Create user in Firebase Authentication
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: `${name} ${surname}`,
    });

    // Store user in Firestore
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

    res.status(201).json({ message: "User successfully created!", userId: userRecord.uid });
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error: error.message });
  }
});

app.get('/getUsers', async (req, res) => {
  console.log(db);
  try {
    const users = await getUsers();
    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
