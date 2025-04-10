const express = require("express");
const { validateSprintDates, createSprint, getSprint, getSprintsByProjectId, deleteSprint, updateSprint } = require("../services/sprintService");

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
    const { projectId, newStartDate, newEndDate, sprintId } = req.body;

    if (!projectId || !newStartDate || !newEndDate) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    const validationResult = await validateSprintDates(projectId, newStartDate, newEndDate, sprintId);

    if (!validationResult.success) {
      return res.status(400).json(validationResult);
    }

    return res.json(validationResult); // No overlaps
  } catch (error) {
    console.error("Error validating sprint dates:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.delete("/:sprintId", async (req, res) => {
  try {
    const sprint = await deleteSprint(req.params.sprintId);
    res.status(200).json({ message: "Sprint deleted successfully!", sprint });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:sprintId/update", async (req, res) => {
  try {
    const sprintData = {
      projectName: req.body.projectName,
      start_date: req.body.start_date,
      end_date: req.body.end_date,
      velocity: req.body.velocity
    };
        const sprint = await updateSprint(req.params.sprintId, sprintData);
    res.status(200).json({ message: "Sprint updated successfully!", sprint });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
