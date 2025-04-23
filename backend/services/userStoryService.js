const { db } = require("../firebase");
const admin = require("firebase-admin");
const { FieldPath } = require("firebase-admin").firestore;
const FieldValue = admin.firestore.FieldValue;

async function validateAndPrepareUserStory(
  projectId,
  name,
  description,
  acceptanceCriteria,
  priority,
  businessValue,
  excludeStoryId = null // Pass the ID of the story being updated
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

  // Convert name to lowercase for case-insensitive comparison
  const lowercaseName = name.toLowerCase();

  // Check for existing user stories with the same name (excluding the current story if updating)
  let query = db
    .collection("userStories")
    .where("projectId", "==", projectId)
    .where("lowercaseName", "==", lowercaseName);

  if (excludeStoryId) {
    query = query.where(FieldPath.documentId(), "!=", excludeStoryId); // Exclude the current story
  }

  const storiesSnapshot = await query.get();

  if (!storiesSnapshot.empty) {
    throw new Error("A user story with the same name already exists in this project.");
  }

  return { projectId, name, lowercaseName, description, acceptanceCriteria, priority, businessValue };
}

async function createUserStory(projectId, name, description, acceptanceCriteria, priority, businessValue, sprintId = []) {
  const validatedStory = await validateAndPrepareUserStory(
    projectId,
    name,
    description,
    acceptanceCriteria,
    priority,
    businessValue
  );

  const storyRef = db.collection("userStories").doc();
  const story = {
    id: storyRef.id,
    sprintId,
    status: "Backlog",
    ...validatedStory,
  };

  await storyRef.set(story);
  return story;
}

async function updateUserStory(storyId, name, description, acceptanceCriteria, priority, businessValue) {
  const storyRef = db.collection("userStories").doc(storyId);
  const storyDoc = await storyRef.get();
  if (!storyDoc.exists) throw new Error("User story not found.");

  const currentStory = storyDoc.data();
  const validatedStory = await validateAndPrepareUserStory(
    currentStory.projectId,
    name,
    description,
    acceptanceCriteria,
    priority,
    businessValue,
    storyId
  );

  const updatedStory = {
    ...currentStory,
    ...validatedStory,
    id: storyId
  };

  await storyRef.update(validatedStory);
  return updatedStory;
}


// Get a user story by its ID
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
    suggestedDevName: subtaskData.developer || null,
    workdate: null,
    worktimes: null,
  };

  // Check the status and update it if necessary
  let newStatus = story.status;

  if (story.status === "Done") {
    newStatus = "In progress";  // If status is 'Done', change it to 'In progress'
  }

  await storyRef.set(
    {
      subtasks: FieldValue.arrayUnion(newSubtask),
      status: newStatus,
    },
    { merge: true }
  );

  return { message: "Subtask added successfully!", status: newStatus };
}

async function claimSubtask(storyId, userId, taskIndex) {
  if (!storyId || !userId || taskIndex === undefined) {
    throw new Error("Invalid storyId, userId, or taskIndex.");
  }

  const storyRef = db.collection("userStories").doc(storyId);
  const storyDoc = await storyRef.get();

  if (!storyDoc.exists) {
    throw new Error("User story not found.");
  }

  const storyData = storyDoc.data();
  const subtasks = storyData.subtasks || [];

  if (taskIndex < 0 || taskIndex >= subtasks.length) {
    throw new Error("Invalid subtask index.");
  }

  const subtask = subtasks[taskIndex];
  const newDeveloperId = subtask.developerId === userId ? null : userId;
  let newDevName = null;

  if (newDeveloperId) {
    try {
      const userRef = db.collection("users").doc(newDeveloperId);
      const userDoc = await userRef.get();
      if (!userDoc.exists) {
        throw new Error(`User not found for ID: ${newDeveloperId}`);
      }
      newDevName = userDoc.data().username || "Unknown Developer";
    } catch (error) {
    }
  }

  const updatedSubtask = {
    ...subtask,
    developerId: newDeveloperId,
    devName: newDevName || null,
    isDone: subtask.isDone ?? false, // Fix: Avoid Firestore rejecting 'undefined'
  };

  const updatedSubtasks = subtasks.map((task, index) =>
    index === taskIndex
      ? updatedSubtask
      : { ...task, isDone: task.isDone ?? false } // Fix: Ensure all subtasks have isDone
  );

  let newStatus = storyData.status;
  if (newDeveloperId) {
    newStatus = "In progress";
  } else {
    const activeSubtasks = updatedSubtasks.filter(task => !task.deleted);
    const anyClaimed = activeSubtasks.some(task => task.developerId);
    newStatus = anyClaimed ? "In progress" : "Product backlog";
  }

  try {
    await storyRef.set(
      { subtasks: updatedSubtasks, status: newStatus },
      { merge: true }
    );
  } catch (error) {
    throw new Error("Database update failed.");
  }

  return {
    message: newDeveloperId ? "Subtask claimed successfully!" : "Subtask unclaimed successfully!",
    subtask: updatedSubtask,
    status: newStatus,
  };
}


async function completeSubtask(storyId, subtaskIndex) {
  try {
    const storyRef = db.collection("userStories").doc(storyId);
    const storyDoc = await storyRef.get();

    if (!storyDoc.exists) {
      return { success: false, message: "Story not found" };
    }

    const story = storyDoc.data();
    const subtasks = story.subtasks || [];

    if (subtaskIndex < 0 || subtaskIndex >= subtasks.length) {
      return { success: false, message: "Invalid subtask index" };
    }

    // Toggle the completion status of the targeted subtask
    subtasks[subtaskIndex].isDone = !(subtasks[subtaskIndex].isDone || false);

    // Filter only active (not soft-deleted) subtasks
    const activeSubtasks = subtasks.filter(task => !task.deleted);

    // Check if all active subtasks are completed
    const allCompleted = activeSubtasks.length > 0 && activeSubtasks.every(task => task.isDone);

    // Determine new status
    let newStatus = story.status;
    if (allCompleted) {
      newStatus = "Done";
    } else if (!allCompleted && story.status === "Done") {
      newStatus = "In progress";
    }

    await storyRef.update({ subtasks, status: newStatus });

    return {
      success: true,
      message: "Subtask updated",
      subtasks,
      status: newStatus
    };
  } catch (error) {
    console.error("Error updating subtask:", error);
    return { success: false, message: "Internal server error" };
  }
}

async function evaluateUserStory(storyId, isAccepted, comment, productManagerId) {
  // 1) Preverimo, ali imamo vse podatke
  if (!storyId) {
    throw new Error("Story ID is required.");
  }
  if (typeof isAccepted !== "boolean") {
    throw new Error("isAccepted mora biti true ali false.");
  }
  if (!isAccepted && (!comment || comment.trim().length === 0)) {
    throw new Error("Komentar je obvezen, če je zgodba zavrnjena.");
  }
  // 2) Dobimo user story iz baze
  const storyRef = db.collection("userStories").doc(storyId);
  const storyDoc = await storyRef.get();
  if (!storyDoc.exists) {
    throw new Error("User story not found.");
  }
  const storyData = storyDoc.data();

  // 3) Mora imeti vsaj en sprintId, da ga lahko ocenjujemo
  if (!storyData.sprintId || storyData.sprintId.length === 0) {
    throw new Error("User story ni v nobenem sprintu.");
  }

  // 4) Preverimo, ali je sprint že končan
  //    Ker je v zgodbi lahko več sprintov, bomo preverili,
  //    ali je vsaj eden od njih zares zaključen (end_date < zdaj).
  const sprintIds = storyData.sprintId;

  const sprintsSnap = await db
    .collection("sprints")
    .where(admin.firestore.FieldPath.documentId(), "in", sprintIds)
    .get();

  if (sprintsSnap.empty) {
    throw new Error("Noben sprint znotraj user storyja ne obstaja v bazi.");
  }

  // 5) Glede na isAccepted = true/false pripravimo posodobitvena polja
  const updateData = {
    evaluatedAt: new Date().toISOString(),
    evaluatedBy: productManagerId || null, // Lahko shranimo, kdo je ocenil
  };

  if (isAccepted) {
    // Sprejeta zgodba -> recimo, da v bazi nastavimo "acceptanceStatus" ali "status"
    // in jo označimo kot končano ter pustimo sprintId zaradi zgodovine.
    // Za prikaz na "Completed stories" bo dovolj recimo "acceptanceStatus = ACCEPTED"
    updateData.acceptanceStatus = "ACCEPTED";
    updateData.rejectionComment = admin.firestore.FieldValue.delete(); // brišemo morebitni stari komentar
    updateData.status = "Completed"; // ali kakšen drug status po želji
  } else {
    // Zavrnjena zgodba -> nujno shranimo comment, da se vidi v podrobnem pogledu
    // in jo odstranimo iz sprinta, da se vrne v "stories not in sprint"
    updateData.acceptanceStatus = "REJECTED";
    updateData.rejectionComment = comment;
    updateData.status = "Rejected";

    // Zgodbo odstranimo iz polja sprintId
    // Če jih je več, jih vse odstranimo
    for (const sId of sprintIds) {
      await storyRef.update({
        sprintId: FieldValue.arrayRemove(sId),
      });
    }
  }

  // 6) Izvedemo update
  await storyRef.set(updateData, { merge: true });

  return {
    success: true,
    message: isAccepted
      ? "User story je bila uspešno sprejeta."
      : "User story je bila zavrnjena.",
  };
}

async function forceAssignUserStoryToSprint(storyId, sprintId) {
  if (!storyId || !sprintId) {
    throw new Error("Story ID and Sprint ID are required.");
  }

  const storyRef = db.collection("userStories").doc(storyId);
  const storyDoc = await storyRef.get();
  if (!storyDoc.exists) {
    throw new Error("User story not found.");
  }

  // Bypass any date checks:
  await storyRef.update({
    sprintId: FieldValue.arrayUnion(sprintId),
    status: "Sprint backlog", // ali po želji
  });

  return { message: "User story forcibly assigned to sprint (even if ended)." };
}

async function deleteUserStory(storyId){
  if (!storyId) {
    throw new Error("Story ID is required.");
  }

  const storyRef = db.collection("userStories").doc(storyId);
  const storyDoc = await storyRef.get();
  if (!storyDoc.exists) {
    throw new Error("User story not found.");
  }

  const storyData = storyDoc.data();

  if (storyData.sprintId && storyData.sprintId.length > 0) {
    throw new Error("Cannot delete a user story that is assigned to a sprint.");
  }

  await storyRef.delete();

  return { message: "User story deleted successfully." };
}

async function deleteSubtask(storyId, subtaskIndex) {
  const storyRef = db.collection("userStories").doc(storyId);
  const storyDoc = await storyRef.get();

  if (!storyDoc.exists) {
    throw new Error("User story not found.");
  }

  const storyData = storyDoc.data();

  // Check if story is completed
  if (storyData.status === 'Done') {
    throw new Error('Cannot delete subtasks from a completed story');
  }

  // Validate subtasks array
  if (!Array.isArray(storyData.subtasks) || subtaskIndex >= storyData.subtasks.length) {
    throw new Error("Invalid subtask index.");
  }

  const subtask = storyData.subtasks[subtaskIndex];

  // Check if subtask is claimed
  if (subtask.developerId) {
    throw new Error('Cannot delete a subtask that has been claimed by a developer');
  }

  // Check if subtask is already marked as deleted
  if (subtask.deleted) {
    throw new Error('Subtask is already marked as deleted');
  }

  // Mark subtask as deleted
  const updatedSubtasks = [...storyData.subtasks];
  updatedSubtasks[subtaskIndex] = {
    ...updatedSubtasks[subtaskIndex],
    deleted: true
  };

  await storyRef.update({ subtasks: updatedSubtasks });
  return { message: "Subtask marked as deleted." };
}

async function updateSubtask(storyId, subtaskIndex, updates) {
  const storyRef = db.collection("userStories").doc(storyId);
  const storyDoc = await storyRef.get();

  if (!storyDoc.exists) {
    throw new Error("User story not found.");
  }

  const storyData = storyDoc.data();
  const subtasks = storyData.subtasks || [];

  if (!Array.isArray(subtasks) || subtaskIndex < 0 || subtaskIndex >= subtasks.length) {
    throw new Error("Invalid subtask index.");
  }

  const subtask = subtasks[subtaskIndex];

  // Apply updates
  if (updates.description !== undefined) subtask.description = updates.description;
  if (updates.timeEstimate !== undefined) subtask.timeEstimate = Number(updates.timeEstimate);
  if (updates.developer !== undefined) subtask.devName = updates.developer;

  subtasks[subtaskIndex] = subtask;

  await storyRef.update({ subtasks });

  return { message: "Subtask updated successfully.", subtask };
}

// Start time recording for a subtask
async function startTimeRecording(storyId, subtaskIndex) {
  try {
    console.log(`Starting time recording for story ${storyId}, subtask ${subtaskIndex}`);
    
    const storyRef = db.collection('userStories').doc(storyId);
    const storyDoc = await storyRef.get();
    
    if (!storyDoc.exists) {
      console.error('Story not found');
      throw new Error('User story not found');
    }

    const storyData = storyDoc.data();
    console.log('Current story data:', JSON.stringify(storyData, null, 2));
    
    let subtasks = storyData.subtasks || [];
    console.log(`Current subtasks (count: ${subtasks.length}):`, JSON.stringify(subtasks, null, 2));
    
    if (subtaskIndex < 0 || subtaskIndex >= subtasks.length) {
      console.error(`Invalid subtask index: ${subtaskIndex}`);
      throw new Error('Invalid subtask index');
    }

    // Check if another subtask is already being recorded
    const alreadyRecording = subtasks.some(sub => sub.workdate);
    if (alreadyRecording) {
      console.error('Another subtask is already being recorded');
      throw new Error('Another subtask is already being recorded');
    }

    // Create a NEW array with the updated subtask
    const updatedSubtasks = [...subtasks]; // Create a copy of the array
    updatedSubtasks[subtaskIndex] = {
      ...subtasks[subtaskIndex], // Copy all existing fields
      workdate: new Date().toISOString() // Update workdate
    };

    console.log('Updated subtasks array:', JSON.stringify(updatedSubtasks, null, 2));

    // Perform the update
    console.log('Performing Firestore update...');
    await storyRef.update({ subtasks: updatedSubtasks });
    console.log('Firestore update completed successfully');

    return {
      success: true,
      message: 'Time recording started successfully'
    };
  } catch (error) {
    console.error('Error in startTimeRecording:', error);
    return {
      success: false,
      message: error.message || 'Failed to start time recording'
    };
  }
}

// Stop time recording and save the duration
async function stopTimeRecording(storyId, subtaskIndex, userId) {
  try {
    const storyRef = db.collection('userStories').doc(storyId);
    const storyDoc = await storyRef.get();
    
    if (!storyDoc.exists) {
      throw new Error('User story not found');
    }

    const storyData = storyDoc.data();
    const subtasks = storyData.subtasks || [];
    
    if (subtaskIndex < 0 || subtaskIndex >= subtasks.length) {
      throw new Error('Invalid subtask index');
    }

    const existingSubtask = subtasks[subtaskIndex];
    if (!existingSubtask.workdate) {
      throw new Error('This subtask is not being recorded');
    }

    // Calculate duration in seconds
    const startTime = new Date(existingSubtask.workdate);
    const endTime = new Date();
    const duration = Math.floor((endTime - startTime) / 1000);

    const worktimes = existingSubtask.worktimes || [];
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    let updated = false;
    const updatedWorktimes = worktimes.map(entry => {
      const entryDate = new Date(entry.timestamp || 0).toISOString().split('T')[0];
      if (entry.userid === userId && entryDate === today) {
        updated = true;
        return {
          ...entry,
          duration: (entry.duration || 0) + duration,
          timestamp: entry.timestamp || new Date().toISOString() // optional: update timestamp
        };
      }
      return entry;
    });

    if (!updated) {
      updatedWorktimes.push({
        userid: userId,
        duration,
        timestamp: new Date().toISOString()
      });
    }

    const updatedSubtasks = [...subtasks];
    updatedSubtasks[subtaskIndex] = {
      ...existingSubtask,
      workdate: null,
      worktimes: updatedWorktimes
    };

    await storyRef.update({ subtasks: updatedSubtasks });
    
    return {
      success: true,
      message: 'Time recording stopped successfully',
      duration
    };
  } catch (error) {
    console.error('Error stopping time recording:', error);
    return {
      success: false,
      message: error.message || 'Failed to stop time recording'
    };
  }
}


// Get all stories with subtasks that the user has worked on
async function getUserStoriesWithWorkTimes(userId) {
  try {
    const storiesSnapshot = await db.collection('userStories')
      .where('subtasks', '!=', [])
      .get();

    if (storiesSnapshot.empty) {
      return [];
    }

    const stories = [];
    storiesSnapshot.forEach(doc => {
      const storyData = doc.data();
      // Preserve all subtask fields, just filter by worktimes
      const subtasksWithWork = storyData.subtasks
        .map((subtask, index) => ({
          ...subtask, // Include ALL subtask fields
          originalIndex: index
        }))
        .filter(subtask => 
          subtask.worktimes && 
          subtask.worktimes.some(wt => wt.userid === userId)
        );

      if (subtasksWithWork.length > 0) {
        stories.push({
          id: doc.id,
          ...storyData,
          subtasks: subtasksWithWork
        });
      }
    });

    return stories;
  } catch (error) {
    console.error('Error getting user stories with work times:', error);
    throw error;
  }
}

// Update a specific work time entry
async function updateWorkTime(storyId, subtaskIndex, workTimeIndex, updates) {
  const storyRef = db.collection('userStories').doc(storyId);
  const storyDoc = await storyRef.get();

  if (!storyDoc.exists) {
    throw new Error('User story not found');
  }

  const storyData = storyDoc.data();
  const subtasks = storyData.subtasks || [];

  if (subtaskIndex < 0 || subtaskIndex >= subtasks.length) {
    throw new Error('Invalid subtask index');
  }

  const subtask = subtasks[subtaskIndex];
  if (!subtask.worktimes || workTimeIndex < 0 || workTimeIndex >= subtask.worktimes.length) {
    throw new Error('Invalid work time index');
  }

  // Create a new array with the updated worktime
  const updatedWorktimes = subtask.worktimes.map((wt, idx) => 
    idx === workTimeIndex ? { ...wt, ...updates } : wt
  );

  // Create a new subtasks array with the updated subtask
  const updatedSubtasks = subtasks.map((st, idx) => 
    idx === subtaskIndex ? { ...st, worktimes: updatedWorktimes } : st
  );

  // Update the entire subtasks array to maintain structure
  await storyRef.update({ subtasks: updatedSubtasks });
  
  return { success: true };
}

async function updatePredictedTime(storyId, subtaskIndex, predictedTime) {
  const storyRef = db.collection('userStories').doc(storyId);
  const storyDoc = await storyRef.get();

  if (!storyDoc.exists) {
    throw new Error('User story not found');
  }

  const storyData = storyDoc.data();
  const subtasks = storyData.subtasks || [];

  if (subtaskIndex < 0 || subtaskIndex >= subtasks.length) {
    throw new Error('Invalid subtask index');
  }

  // Create a new array with the updated subtask
  const updatedSubtasks = subtasks.map((subtask, index) => 
    index === subtaskIndex ? { ...subtask, predictedFinishTime: predictedTime } : subtask
  );

  await storyRef.update({ subtasks: updatedSubtasks });
  return { success: true };
}

module.exports = { 
  createUserStory, 
  getUserStory,
  assignUserStoryToSprint, 
  updateUserStoryStatus, 
  getUserStoriesForProject,
  updateStoryPoints,
  addSubtaskToUserStory,
  claimSubtask,
  completeSubtask,
  evaluateUserStory,
  forceAssignUserStoryToSprint,
  deleteUserStory,
  updateUserStory,
  deleteSubtask,
  updateSubtask,
  startTimeRecording,
  stopTimeRecording,
  getUserStoriesWithWorkTimes,
  updateWorkTime,
  updatePredictedTime
};


