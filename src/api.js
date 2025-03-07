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

export const getUserProjects = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/getUserProjects/${userId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (response.ok) {
      return response.json();
    } else {
      const errorData = await response.json();
      return { message: errorData.message || "Failed to fetch projects", error: true };
    }
  } catch (error) {
    return { message: "Network error", error };
  }
};

export const getProject = async (projectName, userId) => {
  if (!projectName || !userId) {
    throw new Error("Project name and user ID are required.");
  }

  try {
    const response = await fetch(`${API_URL}/getProject/${projectName}?userId=${userId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch project");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching project:", error);
    throw new Error(error.message || "Network error");
  }
};
