const { db } = require("../firebase");

// Create a user story
async function createUserStory(projectId, sprintId, name, description, acceptanceCriteria, priority, businessValue) {
  if (!projectId || !name || !description || !acceptanceCriteria || !priority || businessValue === undefined) {
    throw new Error("All fields are required.");
  }

  const projectRef = db.collection("projects").doc(projectId);
  const projectDoc = await projectRef.get();
  if (!projectDoc.exists) throw new Error("Project not found.");

  if (sprintId) {
    const sprintRef = db.collection("sprints").doc(sprintId);
    const sprintDoc = await sprintRef.get();
    if (!sprintDoc.exists) throw new Error("Sprint not found.");
  }

  const storyRef = db.collection("userStories").doc();
  const story = { id: storyRef.id, projectId, sprintId: sprintId || null, name, description, acceptanceCriteria, priority, businessValue, status: "Backlog" };

  await storyRef.set(story);
  return story;
}

// Get user stories for a project
async function getUserStories(projectId) {
  const storiesSnapshot = await db.collection("userStories").where("projectId", "==", projectId).get();
  if (storiesSnapshot.empty) throw new Error("No user stories found.");

  return storiesSnapshot.docs.map(doc => doc.data());
}

module.exports = { createUserStory, getUserStories };
