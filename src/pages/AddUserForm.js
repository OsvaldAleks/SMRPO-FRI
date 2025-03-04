import React, { useState } from "react";
import "./App.css";

const AddUserForm = () => {
  const [user, setUser] = useState({ firstName: "",secondName:"", email: "",userName:"",password: "", role: ""});
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user.firstName || !user.secondName || !user.email || !user.userName || !user.password|| !user.role) {
      setError("All fields are required");
      return;
    }
    console.log("User Added:", user);
    setUser({ firstName: "", email: "", password:"", role: "" });
    setError("");
  };
  const openNewWindow = () => {
    window.open("", "_blank", "width=600,height=400");
  };

  return (
    <div className="form-container">
      <h1>Add User</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <h2>
          Personal information
        </h2>
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
          type="Text"
          name="Username"
          placeholder="Enter Username"
          value={user.userName}
          onChange={handleChange}
        />
         <input
          type="password"
          name="pasaword"
          placeholder="Enter User Password"
          value={user.password}
          onChange={handleChange}
        />
       
       <h2>
         User Role 
        </h2>

        <input 
          type="checkbox" 
          checked={isChecked} 
          onChange={() => setIsChecked(!isChecked)} 
        />
        <span style={{ color: isChecked ? "green" : "white", marginLeft: "8px" }}>
          Accept Terms and Conditions
        </span>

        <button type="submit">Add User</button>
      </form>
    </div>
  );
};

export default AddUserForm;
