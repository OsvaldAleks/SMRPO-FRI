const { db } = require("../firebase");
const userService = require('./userService');

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
      console.log('isMan')

    } else if (scrumMasters.includes(userId)) {
      userRole = 'scrumMasters';
      console.log('MAster')

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