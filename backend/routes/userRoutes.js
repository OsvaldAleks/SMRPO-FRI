const express = require("express");
const { getUsers, getUser, addUser } = require("../services/userService");
const { updateUserStatus, updateUserInfo, updateUserPassword } = require("../services/userService");

const router = express.Router();

// Get all users
router.get("/", async (req, res) => {
  try {
    const users = await getUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Error fetching users" });
  }
});

// Get a specific user
router.get("/:userId", async (req, res) => {
  try {
    const user = await getUser(req.params.userId);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Error fetching user" });
  }
});

// Register a user
router.post("/register", async (req, res) => {
  try {
    const result = await addUser(req.body);

    if (result.success) {
      // If the user was successfully created
      res.status(201).json({ 
        message: result.message, 
        user: { uid: result.uid } 
      });
    } else {
      // If there was an error (e.g., missing fields, duplicate username)
      res.status(400).json({ 
        error: result.message 
      });
    }
  } catch (error) {
    console.error("Unexpected error in /register:", error);
    res.status(500).json({ 
      error: "An unexpected error occurred while registering the user." 
    });
  }
});

// Update user status
router.put("/:userId/status", async (req, res) => {
  try {
    const { status, last_online } = req.body; // Get status and last_online from request
    await updateUserStatus(req.params.userId, status, last_online);
    res.json({ message: "User status updated successfully" });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({ error: "Error updating user status" });
  }
});

router.put("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, surname, username, email, system_rights } = req.body;

    // Verify required fields
    if (!name || !surname || !username) {
      return res.status(400).json({ error: "Name, surname, and username are required." });
    }

    // Dynamically build the update object
    const updateData = { name, surname, username };

    if (email !== undefined) {
      updateData.email = email;
    }

    if (system_rights !== undefined) {
      updateData.system_rights = system_rights;
    }

    const result = await updateUserInfo(userId, updateData);

    if (result.success) {
      res.status(200).json({ message: result.message });
    } else {
      res.status(400).json({ error: result.message });
    }
  } catch (error) {
    console.error("Error updating user info:", error);
    res.status(500).json({ error: "An unexpected error occurred while updating user information." });
  }
});

// Update user password
router.put("/:userId/password", async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ error: "New password is required." });
    }

    const result = await updateUserPassword(userId, newPassword);

    if (result.success) {
      res.status(200).json({ message: result.message });
    } else {
      res.status(400).json({ error: result.message });
    }
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ error: "An unexpected error occurred while updating password." });
  }
});


module.exports = router;
