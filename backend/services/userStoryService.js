const { db } = require("../firebase");

// Create a user story
async function createUserStory(projectId, name, description, acceptanceCriteria, priority, businessValue, sprintId = null) {
  if (!projectId || !name || !description || !acceptanceCriteria || !priority || businessValue === undefined) {
    throw new Error("All fields except sprintId are required.");
  }

  if (!Array.isArray(acceptanceCriteria) || acceptanceCriteria.length === 0) {
    throw new Error("Acceptance criteria must be a non-empty array.");
  }

  if (typeof businessValue !== "number" || businessValue < 0) {
    throw new Error("Business value must be a positive number.");
  }

  const projectRef = db.collection("projects").doc(projectId);
  const projectDoc = await projectRef.get();
  if (!projectDoc.exists) throw new Error("Project not found.");

  const storyRef = db.collection("userStories").doc();
  const story = { 
    id: storyRef.id, 
    projectId, 
    sprintId, // Defaults to null
    name, 
    description, 
    acceptanceCriteria, 
    priority, 
    businessValue, 
    status: "Backlog" // Initial status
  };

  await storyRef.set(story);
  return story;
}

async function assignUserStoryToSprint(storyId, sprintId) {
  if (!storyId || !sprintId) {
    throw new Error("Story ID and Sprint ID are required.");
  }

  const storyRef = db.collection("userStories").doc(storyId);
  const storyDoc = await storyRef.get();
  if (!storyDoc.exists) throw new Error("User story not found.");

  await storyRef.update({ sprintId, status: "Product backlog" }); // Move to next stage
  return { message: "User story assigned to sprint successfully!" };
}

async function updateUserStoryStatus(storyId, newStatus) {
  const validStatuses = ["Backlog", "Product backlog", "Sprint backlog", "Analysis & design", "Coding", "Testing", "Integration", "Documentation", "Acceptance ready", "Acceptance", "Done"];
  if (!storyId || !validStatuses.includes(newStatus)) {
    throw new Error("Invalid story ID or status.");
  }

  const storyRef = db.collection("userStories").doc(storyId);
  const storyDoc = await storyRef.get();
  if (!storyDoc.exists) throw new Error("User story not found.");

  await storyRef.update({ status: newStatus });
  return { message: `User story status updated to ${newStatus}.` };
}

module.exports = { createUserStory, assignUserStoryToSprint, updateUserStoryStatus };


module.exports = { createUserStory, assignUserStoryToSprint };


module.exports = { createUserStory };
