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
