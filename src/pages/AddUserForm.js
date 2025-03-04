import React, { useState } from "react";

const AddUserForm = () => {
  const [user, setUser] = useState({
    firstName: "",
    secondName: "",
    email: "",
    userName: "",
    password: "",
    role: "User", // Default role is "User"
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;

    setUser((prevUser) => ({
      ...prevUser,
      [name]: type === "checkbox" ? (checked ? "Manager" : "User") : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user.firstName || !user.secondName || !user.email || !user.userName || !user.password) {
      setError("All fields are required");
      return;
    }
    console.log("User Added:", user);
    setUser({
      firstName: "",
      secondName: "",
      email: "",
      userName: "",
      password: "",
      role: "User", // Reset to default after submission
    });
    setError("");
  };

  return (
    <div className="form-container">
      <h1>Add User</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <h2>Personal Information</h2>
        
        <input
          type="text"
          name="firstName"
          placeholder="Enter First Name"
          value={user.firstName}
          onChange={handleChange}
        />
        <input
          type="text"
          name="secondName"
          placeholder="Enter Second Name"
          value={user.secondName}
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Enter Email"
          value={user.email}
          onChange={handleChange}
        />
        <input
          type="text"
          name="userName"
          placeholder="Enter Username"
          value={user.userName}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Enter User Password"
          value={user.password}
          onChange={handleChange}
        />
       
        <h2>User Role</h2>
        <label>
          <input
            type="checkbox"
            name="role"
            checked={user.role === "Manager"}
            onChange={handleChange}
          />
          Register as Manager
        </label>
        <p>Selected Role: <strong>{user.role}</strong></p>

        <button type="submit">Add User</button>
      </form>
    </div>
  );
};

export default AddUserForm;
