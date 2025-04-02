const express = require("express");
const { createUserStory, getUserStory, assignUserStoryToSprint, updateUserStoryStatus, getUserStoriesForProject, updateStoryPoints, addSubtaskToUserStory, claimSubtask, completeSubtask, evaluateUserStory, deleteUserStory, updateUserStory, deleteSubtask, updateSubtask } = require("../services/userStoryService");

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

router.put("/:storyId/claimSubtask", async (req, res) => {
  try {
    const { storyId } = req.params;
    const { userId, subtaskIndex } = req.body;

    const response = await claimSubtask(storyId,
      userId,
      subtaskIndex,
    );

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:storyId/completeSubtask", async (req, res) => {
  try {
    const { storyId } = req.params;
    const { subtaskIndex } = req.body;

    const response = await completeSubtask(storyId,
      subtaskIndex,
    );

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:storyId/evaluate", async (req, res) => {
  try {
    const { storyId } = req.params;
    const { isAccepted, comment, userId } = req.body;
    const result = await evaluateUserStory(storyId, isAccepted, comment, userId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error evaluating user story:", error);
    // Vrnite recimo 400 ali 404
    return res.status(404).json({ message: error.message });
  }
});

router.delete("/:storyId", async (req, res) =>{
  try{
    const { storyId } = req.params;
    const result = await deleteUserStory(storyId);
    return res.status(200).json(result);
  }catch (error) {
    console.error("Error removing user story:", error);
    return res.status(404).json({ message: error.message });
  }
});

router.put("/:storyId/update", async (req, res) =>{
  try{
    const { storyId } = req.params;
    console.log("story ", storyId)
    const userStory = await updateUserStory(
      storyId,
      req.body.name,
      req.body.description,
      req.body.acceptanceCriteria,
      req.body.priority,
      req.body.businessValue,
    );

    res.status(201).json({ message: "User story updated successfully!", userStory });
  }catch (error){
    console.error("Error changing user story:", error);
    return res.status(404).json({ message: error.message });
  }
});


// DELETE subtask
router.delete("/:storyId/subtask/:subtaskIndex", async (req, res) => {
  const { storyId, subtaskIndex } = req.params;

  try {
    const index = parseInt(subtaskIndex);
    if (isNaN(index)) {
      return res.status(400).json({ message: "Invalid subtask index" });
    }

    const result = await deleteSubtask(storyId, index);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error deleting subtask:", error.message || error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// UPDATE subtask
router.put("/:storyId/updateSubtask", async (req, res) => {
  const { storyId } = req.params;
  const { subtaskIndex, description, timeEstimate, developer } = req.body;

  try {
    const result = await updateSubtask(storyId, subtaskIndex, {
      description,
      timeEstimate,
      developer
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error updating subtask:", error.message || error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
});

module.exports = router;
