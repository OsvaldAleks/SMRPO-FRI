const express = require("express");
const cors = require("cors");
const { db, auth } = require("./firebase");

const app = express();
app.use(cors()); // Allow frontend to access API
app.use(express.json()); // Enable JSON body parsing

const PORT = process.env.PORT || 5000;

// Admin Registers a User
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

// Create a New Sprint
app.post("/sprints", async (req, res) => {
    try {
      const { name, start_date, end_date, velocity } = req.body;
  
      // Check if all required fields are present
      if (!name || !start_date || !end_date || velocity === undefined) {
        return res.status(400).json({ message: "All fields are required!" });
      }
  
      // Validate date format and order
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
      
      if (isNaN(startDate) || isNaN(endDate)) {
        return res.status(400).json({ message: "Invalid date format!" });
      }
      
      if (startDate >= endDate) {
        return res.status(400).json({ message: "Start date must be before end date!" });
      }
  
      // Validate sprint velocity
      if (velocity < 1 || velocity > 100) {
        return res.status(400).json({ message: "Sprint velocity must be between 1 and 100!" });
      }
  
      // Check for overlapping sprints
      const overlappingSprints = await db.collection("sprints")
        .where("start_date", "<=", end_date)
        .where("end_date", ">=", start_date)
        .get();
  
      if (!overlappingSprints.empty) {
        return res.status(400).json({ message: "Sprint dates overlap with an existing sprint!" });
      }
  
      // Generate a unique sprint ID
      const sprintRef = db.collection("sprints").doc();
      const sprintId = sprintRef.id;
  
      // Save sprint in Firestore
      await sprintRef.set({
        id: sprintId,
        name,
        start_date,
        end_date,
        velocity,
      });
  
      res.status(201).json({ message: "Sprint successfully created!", sprintId });
    } catch (error) {
      res.status(500).json({ message: "Error creating sprint", error: error.message });
    }
  });
  
  // Get All Sprints
  app.get("/sprints", async (req, res) => {
    try {
      const sprintSnapshot = await db.collection("sprints").get();
      const sprints = sprintSnapshot.docs.map(doc => doc.data());
  
      res.status(200).json(sprints);
    } catch (error) {
      res.status(500).json({ message: "Error fetching sprints", error: error.message });
    }
  });
  
  // Get Sprint by ID
  app.get("/sprints/:id", async (req, res) => {
    const sprintId = req.params.id;
  
    try {
      const sprintRef = db.collection("sprints").doc(sprintId);
      const doc = await sprintRef.get();
  
      if (!doc.exists) {
        return res.status(404).json({ message: "Sprint not found!" });
      }
  
      res.status(200).json(doc.data());
    } catch (error) {
      res.status(500).json({ message: "Error retrieving sprint", error: error.message });
    }
  });

// Start backend server
app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
