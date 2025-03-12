import React, { useState } from "react";
import { registerUser } from "../api";
import { useNavigate } from 'react-router-dom';
import Button from "../components/Button";
import Input from "../components/Input";

const AddUserForm = () => {
  const [user, setUser] = useState({
    name: "",
    surname: "",
    email: "",
    username: "",
    password: "",
    status: "Active",
    system_rights: false,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Handle checkbox separately
    if (type === "checkbox") {
      setUser((prevUser) => ({
        ...prevUser,
        [name]: checked, 
      }));
    } else {
      setUser((prevUser) => ({
        ...prevUser,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend validation
    if (!user.name || !user.surname || !user.email || !user.username || !user.password) {
      setError("All fields are required");
      return;
    }

    // Prepare user data for API
    const userData = {
      ...user,
      system_rights: user.system_rights ? "Admin" : "User",
    };

    try {
      const response = await registerUser(userData);
      if (response.error) {
        setError(response.message || "Failed to register user");
      } else {
        console.log(response)
        setSuccess("User registered successfully!");
        setError("");
        setUser({
          name: "",
          surname: "",
          email: "",
          username: "",
          password: "",
          status: false,
          system_rights: false,
        });
      }
    } catch (err) {
      setError("An error occurred while registering the user");
    }
  };

  const goBackHandler = () => {
    navigate(-1);
  };

  return (
      <div className="center--box wide--box">
        <div className="form--title">
          <Button variant="goback" onClick={goBackHandler} />
          <h1>Add New User</h1>
          {error && <p className="p--alert">{error}</p>}
          {success && <p className="p--success">{success}</p>}
        </div>

        <form onSubmit={handleSubmit}>
          <div className={"block--element"}>
            <label className={"block--element"}>Username</label>
            <Input
              className={"block--element"}
              type="text"
              name="username"
              placeholder="Enter Username"
              value={user.username}
              onChange={handleChange}
            />
          </div>
          <div className={"block--element"}>
            <label className={"block--element"}>Email</label>
            <Input
              className={"block--element"}
              type="email"
              name="email"
              placeholder="Enter Email"
              value={user.email}
              onChange={handleChange}
            />
          </div>
          <div className={"grid--form"}>
            <div className="grid--form--leftdiv">
              <label className={"block--element"}>First Name</label>
              <Input
                className={"block--element"}
                type="text"
                name="name"
                placeholder="Enter First Name"
                value={user.name}
                onChange={handleChange}
              />
            </div>
            <div className="grid--form--rightdiv">
              <label className={"block--element"}>Last Name</label>
              <Input
                className={"block--element"}
                type="text"
                name="surname"
                placeholder="Enter Second Name"
                value={user.surname}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className={"block--element"}>
            <label className={"block--element"}>Password</label>
            <Input
              className={"block--element"}
              type="password"
              name="password"
              placeholder="Enter Password"
              value={user.password}
              onChange={handleChange}
            />
          </div>
          <div className="block--element">
            <label className={"block--element"}>Role</label>
            <span className={"checkbox-container"}>
              <Input
                className={"input--checkbox"}
                type="checkbox"
                name="system_rights"
                checked={user.system_rights}
                onChange={handleChange}
              />
              Register as {user.system_rights ? "Admin" : "User"}
            </span>
          </div>
          <Button className={"btn--block"} variant={"primery"} type="submit">
            Add User
          </Button>
        </form>
      </div>
  );
};

export default AddUserForm;