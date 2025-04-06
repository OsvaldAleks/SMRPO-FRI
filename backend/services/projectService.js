const { db } = require("../firebase");
const userService = require('./userService');

function validateProjectInput(name, description, devs, scrumMasters, productManagers) {
  if (!name || !description) {
    throw new Error("All fields are required");
  }

  const missingRoles = [];

  if (!Array.isArray(devs) || devs.length === 0) missingRoles.push("developer");
  if (!Array.isArray(scrumMasters) || scrumMasters.length === 0) missingRoles.push("scrum master");
  if (!Array.isArray(productManagers) || productManagers.length === 0) missingRoles.push("product manager");

  if (missingRoles.length > 0) {
    const last = missingRoles.pop();
    const msg = missingRoles.length
      ? `At least one ${missingRoles.join(", ")} and ${last} must be assigned to the project.`
      : `At least one ${last} must be assigned to the project.`;
    throw new Error(msg);
  }
}

async function checkNameUniqueness(name, excludeProjectId = null) {
  const projects = await db.collection("projects").get();
  const lowerName = name.toLowerCase();

  const isTaken = projects.docs.some(doc => {
    const data = doc.data();
    return (
      (!excludeProjectId || doc.id !== excludeProjectId) &&
      data.name.toLowerCase() === lowerName
    );
  });

  if (isTaken) {
    throw new Error("Project name already exists. Please choose another name.");
  }
}

async function createProject(name, description, devs, scrumMasters, productManagers, owner) {
  validateProjectInput(name, description, devs, scrumMasters, productManagers);
  await checkNameUniqueness(name);

  const projectId = db.collection("projects").doc().id;

  const newProject = {
    id: projectId,
    name,
    description,
    devs,
    scrumMasters,
    productManagers,
    owner,
    createdAt: new Date(),
  };

  try {
    await db.collection("projects").doc(projectId).set(newProject);
    return newProject;
  } catch (error) {
    throw new Error("Error saving project to database: " + error.message);
  }
}

async function updateProject(projectId, name, description, devs, scrumMasters, productManagers) {
  if (!projectId) throw new Error("Project ID is required");

  validateProjectInput(name, description, devs, scrumMasters, productManagers);
  await checkNameUniqueness(name, projectId);

  const projectRef = db.collection("projects").doc(projectId);
  const projectSnap = await projectRef.get();

  if (!projectSnap.exists) throw new Error("Project not found.");

  const existingData = projectSnap.data();

  const updatedProject = {
    id: projectId,
    name,
    description,
    devs,
    scrumMasters,
    productManagers,
    owner: existingData.owner,
    createdAt: existingData.createdAt || new Date(),
    updatedAt: new Date(),
  };

  try {
    await projectRef.set(updatedProject, { merge: true });
    return updatedProject;
  } catch (error) {
    throw new Error("Error updating project: " + error.message);
  }
}


async function getUserProjects(userId) {
  const projectsRef = db.collection('projects');
  const projectsSnapshot = await projectsRef.get();

  if (projectsSnapshot.empty) {
    return { status: 404, message: "No projects found!" };
  }

  const userProjects = [];

  projectsSnapshot.forEach((doc) => {
    const projectData = doc.data();
    const { devs, productManagers, scrumMasters, owner } = projectData;

    let userRole = '';

   if (scrumMasters.includes(userId)) {
      userRole = 'scrumMasters';
  } else if (devs.includes(userId)) {
      userRole = 'devs';
  } else if (productManagers.includes(userId)) {
     userRole = 'productManagers';
  } else if (owner === userId) {
    userRole = 'owner';
  }

    // If the user has a role (owner, dev, product manager, or scrum master), add the project to the list
    if (userRole !== '') {
      userProjects.push({
        projectId: doc.id,
        projectName: projectData.name,
        projectDescription: projectData.description,
        userRole: userRole,
      });
    }
  });

  return userProjects;
}

async function getProject(projectName, userId) {
  const projectsRef = db.collection('projects');
  const querySnapshot = await projectsRef.where('name', '==', projectName).get();

  if (querySnapshot.empty) {
    return { status: 404, message: "No project found!" };
  }

  const projectDoc = querySnapshot.docs[0];
  const projectData = projectDoc.data();

  const enrichedProject = await replaceUserIdsWithData(projectData);

  return { status: 200, project: enrichedProject };
}


async function replaceUserIdsWithData(projectData) {
  if (projectData.devs && projectData.devs.length > 0) {
    projectData.devs = await Promise.all(
      projectData.devs.map(async (userId) => {
        return await userService.getUser(userId);
      })
    );
  }

  if (projectData.productManagers && projectData.productManagers.length > 0) {
    projectData.productManagers = await Promise.all(
      projectData.productManagers.map(async (userId) => {
        return await userService.getUser(userId);
      })
    );
  }

  if (projectData.scrumMasters && projectData.scrumMasters.length > 0) {
    projectData.scrumMasters = await Promise.all(
      projectData.scrumMasters.map(async (userId) => {
        return await userService.getUser(userId);
      })
    );
  }

  return projectData;
}

module.exports = { createProject, getUserProjects, getProject, updateProject};