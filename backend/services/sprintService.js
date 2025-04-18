const { db } = require("../firebase");

function doDatesOverlap(start1, end1, start2, end2) {
  return start1 <= end2 && start2 <= end1;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("sl-SI", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}


async function validateSprintDates(projectId, newStartDate, newEndDate, sprintId = null) {
  try {
    const sprints = await getSprintsByProjectId(projectId);
    const newStart = newStartDate;
    const newEnd = newEndDate;

    for (const sprint of sprints) {
      // Skip checking the sprint that is being updated
      if (sprintId && sprint.id === sprintId) {
        continue;
      }

      const existingStart = sprint.start_date;
      const existingEnd = sprint.end_date;

      if (doDatesOverlap(newStart, newEnd, existingStart, existingEnd)) {
        return {
          success: false,
          message: `Overlaps with sprint: ${formatDate(sprint.start_date)} to ${formatDate(sprint.end_date)}`,
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

async function deleteSprint(sprintId) {
  try {
    const sprintDoc = await db.collection("sprints").doc(sprintId).get();
    
    if (!sprintDoc.exists) {
      throw new Error("Sprint not found.");
    }
    
    const sprint = sprintDoc.data();
    const currentDate = new Date();
    const sprintStartDate = new Date(sprint.start_date);
    
    if (sprintStartDate <= currentDate) {
      throw new Error("Sprint cannot be deleted because it has already started.");
    }
    
    await db.collection("sprints").doc(sprintId).delete();
    console.log("Sprint deleted successfully:", sprintId);
    
    return { success: true, message: "Sprint deleted successfully." };
  } catch (error) {
    console.error("Failed to delete sprint:", error.message);
    return { success: false, message: error.message };
  }
}

async function updateSprint(sprintId, updatedData) {
  try {
    const sprintRef = db.collection("sprints").doc(sprintId);
    const sprintDoc = await sprintRef.get();

    if (!sprintDoc.exists) {
      throw new Error("Sprint not found.");
    }

    const existingSprint = sprintDoc.data();
    const { start_date, end_date, velocity } = updatedData;

    if (start_date && end_date && new Date(end_date) < new Date(start_date)) {
      throw new Error("End date cannot be before start date.");
    }

    if (velocity !== undefined && velocity < 0) {
      throw new Error("Velocity cannot be negative.");
    }

    await sprintRef.update(updatedData);
    console.log("Sprint updated successfully:", updatedData);

    return { id: sprintId, ...existingSprint, ...updatedData };
  } catch (error) {
    console.error("Failed to update sprint:", error.message);
    throw error;
  }
}


module.exports = { createSprint, getSprint, getSprintsByProjectId, deleteSprint, updateSprint, validateSprintDates };
