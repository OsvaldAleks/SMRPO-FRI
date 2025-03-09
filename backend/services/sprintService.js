const { db } = require("../firebase");

async function createSprint(projectName, start_date, end_date, velocity) {
  if (!projectName || !start_date || !end_date || velocity === undefined) {
    throw new Error("All fields are required.");
  }

  const projectQuery = await db.collection("projects")
    .where("name", "==", projectName)
    .limit(1)
    .get();

  if (projectQuery.empty) {
    throw new Error("Project not found.");
  }

  const projectDoc = projectQuery.docs[0];
  const projectId = projectDoc.id;

  const sprintRef = db.collection("sprints").doc();

  const sprint = { id: sprintRef.id,
    projectId,
    start_date,
    end_date,
    velocity 
  };

  await sprintRef.set(sprint);
  return sprint;
}

// Get a sprint by its ID
async function getSprint(sprintId) {
  try {
    const sprintDoc = await db.collection("sprints").doc(sprintId).get();
    if (!sprintDoc.exists) {
      throw new Error("Sprint not found.");
    }
    return sprintDoc.data();
  } catch (error) {
    console.error("Error fetching sprint:", error);
    throw error; 
  }
}

// Get all sprints for a given project ID
async function getSprintsByProjectId(projectId) {
  try {
    const sprintsSnapshot = await db
      .collection("sprints")
      .where("projectId", "==", projectId)
      .get();

    if (sprintsSnapshot.empty) {
      console.log("No sprints found for the given project ID.");
      return [];
    }

    const sprints = sprintsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return sprints;
  } catch (error) {
    console.error("Error fetching sprints:", error);
    throw error;
  }
}

module.exports = { createSprint, getSprint, getSprintsByProjectId };
