const { db } = require("../firebase");

// Create a sprint
async function createSprint(projectId, name, start_date, end_date, velocity) {
  if (!projectId || !name || !start_date || !end_date || velocity === undefined) {
    throw new Error("All fields are required.");
  }

  // Validate project
  const projectRef = db.collection("projects").doc(projectId);
  const projectDoc = await projectRef.get();
  if (!projectDoc.exists) throw new Error("Project not found.");

  // Check overlapping sprints
  const overlappingSprints = await db.collection("sprints")
    .where("projectId", "==", projectId)
    .where("start_date", "<=", end_date)
    .where("end_date", ">=", start_date)
    .get();

  if (!overlappingSprints.empty) throw new Error("Sprint dates overlap with an existing sprint.");

  const sprintRef = db.collection("sprints").doc();
  const sprint = { id: sprintRef.id, projectId, name, start_date, end_date, velocity };

  await sprintRef.set(sprint);
  return sprint;
}

// Get sprints for a project
async function getSprints(projectId) {
  const sprintSnapshot = await db.collection("sprints").where("projectId", "==", projectId).get();
  if (sprintSnapshot.empty) throw new Error("No sprints found.");

  return sprintSnapshot.docs.map(doc => doc.data());
}

module.exports = { createSprint, getSprints };
