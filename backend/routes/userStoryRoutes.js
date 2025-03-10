const express = require("express");
const { createUserStory, getUserStories } = require("../services/userStoryService");

const router = express.Router();

// Create a user story
router.post("/", async (req, res) => {
  try {
    const userStory = await createUserStory(
      req.body.sprintId,
      req.body.name,
      req.body.description,
      req.body.acceptanceCriteria,
      req.body.priority,
      req.body.businessValue
    );
    res.status(201).json({ message: "User story created successfully!", userStory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user stories for a project
router.get("/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const storiesSnapshot = await db.collection("userStories").where("projectId", "==", projectId).get();

    if (storiesSnapshot.empty) {
      return res.status(404).json({ message: "No user stories found!" });
    }

    const userStories = storiesSnapshot.docs.map(doc => doc.data());
    res.status(200).json(userStories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user stories", error: error.message });
  }
});

module.exports = router;
