const { db } = require("./firebase");

// Add a Test Sprint
const addSprint = async () => {
  try {
    const sprintData = {
      name: "Test Sprint",
      start_date: "2025-04-01",
      end_date: "2025-04-14",
      velocity: 20,
    };

    // Generate unique sprint ID
    const sprintRef = db.collection("sprints").doc();
    sprintData.id = sprintRef.id; // Assign the auto-generated ID

    // Store in Firestore
    await sprintRef.set(sprintData);

    console.log("Test Sprint Added:", sprintData);
  } catch (error) {
    console.error("Error adding test sprint:", error);
  }
};

// Get All Sprints
const getSprints = async () => {
  try {
    const sprintSnapshot = await db.collection("sprints").get();
    const sprints = sprintSnapshot.docs.map(doc => doc.data());

    console.log("All Sprints:", sprints);
  } catch (error) {
    console.error("Error fetching sprints:", error);
  }
};

//addSprint();
getSprints();

module.exports = { addSprint, getSprints };
