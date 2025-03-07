const express = require("express");
const { createSprint, getSprints } = require("../services/sprintService");

const router = express.Router();

// Create a sprint
router.post("/", async (req, res) => {
  try {
    const sprint = await createSprint(req.body.projectId, req.body.name, req.body.start_date, req.body.end_date, req.body.velocity);
    res.status(201).json({ message: "Sprint created successfully!", sprint });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get sprints for a project
router.get("/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const sprintSnapshot = await db.collection("sprints").where("projectId", "==", projectId).get();

    if (sprintSnapshot.empty) {
      return res.status(404).json({ message: "No sprints found!" });
    }

    const sprints = sprintSnapshot.docs.map(doc => doc.data());
    res.status(200).json(sprints);
  } catch (error) {
    res.status(500).json({ message: "Error fetching sprints", error: error.message });
  }
});

module.exports = router;
