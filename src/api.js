const API_URL = "http://localhost:5000"; // Your backend URL

// Register a new user via API
export const registerUser = async (userData) => {
  try {
      const response = await fetch(`${API_URL}/users/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
      });

      return response.json();
  } catch (error) {
      return { message: "Network error", error };
  }
};

export const getUser = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (response.ok) {
      return response.json();
    } else {
      const errorData = await response.json();
      return { message: errorData.message || "Failed to fetch user", error: true };
    }
  } catch (error) {
    return { message: "Network error", error };
  }
};

export const getUsers = async () => {
  try {
    const response = await fetch(`${API_URL}/users`, {
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
  console.log("Sending project data:", projectData); // Debugging log

  try {
    const response = await fetch(`${API_URL}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(projectData),
    });

    const responseBody = await response.text(); // Read raw response first
    console.log("Raw response from server:", responseBody);

    let result;
    try {
      result = JSON.parse(responseBody); // Attempt to parse JSON
    } catch (error) {
      throw new Error("Invalid JSON response from server");
    }

    if (!response.ok) {
      throw new Error(result.error || "Failed to create project");
    }

    console.log("Response from server:", result);
    return result;
  } catch (error) {
    console.error("Network error:", error.message);
    return { error: true, message: error.message || "Network error" };
  }
};


export const getUserProjects = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/projects/user/${userId}`, { method: "GET", headers: { "Content-Type": "application/json" } });
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
