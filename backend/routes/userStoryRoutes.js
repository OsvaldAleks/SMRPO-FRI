const express = require("express");
const { createUserStory, getUserStory, assignUserStoryToSprint, updateUserStoryStatus, getUserStoriesForProject, updateStoryPoints } = require("../services/userStoryService");

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

// Get user story
router.get("/:storyId", async (req, res) => {
  try {
    const { storyId } = req.params;
    const response = await getUserStory(storyId);
    res.status(200).json(response);
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

// Get all user stories for a specified project
router.get("/project/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const userStories = await getUserStoriesForProject(projectId);

    if (!userStories || userStories.length === 0) {
      return [];
    }

    res.status(200).json({ stories: userStories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update story point value
router.put("/:storyId/setStoryPoints", async (req, res) => {
  try {
    const { storyId } = req.params;
    const { value } = req.body;

    const response = await updateStoryPoints(storyId, value);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:storyId/addSubtask", async (req, res) => {
  try {
    const { storyId } = req.params;
    const { description, timeEstimate, developer } = req.body;

    // timeEstimate might be optional or required. 
    // developer is definitely optional per your requirement.

    const response = await addSubtaskToUserStory(storyId, {
      description,
      timeEstimate,
      developer,
    });

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;
