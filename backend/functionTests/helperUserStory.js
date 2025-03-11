const fetch = require("node-fetch");

async function addTestUserStory() {
  const API_URL = "http://localhost:5000/userStories/";

  const userStoryData = {
    projectId: "00BoSz9CQnj9aBNE0uBD", // link z projektom
    sprintId: null, // prazno na zacetki
    name: "Test User Story",
    description: "This is a test user story.",
    acceptanceCriteria: [
      "User must be able to log in.",
      "System should validate the password.",
      "Session should be maintained for 30 minutes."
    ],
    priority: "High",
    businessValue: 50
  };

  try {
    console.log("Sending Request:", JSON.stringify(userStoryData, null, 2)); // Debugging
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userStoryData)
    });

    const data = await response.json();
    console.log("Response:", data);
  } catch (error) {
    console.error("Error:", error);
  }
}

addTestUserStory();
