const express = require("express");
const { createProject, getUserProjects, getProject, updateProject, getProjectDocumentation, updateProjectDocumentation, getWallPosts, addWallPost, addWallComment, deleteWallPost, deleteWallComment } = require("../services/projectService");

const router = express.Router();

// Create a project
router.post("/", async (req, res) => {
  try {
    const { name, description, devs, scrumMasters, productOwners, owner } = req.body;

    // Create the project
    const project = await createProject(name, description, devs, scrumMasters, productOwners, owner);
    res.status(201).json({ message: "Project created successfully", project });

  } catch (error) {
    console.error("Error creating project:", error); // Log the actual error
    res.status(500).json({ error: error.message || "Error creating project" });
  }
});

// Update a project
router.put("/:projectId", async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const { name, description, devs, scrumMasters, productOwners} = req.body;

    // Create the project
    const project = await updateProject(projectId, name, description, devs, scrumMasters, productOwners);
    res.status(201).json({ message: "Project updated successfully", project });

  } catch (error) {
    console.error("Error creating project:", error); // Log the actual error
    res.status(500).json({ error: error.message || "Error updating project" });
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

router.get("/:projectId/documentation", async (req, res) => {
  try {
    const documentation = await getProjectDocumentation(req.params.projectId);
    res.json({ documentation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:projectId/documentation", async (req, res) => {
  try {
    const result = await updateProjectDocumentation(req.params.projectId, req.body.documentation);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:projectId/wall", async (req, res) => {
  try {
    const posts = await getWallPosts(req.params.projectId);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:projectId/wall", async (req, res) => {
  try {
    console.log("Incoming wall post data:", req.body); // 👈
    const { userId, username, content } = req.body;

    const post = await addWallPost(req.params.projectId, userId, username, content);
    res.status(201).json({ message: "Post added", post });
  } catch (err) {
    console.error("Error in POST /wall:", err); // 👈
    res.status(500).json({ error: err.message });
  }
});

router.post("/wall/:postId/comment", async (req, res) => {
  try {
    const comment = await addWallComment(req.params.postId, req.body);
    res.status(201).json({ message: "Comment added", comment });
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/wall/:postId', async (req, res) => {
  const { postId } = req.params;

  try {
    const success = await deleteWallPost(postId);
    if (!success) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json({ message: 'Post deleted' });
  } catch (error) {
    console.error("Error deleting wall post:", error);
    res.status(500).json({ message: "Failed to delete post" });
  }
});

router.delete("/wall/:postId/comment/:commentId", async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    await deleteWallComment(postId, commentId);
    res.status(200).json({ message: "Comment deleted" });
  } catch (err) {
    console.error("Error deleting comment:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
