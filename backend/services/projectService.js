const { db } = require("../firebase");

async function createProject(name, devs, scrumMasters, productManagers) {
  if (!name || !devs || !scrumMasters || !productManagers) {
    throw new Error("All fields are required");
  }

  // Check if a project with the same name already exists
  const existingProject = await db.collection("projects").where("name", "==", name).get();
  if (!existingProject.empty) {
    throw new Error("Project name already exists. Please choose another name.");
  }

  const projectId = db.collection("projects").doc().id; // Generate unique ID

  const newProject = {
    id: projectId,
    name,
    devs,
    scrumMasters,
    productManagers,
    createdAt: new Date(),
  };

  await db.collection("projects").doc(projectId).set(newProject);

  return newProject;
}


module.exports = { createProject };