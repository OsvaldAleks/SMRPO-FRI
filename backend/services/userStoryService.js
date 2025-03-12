const { db } = require("../firebase");
const admin = require("firebase-admin");
const FieldValue = admin.firestore.FieldValue;

// Create a user story
async function createUserStory(
  projectId,
  name,
  description,
  acceptanceCriteria,
  priority,
  businessValue,
  sprintId = [] // <-- default to empty array
) {
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
    sprintId, // Now stores an array rather than a single sprint ID
    name,
    description,
    acceptanceCriteria,
    priority,
    businessValue,
    status: "Backlog", // Initial status
  };

  await storyRef.set(story);
  return story;
}

async function getUserStory(storyId) {
  if (!storyId) {
    throw new Error("Story ID is required.");
  }

  const storyRef = db.collection("userStories").doc(storyId);
  const storyDoc = await storyRef.get();

  if (!storyDoc.exists) {
    throw new Error("User story not found.");
  }

  return { id: storyDoc.id, ...storyDoc.data() };
}


async function assignUserStoryToSprint(storyId, sprintId) {
  if (!storyId || !sprintId) {
    throw new Error("Story ID and Sprint ID are required.");
  }

  const storyRef = db.collection("userStories").doc(storyId);
  const storyDoc = await storyRef.get();
  if (!storyDoc.exists) throw new Error("User story not found.");

  // Use arrayUnion to *append* the new sprintId to the existing sprintId array
  await storyRef.update({
    sprintId: FieldValue.arrayUnion(sprintId),
    status: "Product backlog"
  });

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

async function getUserStoriesForProject(projectId) {
  if (!projectId) {
    throw new Error("Project ID is required.");
  }

  const storiesRef = db.collection("userStories");
  const querySnapshot = await storiesRef.where("projectId", "==", projectId).get();

  if (querySnapshot.empty) {
    return []; 
  }

  const userStories = querySnapshot.docs.map(doc => {
    return { id: doc.id, ...doc.data() };
  });

  return userStories;
}

async function updateStoryPoints(storyId, storyPoints) {
  // Ensure storyPoints is parsed as a number
  storyPoints = Number(storyPoints);

  if (!storyId || isNaN(storyPoints) || storyPoints < 0 || storyPoints > 99) {
    throw new Error("Story ID and story points must be valid non-negative numbers, smaller than 100.");
  }

  const storyRef = db.collection("userStories").doc(storyId);
  const storyDoc = await storyRef.get();

  if (!storyDoc.exists) {
    throw new Error("User story not found.");
  }

  const storyData = storyDoc.data();

  if (storyData.sprintId.length != 0) {
    throw new Error("Cannot update story points for a story assigned to a sprint.");
  }

  await storyRef.set({ storyPoints }, { merge: true });

  return { message: "Story points updated successfully!" };
}


module.exports = { 
  createUserStory, 
  getUserStory,
  assignUserStoryToSprint, 
  updateUserStoryStatus, 
  getUserStoriesForProject,
  updateStoryPoints
};


