const API_URL = "http://localhost:5001"; // Your backend URL

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
  try {
    const response = await fetch(`${API_URL}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(projectData),
    });

    const responseBody = await response.text();
    let result;
    try {
      result = JSON.parse(responseBody); // Attempt to parse JSON
    } catch (error) {
      throw new Error("Invalid JSON response from server");
    }

    if (!response.ok) {
      throw new Error(result.error || "Failed to create project");
    }

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
      console.log(response)
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
    const response = await fetch(`${API_URL}/projects/details/${projectName}?userId=${userId}`, {
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

export const createSprint = async (sprintData) => {
  try {
    console.log(sprintData)
    const response = await fetch(`${API_URL}/sprints/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sprintData),
    });

    const responseBody = await response.text();
    let result;
    try {
      result = JSON.parse(responseBody); // Attempt to parse JSON
    } catch (error) {
      throw new Error("Invalid JSON response from server");
    }

    if (!response.ok) {
      throw new Error(result.error || "Failed to create sprint");
    }

    return result;
  } catch (error) {
    console.error("Network error:", error.message);
    return { error: true, message: error.message || "Network error" };
  }
};

export const getSprintData = async (sprintId) => {
  if (!sprintId) {
    throw new Error("Project name and user ID are required.");
  }

  try {
    const response = await fetch(`${API_URL}/sprints/${sprintId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch sprint");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching project:", error);
    throw new Error(error.message || "Network error");
  }
};

export const getSprintsForProject = async (projectId) => {
  if (!projectId) {
    throw new Error("Project name and user ID are required.");
  }

  try {
    const response = await fetch(`${API_URL}/sprints/project/${projectId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch sprint");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching project:", error);
    throw new Error(error.message || "Network error");
  }
};

export const createUserStory = async (storyData) => {
  try {
    const response = await fetch(`${API_URL}/userStories/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(storyData),
    });

    const responseBody = await response.text();
    let result;
    try {
      result = JSON.parse(responseBody);
    } catch (error) {
      throw new Error("Invalid JSON response from server");
    }

    if (!response.ok) {
      throw new Error(result.error || "Failed to create user story");
    }

    return result;
  } catch (error) {
    console.error("Network error:", error.message);
    return { error: true, message: error.message || "Network error" };
  }
};

export const getStoriesForProject = async (projectId) => {
  if (!projectId) {
    throw new Error("Project ID is required.");
  }
  try {
    const response = await fetch(`${API_URL}/userStories/project/${projectId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch user stories");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching user stories:", error);
    throw new Error(error.message || "Network error");
  }
};
