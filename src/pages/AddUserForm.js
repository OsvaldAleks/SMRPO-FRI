import React, { useState } from "react";
import { registerUser } from "../api"; // Import API function

const AddUserForm = () => {
  const [user, setUser] = useState({
    name: "",
    surname: "",
    email: "",
    username: "",
    password: "",
    system_rights: "User", // Default role
    status: "active", // Default status
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend validation
    if (!user.name || !user.surname || !user.email || !user.username || !user.password) {
      setError("All fields are required");
      return;
    }

    setError("");
    setSuccess("");

    // Send user data to backend API
    const response = await registerUser(user);

    if (response.error) {
      setError(response.message);
    } else {
      setSuccess(response.message);
      // Reset form after successful registration
      setUser({
        name: "",
        surname: "",
        email: "",
        username: "",
        password: "",
        system_rights: "User",
        status: "active",
      });
    }
  };

  return (
    <div className="form-container">
      <h1>Add User</h1>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
      <form onSubmit={handleSubmit}>
        <h2>Personal Information</h2>

        <input type="text" name="name" placeholder="Enter First Name" value={user.name} onChange={handleChange} required />
        <input type="text" name="surname" placeholder="Enter Last Name" value={user.surname} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Enter Email" value={user.email} onChange={handleChange} required />
        <input type="text" name="username" placeholder="Enter Username" value={user.username} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Enter Password" value={user.password} onChange={handleChange} required />

        <h2>User Role</h2>
        <select name="system_rights" value={user.system_rights} onChange={handleChange}>
          <option value="User">User</option>
          <option value="Manager">Manager</option>
          <option value="Admin">Admin</option>
        </select>

        <button type="submit">Add User</button>
      </form>
    </div>
  );
};

export default AddUserForm;
