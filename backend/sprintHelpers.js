const { db } = require("./firebase");

// Add a Test Sprint with Validations
const addSprint = async () => {
  try {
    const sprintData = {
      name: "Test Sprint s prekrivanjem",
      start_date: "2025-04-14",
      end_date: "2025-04-01",
      velocity: 20, // Ensure velocity is required
    };

    // Validate required fields
    if (!sprintData.name || !sprintData.start_date || !sprintData.end_date || sprintData.velocity === undefined) {
      console.error("Error: All fields must be provided!");
      return;
    }

    // Validate start and end date order
    const startDate = new Date(sprintData.start_date);
    const endDate = new Date(sprintData.end_date);

    if (isNaN(startDate) || isNaN(endDate)) {
      console.error("Error: Invalid date format!");
      return;
    }

    if (startDate >= endDate) {
      console.error("Error: Start date must be before end date!");
      return;
    }

    // Validate sprint velocity range
    if (sprintData.velocity < 1 || sprintData.velocity > 100) {
      console.error("Error: Sprint velocity must be between 1 and 100!");
      return;
    }

    // Check for overlapping sprints
    const overlappingSprints = await db.collection("sprints")
      .where("start_date", "<=", sprintData.end_date)
      .where("end_date", ">=", sprintData.start_date)
      .get();

    if (!overlappingSprints.empty) {
      console.error("Error: Sprint dates overlap with an existing sprint!");
      return;
    }

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

// Run Test Sprint Function
addSprint();
// getSprints(); // Uncomment to fetch all sprints

module.exports = { addSprint, getSprints };
