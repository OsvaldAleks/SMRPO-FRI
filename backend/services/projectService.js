const { db } = require("../firebase");
const userService = require('./userService');

async function createProject(name, description, devs, scrumMasters, productManagers, owner) {
  // Validate required fields
  if (!name || !description) {
    throw new Error("All fields are required");
  }

  // Validate at least one developer, scrum master, and product manager
  let valid = true;
  let err = "At least one";

  if (devs.length === 0) {
    valid = false;
    err += " developer";
  }

  if (!scrumMasters) {
    valid = false;
    if (!err.endsWith("one")) {
      err += ",";
    }
    err += " scrum master";
  }

  if (!productManagers) {
    valid = false;
    if (!err.endsWith("one")) {
      err += ",";
    }
    err += " product manager";
  }

  if (!valid) {
    const lastCommaIndex = err.lastIndexOf(",");
    if (lastCommaIndex !== -1) {
      err = err.substring(0, lastCommaIndex) + " and" + err.substring(lastCommaIndex + 1);
    }

    throw new Error(err + " must be assigned to the project.");
  }

  // Check if project name already exists (case-insensitive)
  const existingProjects = await db.collection("projects").get();
  const isNameTaken = existingProjects.docs.some(
    (doc) => doc.data().name.toLowerCase() === name.toLowerCase()
  );

  if (isNameTaken) {
    throw new Error("Project name already exists. Please choose another name.");
  }

  // Generate a new project ID
  const projectId = db.collection("projects").doc().id;

  // Create the new project object
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
    // Save the project to the database
    await db.collection("projects").doc(projectId).set(newProject);
    return newProject;
  } catch (error) {
    throw new Error("Error saving project to database: " + error.message);
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

module.exports = { createProject, getUserProjects, getProject };