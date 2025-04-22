import { getDatabase, ref, update, serverTimestamp } from "firebase/database";



const API_URL = process.env.REACT_APP_BACKEND_ADDRESS || 'http://localhost:5001';
console.log("Backend Address:", process.env.REACT_APP_BACKEND_ADDRESS);
console.log("API URL:", API_URL);

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
      result = JSON.parse(responseBody);
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

export const updateProject = async (projectData) => {
  try {
    const response = await fetch(`${API_URL}/projects/${projectData.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(projectData),
    });

    const responseBody = await response.text();
    let result;
    try {
      result = JSON.parse(responseBody);
    } catch (error) {
      throw new Error("Invalid JSON response from server");
    }

    if (!response.ok) {
      throw new Error(result.error || "Failed to update project");
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
    const response = await fetch(`${API_URL}/sprints/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sprintData),
    });

    const responseBody = await response.text();
    let result;
    try {
      result = JSON.parse(responseBody);
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

export const validateSprintDates = async (projectId, newStartDate, newEndDate, sprintId) => {
  try {
    const response = await fetch(`${API_URL}/sprints/validateDates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        newStartDate,
        newEndDate,
        sprintId
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Error validating sprint dates");
    }

    return result; // Expected to return { success: true } or { success: false, message: "Overlapping sprint exists" }
  } catch (error) {
    console.error("Error validating sprint dates:", error);
    return { success: false, message: error.message || "Network error" };
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
      const errorMessage = result.message || "Failed to create user story";
      throw new Error(errorMessage);
    }

    return result;
  } catch (error) {
    console.error("Network error:", error.message);
    throw error;
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

export const assignUserStoryToSprint = async (storyId, sprintId) => {
  try {
    const response = await fetch(`${API_URL}/userStories/${storyId}/assignSprint`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sprintId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to assign user story to sprint");
    }

    return response.json();
  } catch (error) {
    console.error("Error assigning user story to sprint:", error);
    throw error;
  }
};

export const getUserStatus = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/user/status/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      return { status: 'offline' };
    }

    const text = await response.text();
    if (!text) {
      return { status: 'offline' };
    }

    return JSON.parse(text);
  } catch (error) {
    console.error('Error fetching user status:', error);
    return { status: 'offline' }; // Default fallback
  }
};

export const updateUserStatus = async (userId, status) => {
  if (!userId) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/users/${userId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: status,
        last_online: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to update user status:", errorData);
      throw new Error(errorData.message || "Failed to update status");
    }

    return response.json();
  } catch (error) {
    console.error("Network error updating user status:", error);
    return { error: true, message: error.message || "Network error" };
  }
};

export const getUserStory = async (storyId) => {
  try {
    const response = await fetch(`${API_URL}/userStories/${storyId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (response.ok) {
      return response.json();
    } else {
      const errorData = await response.json();
      return { message: errorData.message || "Failed to fetch user status", error: true };
    }
  } catch (error) {
    return { message: "Network error", error };
  }
};

export const updateStoryPoints = async (storyId, value) => {
  try {
    const response = await fetch(`${API_URL}/userStories/${storyId}/setStoryPoints`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        value: value,
      }),
    });
    if (response.ok) {
      return response.json();
    } else {
      const errorData = await response.json();
      return { message: errorData.message || "Failed to fetch user status", error: true };
    }
  } catch (error) {
    return { message: "Network error", error };
  }
};

export const addSubtaskToUserStory = async (storyId, subtaskData) => {
  try {
    const response = await fetch(`${API_URL}/userStories/${storyId}/addSubtask`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subtaskData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to add subtask");
    }
    return response.json();
  } catch (error) {
    console.error("Error adding subtask:", error);
    throw error;
  }
};


export const claimSubtask = async (storyId, userId, subtaskIndex) => {
  try {
    const subtaskData = {
      userId,
      subtaskIndex,
    };
    const response = await fetch(`${API_URL}/userStories/${storyId}/claimSubtask/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subtaskData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update subtask");
    }
    return response.json();
  } catch (error) {
    console.error("Error updating subtask:", error);
    throw error;
  }
};

export const markSubtaskAsDone = async (storyId, subtaskIndex) => {
  try {
    const subtaskData = {
      subtaskIndex,
    };
    const response = await fetch(`${API_URL}/userStories/${storyId}/completeSubtask`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subtaskData),
    });

    const responseBody = await response.text();
    let result;
    try {
      result = JSON.parse(responseBody);
    } catch (error) {
      throw new Error("Invalid JSON response from server");
    }

    if (!response.ok) {
      throw new Error(result.message || "Failed to mark subtask as done");
    }

    return result;
  } catch (error) {
    console.error("Network error:", error.message);
    throw error;
  }
};

export const evaluateUserStory = async (storyId, isAccepted, comment, userId) => {
  try {
    const response = await fetch(`${API_URL}/userStories/${storyId}/evaluate`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        isAccepted,
        comment,
        userId,        // <-- tukaj le userId
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to evaluate user story");
    }
    return data;
  } catch (error) {
    console.error("Error evaluating user story:", error);
    throw error;
  }
};

export const deleteUserStory = async (storyId) => {
  try {
    const response = await fetch(`${API_URL}/userStories/${storyId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to delete user story");
    }
    const res = await response.json();
    return res;
  } catch (error) {
    console.error("Error deleting user story:", error);
    throw error;
  }
}

export const updateUserStory = async (storyId, story) => {
  try {
    const response = await fetch(`${API_URL}/userStories/${storyId}/update`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(story),
    });

    const responseBody = await response.text();
    let result;
    try {
      result = JSON.parse(responseBody);
    } catch (error) {
      result = { message: responseBody };
    }

    if (!response.ok) {
      const errorMessage = result.message || result || "Failed to update user story";
      throw new Error(errorMessage);
    }

    return result;
  } catch (error) {
    console.error("Error updating user story:", error.message);
    throw error;
  }
};

export const deleteSprint = async (sprintId) => {
  try {
    const response = await fetch(`${API_URL}/sprints/${sprintId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to delete sprint");
    }
    const res = await response.json();
    return res;
  } catch (error) {
    console.error("Error deleting sprint:", error);
    throw error;
  }
};

export const updateSprint = async (sprintId, sprintData) => {
  try {
    const response = await fetch(`${API_URL}/sprints/${sprintId}/update`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sprintData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to update sprint");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating sprint:", error);
  }
}

// Update user information
export const updateUserInfo = async (userId, userData) => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update user information");
    }

    return response.json();
  } catch (error) {
    console.error("Error updating user info:", error);
    throw new Error(error.message || "Network error");
  }
};

// Update user password
export const updateUserPassword = async (userId, newPassword) => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}/password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update password");
    }

    return response.json();
  } catch (error) {
    console.error("Error updating password:", error);
    throw new Error(error.message || "Network error");
  }
};

// Update user information
export const deleteUser = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete user");
    }

    return response.json();
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error(error.message || "Network error");
  }
};

export const updateSubtask = async (storyId, updatedData) => {
  try {
    const response = await fetch(`${API_URL}/userStories/${storyId}/updateSubtask`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update subtask");
    }

    return response.json();
  } catch (error) {
    console.error("Error updating subtask:", error);
    throw error;
  }
};

export const deleteSubtask = async (storyId, subtaskIndex) => {
  try {
    const response = await fetch(`${API_URL}/userStories/${storyId}/subtask/${subtaskIndex}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete subtask");
    }

    return response.json();
  } catch (error) {
    console.error("API error deleting subtask:", error);
    throw error;
  }
};

// Start time recording for a subtask
export const startTimeRecording = async (storyId, subtaskId) => {
  try {
    const response = await fetch(`${API_URL}/userStories/${storyId}/subtasks/${subtaskId}/start-recording`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to start time recording');
    }

    return response.json();
  } catch (error) {
    console.error('Error starting time recording:', error);
    throw error;
  }
};

// Stop time recording for a subtask
export const stopTimeRecording = async (storyId, subtaskId, userId) => {
  try {
    const response = await fetch(`${API_URL}/userStories/${storyId}/subtasks/${subtaskId}/stop-recording`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to stop time recording');
    }

    return response.json();
  } catch (error) {
    console.error('Error stopping time recording:', error);
    throw error;
  }
};

// after deleting subtasks - move the user story to "To Do" status
export const updateUserStoryStatus = async (storyId, newStatus) => {
  try {
    const response = await fetch(`${API_URL}/userStories/${storyId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newStatus }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update user story status");
    }

    return data;
  } catch (error) {
    console.error("Error updating user story status:", error);
    throw error;
  }
};

export const getProjectDocumentation = async (projectId) => {
  const res = await fetch(`${API_URL}/projects/${projectId}/documentation`);
  const text = await res.text(); // poskusi najprej tekst
  console.log("Raw response:", text);
  try {
    const data = JSON.parse(text);
    return data.documentation;
  } catch (e) {
    console.error("Failed to parse JSON:", e);
    throw new Error("Invalid response from server");
  }
};

export const updateProjectDocumentation = async (projectId, documentation) => {
  const res = await fetch(`${API_URL}/projects/${projectId}/documentation`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ documentation }),
  });
  const data = await res.json();
  return data;
};

export const getWallPosts = async (projectId) => {
  const res = await fetch(`${API_URL}/projects/${projectId}/wall`);
  if (!res.ok) throw new Error("Failed to load wall posts");
  return res.json();
};

export const addWallPost = async (projectId, postData) => {
  const res = await fetch(`${API_URL}/projects/${projectId}/wall`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(postData),
  });
  if (!res.ok) throw new Error("Failed to add wall post");
  return res.json();
};

export const addWallComment = async (postId, commentData) => {
  const res = await fetch(`${API_URL}/projects/wall/${postId}/comment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(commentData),
  });
  if (!res.ok) throw new Error("Failed to add wall comment");
  return res.json();
};

export const deleteWallPost = async (postId) => {
  const res = await fetch(`${API_URL}/projects/wall/${postId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to delete post");
  return res.json();
};

export const deleteWallComment = async (postId, commentId) => {
  const res = await fetch(`${API_URL}/projects/wall/${postId}/comment/${commentId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to delete comment");
  return res.json();
};

// Get all stories with subtasks that the user has worked on
export const getUserStoriesWithWorkTimes = async (userId) => {
  //console.log(userId);
  try {
    const response = await fetch(`${API_URL}/userStories/user/${userId}/worktimes`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch user work times');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching user work times:', error);
    throw error;
  }
};

// Update work time for a specific subtask
export const updateWorkTime = async (storyId, subtaskIndex, workTimeIndex, updates) => {
  try {
    const response = await fetch(`${API_URL}/userStories/${storyId}/subtasks/${subtaskIndex}/worktimes/${workTimeIndex}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update work time');
    }
    return response.json();
  } catch (error) {
    console.error('Error updating work time:', error);
    throw error;
  }
};

export const updatePredictedTime = async (storyId, subtaskIndex, predictedTime) => {
  try {
    const response = await fetch(`${API_URL}/userStories/${storyId}/subtasks/${subtaskIndex}/predictedTime`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ predictedTime })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update predicted time');
    }
    return response.json();
  } catch (error) {
    console.error('Error updating predicted time:', error);
    throw error;
  }
};