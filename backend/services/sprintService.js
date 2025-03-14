const { db } = require("../firebase");

function doDatesOverlap(start1, end1, start2, end2) {
  return start1 <= end2 && start2 <= end1;
}

async function validateSprintDates(projectId, newStartDate, newEndDate) {
  try {
    const sprints = await getSprintsByProjectId(projectId);
    const newStart = newStartDate;
    const newEnd = newEndDate;

    for (const sprint of sprints) {
      const existingStart = sprint.start_date;
      const existingEnd = sprint.end_date;

      if (doDatesOverlap(newStart, newEnd, existingStart, existingEnd)) {
        return {
          success: false,
          message: `New sprint overlaps with existing sprint: ${sprint.name} (${sprint.start_date} to ${sprint.end_date})`,
        };
      }
    }
    return { success: true };
  } catch (error) {
    console.error("Error validating sprint dates:", error);
    return { success: false, message: "Error validating sprint dates." };
  }
}


async function createSprint(projectName, start_date, end_date, velocity) {
  const newSprint = { start_date, end_date, velocity } ;

  try {
    const projectQuery = await db.collection("projects")
      .where("name", "==", projectName)
      .limit(1)
      .get();

    if (projectQuery.empty) {
      throw new Error("Project not found.");
    }

    const projectId = projectQuery.docs[0].id;

    await validateSprintDates(projectId, start_date, end_date);

    const sprintRef = db.collection("sprints").doc();
    const sprint = { id: sprintRef.id, projectId, ...newSprint };
  
    await sprintRef.set(sprint);
    console.log("Sprint added successfully:", sprint);

    return sprint;
  } catch (error) {
    console.error("Failed to add sprint:", error.message);
    throw error;
  }
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
