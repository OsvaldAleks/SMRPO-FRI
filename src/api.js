const API_URL = "http://localhost:5000"; // Your backend URL

//Register a new user via API
export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    return response.json();
  } catch (error) {
    return { message: "Network error", error };
  }
};

export const getUsers = async () => {
  try {
    const response = await fetch(`${API_URL}/getUsers`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (response.ok) {
      return response.json();
    } else {
      const errorData = await response.json();
      return { message: errorData.message || "Failed to fetch users", error: true };
    }
  } catch (error) {
    return { message: "Network error", error };
  }
};

export const createProject = async (projectData) => {
  console.log("Sending project data:", projectData); // Debugging line

  try {
    const response = await fetch(`${API_URL}/createProject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(projectData),
    });

    const result = await response.json();
    console.log("Response from server:", result); // Debugging line
    return result;
  } catch (error) {
    console.error("Network error:", error);
    return { message: "Network error", error };
  }
};
