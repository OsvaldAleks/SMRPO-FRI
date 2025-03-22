const express = require("express");
const { createProject, getUserProjects, getProject } = require("../services/projectService");

const router = express.Router();

// Create a project
router.post("/", async (req, res) => {
  try {
    console.log("Received project data:", req.body); // Log incoming request body

    const { name, description, devs, scrumMasters, productOwners, owner } = req.body;

    // Create the project
    const project = await createProject(name, description, devs, scrumMasters, productOwners, owner);
    res.status(201).json({ message: "Project created successfully", project });

  } catch (error) {
    console.error("Error creating project:", error); // Log the actual error
    res.status(500).json({ error: error.message || "Error creating project" });
  }
});


// Get projects for a user
router.get("/user/:userId", async (req, res) => {
  try {
    const projects = await getUserProjects(req.params.userId);
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: "Error fetching projects" });
  }
});

// Get a specific project
router.get("/details/:projectName", async (req, res) => {
  try {
    const project = await getProject(req.params.projectName, req.query.userId);
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: "Error fetching project details" });
  }
});

module.exports = router;
