const { db } = require("../firebase");

// Create a user story
async function createUserStory(sprintId, name, description, acceptanceCriteria, priority, businessValue) {
  if (!sprintId || !name || !description || !acceptanceCriteria || !priority || businessValue === undefined) {
    throw new Error("All fields are required.");
  }

  if (!Array.isArray(acceptanceCriteria)) {
    throw new Error("Acceptance criteria must be an array of strings.");
  }

  const sprintRef = db.collection("sprints").doc(sprintId);
  const sprintDoc = await sprintRef.get();
  if (!sprintDoc.exists) throw new Error("Sprint not found.");

  const storyRef = db.collection("userStories").doc();
  const story = { 
    id: storyRef.id, 
    sprintId, 
    name, 
    description, 
    acceptanceCriteria, // Now stored as an array
    priority, 
    businessValue, 
    status: "Backlog"
  };

  await storyRef.set(story);
  return story;
}

module.exports = { createUserStory };
