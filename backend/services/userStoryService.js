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
  // Validate required fields
  if (!projectId || !name || !description || !acceptanceCriteria || !priority || businessValue === undefined) {
    throw new Error("All fields except sprintId are required.");
  }

  // Validate acceptance criteria
  if (!Array.isArray(acceptanceCriteria) || acceptanceCriteria.length === 0) {
    throw new Error("Acceptance criteria must be a non-empty array.");
  }

  // Validate business value
  if (typeof businessValue !== "number" || businessValue < 0) {
    throw new Error("Business value must be a positive number.");
  }

  // Check if the project exists
  const projectRef = db.collection("projects").doc(projectId);
  const projectDoc = await projectRef.get();
  if (!projectDoc.exists) throw new Error("Project not found.");

  // Check if a story with the same name already exists in the project
  const storiesSnapshot = await db
    .collection("userStories")
    .where("projectId", "==", projectId)
    .where("name", "==", name)
    .get();

  if (!storiesSnapshot.empty) {
    throw new Error("A user story with the same name already exists in this project.");
  }

  // Create the new user story
  const storyRef = db.collection("userStories").doc();
  const story = {
    id: storyRef.id,
    projectId,
    sprintId,
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

async function addSubtaskToUserStory(storyId, subtaskData) {
  const storyRef = db.collection("userStories").doc(storyId);
  const storyDoc = await storyRef.get();

  if (!storyDoc.exists) {
    throw new Error("User story not found.");
  }

  const story = storyDoc.data();

  // Ensure the story has a sprintId (meaning it's assigned to a sprint)
  if (!story.sprintId || story.sprintId.length === 0) {
    throw new Error("Cannot add subtasks to a story not assigned to any sprint.");
  }

  // Validate subtask fields
  if (!subtaskData.description) {
    throw new Error("Subtask description is required.");
  }
  if (subtaskData.timeEstimate == null || isNaN(subtaskData.timeEstimate)) {
    throw new Error("Subtask 'timeEstimate' must be a valid number.");
  }

  const newSubtask = {
    description: subtaskData.description,
    timeEstimate: Number(subtaskData.timeEstimate),
    devName: subtaskData.developer || null,
  };

  // Ensure the `subtasks` array exists before updating
  await storyRef.set(
    {
      subtasks: FieldValue.arrayUnion(newSubtask),
    },
    { merge: true }
  );

  return { message: "Subtask added successfully!" };
} 

async function claimSubtask(storyId, userId, taskIndex) {
  if (!storyId || !userId || taskIndex === undefined) {
    console.error("Invalid storyId, userId, or taskIndex.");
    throw new Error("Invalid storyId, userId, or taskIndex.");
  }

  const storyRef = db.collection("userStories").doc(storyId);
  const storyDoc = await storyRef.get();

  if (!storyDoc.exists) {
    console.error(`User story not found for ID: ${storyId}`);
    throw new Error("User story not found.");
  }

  const storyData = storyDoc.data();
  const subtasks = storyData.subtasks || [];

  if (taskIndex < 0 || taskIndex >= subtasks.length) {
    console.error(`Invalid subtask index: ${taskIndex}`);
    throw new Error("Invalid subtask index.");
  }

  const subtask = subtasks[taskIndex];
  const newDeveloperId = subtask.developerId === userId ? null : userId;
  let newDevName = null;

  if (newDeveloperId) {
    try {
      const userRef = db.collection("users").doc(newDeveloperId);
      const userDoc = await userRef.get();
      if (!userDoc.exists) throw new Error(`User not found for ID: ${newDeveloperId}`);

      newDevName = userDoc.data().name || "Unknown Developer";
    } catch (error) {
      console.error("Failed to fetch user details:", error);
    }
  }

  subtasks[taskIndex] = { ...subtask, developerId: newDeveloperId, devName: newDevName };

  let newStatus = storyData.status;

  if (newDeveloperId) {
    newStatus = "In progress";
  } else {
    // If unclaimed, check if any subtasks still have a developer
    const anyClaimed = subtasks.some(task => task.developerId);
    newStatus = anyClaimed ? "In progress" : "Product backlog";
  }

  await storyRef.update({ subtasks, status: newStatus });

  return {
    message: newDeveloperId ? "Subtask claimed successfully!" : "Subtask unclaimed successfully!",
    subtask: subtasks[taskIndex],
    status: newStatus,
  };
}


module.exports = { 
  createUserStory, 
  getUserStory,
  assignUserStoryToSprint, 
  updateUserStoryStatus, 
  getUserStoriesForProject,
  updateStoryPoints,
  addSubtaskToUserStory,
  claimSubtask
};


