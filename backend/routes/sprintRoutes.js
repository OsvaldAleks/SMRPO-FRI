const express = require("express");
const { createSprint, getSprint, getSprintsByProjectId } = require("../services/sprintService");

const router = express.Router();

// Create a sprint
router.post("/", async (req, res) => {
  try {
    const sprint = await createSprint(req.body.projectName, req.body.start_date, req.body.end_date, req.body.velocity);
    res.status(201).json({ message: "Sprint created successfully!", sprint });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get sprints for a project
router.get("/:sprintId", async (req, res) => {
  try {
    const sprint = await getSprint(req.params.sprintId);
    res.status(201).json({ message: "Sprint acquired successfully!", sprint });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get sprints for a project
router.get("/project/:projectId", async (req, res) => {
  try {
    const sprint = await getSprintsByProjectId(req.params.projectId);
    res.status(201).json({ message: "Sprint acquired successfully!", sprint });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
