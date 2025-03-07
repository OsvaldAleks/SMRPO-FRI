const { db } = require("../firebase");
const userService = require('./userService');

async function createProject(name, devs, scrumMasters, productManagers) {
  if (!name || !devs || !scrumMasters || !productManagers) {
    throw new Error("All fields are required");
  }

  let valid = true;
  let err = "At least one";
  
  if (devs.length === 0) {
    valid = false;
    err += " developer";
  }
  
  if (scrumMasters.length === 0) {
    valid = false;
    if (!err.endsWith("one")) {
      err += ",";
    }
    err += " scrum master";
  }
  
  if (productManagers.length === 0) {
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

  const existingProject = await db.collection("projects").where("name", "==", name).get();
  if (!existingProject.empty) {
    throw new Error("Project name already exists. Please choose another name.");
  }
  throw new Error("At least one developer must be assigned to the project.");

  const projectId = db.collection("projects").doc().id;

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

async function getUserProjects(userId) {
  const projectsRef = db.collection('projects');
  const projectsSnapshot = await projectsRef.get();

  if (projectsSnapshot.empty) {
    return { status: 404, message: "No projects found!" };
  }

  const userProjects = [];

  projectsSnapshot.forEach((doc) => {
    const projectData = doc.data();
    const { devs, productManagers, scrumMasters } = projectData;
    
    let userRole = '';
    
    // Determine the user's role
    if (devs.includes(userId)) {
      userRole = 'devs';
    } else if (productManagers.includes(userId)) {
      userRole = 'productManagers';

    } else if (scrumMasters.includes(userId)) {
      userRole = 'scrumMasters';

    }
      if (userRole != '') {
        userProjects.push({
          projectId: doc.id,
          projectName: projectData.name,
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