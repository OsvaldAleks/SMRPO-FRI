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
    console.log(userId, devs, productManagers, scrumMasters);
    
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

module.exports = { createProject, getUserProjects };