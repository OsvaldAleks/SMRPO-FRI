const express = require("express");
const { createSprint, getSprint, getSprintsByProjectId } = require("../services/sprintService");

const router = express.Router();

function doDatesOverlap(start1, end1, start2, end2) {
  return start1 <= end2 && start2 <= end1;
}

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

// Date validation
router.post("/validateDates", async (req, res) => {
  try {
    const { projectId, newStartDate, newEndDate } = req.body;

    if (!projectId || !newStartDate || !newEndDate) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    const sprints = await getSprintsByProjectId(projectId);

    for (const sprint of sprints) {
      if (doDatesOverlap(newStartDate, newEndDate, sprint.start_date, sprint.end_date)) {
        return res.status(400).json({
          success: false,
          message: `New sprint overlaps with existing sprint: (${sprint.start_date} to ${sprint.end_date})`,
        });
      }
    }

    return res.json({ success: true }); // No overlaps
  } catch (error) {
    console.error("Error validating sprint dates:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
