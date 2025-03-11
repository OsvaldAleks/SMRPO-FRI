const express = require("express");
const { getUsers, getUser, addUser } = require("../services/userService");
const { updateUserStatus } = require("../services/userService");

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
    const user = await addUser(req.body);
    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    res.status(500).json({ error: "Error registering user" });
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


module.exports = router;
