const express = require("express");
const { createUserStory, assignUserStoryToSprint, updateUserStoryStatus } = require("../services/userStoryService");

const router = express.Router();

// Create a user story
router.post("/", async (req, res) => {
  try {
    const userStory = await createUserStory(
      req.body.projectId,
      req.body.name,
      req.body.description,
      req.body.acceptanceCriteria,
      req.body.priority,
      req.body.businessValue,
      req.body.sprintId || null
    );
    res.status(201).json({ message: "User story created successfully!", userStory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Assign user story to a sprint
router.put("/:storyId/assignSprint", async (req, res) => {
  try {
    const { storyId } = req.params;
    const { sprintId } = req.body;

    const response = await assignUserStoryToSprint(storyId, sprintId);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user story status
router.put("/:storyId/status", async (req, res) => {
  try {
    const { storyId } = req.params;
    const { newStatus } = req.body;

    const response = await updateUserStoryStatus(storyId, newStatus);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
