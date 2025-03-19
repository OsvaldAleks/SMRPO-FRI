import React, { useState } from "react";
import { registerUser } from "../api";
import { useNavigate } from "react-router-dom";
import zxcvbn from "zxcvbn";
import Button from "../components/Button";
import Input from "../components/Input";

const top100VulnerablePasswords = [
  "password1234", "123456789012", "qwertyuiopas", "letmein12345", "welcome12345",
  "adminpassword", "football1234", "baseball1234", "iloveyou1234", "sunshine1234",
  "monkey123456", "shadow123456", "master123456", "superman1234", "harley123456",
  "jennifer1234", "jordan123456", "thomas123456", "michelle1234", "ginger123456",
  "buster123456", "hunter123456", "soccer123456", "summer123456", "ashley123456",
  "bailey123456", "passw0rd1234", "charlie12345", "daniel123456", "matthew12345",
  "andrew123456", "access123456", "tigger123456", "joshua123456", "pepper123456",
  "jessica12345", "zxcvbnm12345", "qwerty123456", "maggie123456", "computer1234",
];

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
  const [passwordError, setPasswordError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordStrengthLabel, setPasswordStrengthLabel] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility
  const navigate = useNavigate();

  const isPasswordVulnerable = (password) => {
    return top100VulnerablePasswords.includes(password.toLowerCase());
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "password") {
      setUser((prevUser) => ({ ...prevUser, password: value }));
      validatePassword(value);
    } else if (type === "checkbox") {
      setUser((prevUser) => ({ ...prevUser, [name]: checked }));
    } else {
      setUser((prevUser) => ({ ...prevUser, [name]: value }));
    }
  };

  const validatePassword = (password) => {
    if (!password) {
      setPasswordStrength(0);
      setPasswordStrengthLabel("");
      setPasswordError("");
      return;
    }

    if (password.length < 12 || password.length > 128) {
      setPasswordError("Password must be between 12 and 128 characters.");
      setPasswordStrength(0);
      return;
    }

    const result = zxcvbn(password);
    setPasswordStrength(result.score);
    setPasswordStrengthLabel(result.feedback.suggestions.join(" "));

    if (result.score < 1) {
      setPasswordError("Password is too weak. Please choose a stronger password.");
      return;
    }

    if (isPasswordVulnerable(password)) {
      setPasswordError("This password is too common.");
      return;
    }

    setPasswordError(""); // Clear error if everything is fine
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous feedback before showing new feedback
    setError("");
    setSuccess("");
    setPasswordError("");

    // Validation checks
    if (!user.name || !user.surname || !user.email || !user.username || !user.password) {
      setError("All fields are required");
      return;
    }

    if (passwordError) {
      return;
    }

    const userData = {
      ...user,
      system_rights: user.system_rights ? "Admin" : "User",
    };

    try {
      const response = await registerUser(userData);

      if (response.user) {
        setSuccess(response.message); // Set success feedback

        // Reset form state and password-related states
        setUser({
          name: "",
          surname: "",
          email: "",
          username: "",
          password: "",
          status: "Active",
          system_rights: false,
        });

        setPasswordStrength(0); // Reset password strength
        setPasswordStrengthLabel(""); // Clear password strength label
        setPasswordError(""); // Clear any password error message
      } else {
        setError(response.message || response.error); // Set error feedback if any
        setSuccess(""); // Clear success message if error occurs
        console.log(response);
      }
    } catch (err) {
      setError("An error occurred while registering the user");
      setSuccess(""); // Clear success message in case of error
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
      </div>
      {error && <p className="p--alert">{error}</p>}
      {success && <p className="p--success">{success}</p>}

      <form onSubmit={handleSubmit}>
        <div className="block--element">
          <label className="block--element">Username</label>
          <Input
            className="block--element"
            type="text"
            name="username"
            placeholder="Enter Username"
            value={user.username}
            onChange={handleChange}
          />
        </div>
        <div className="block--element">
          <label className="block--element">Email</label>
          <Input
            className="block--element"
            type="email"
            name="email"
            placeholder="Enter Email"
            value={user.email}
            onChange={handleChange}
          />
        </div>
        <div className="grid--form">
          <div className="grid--form--leftdiv">
            <label className="block--element">First Name</label>
            <Input
              className="block--element"
              type="text"
              name="name"
              placeholder="Enter First Name"
              value={user.name}
              onChange={handleChange}
            />
          </div>
          <div className="grid--form--rightdiv">
            <label className="block--element">Last Name</label>
            <Input
              className="block--element"
              type="text"
              name="surname"
              placeholder="Enter Last Name"
              value={user.surname}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="block--element">
          <label className="block--element">Password</label>
          <Input
            className="block--element"
            type={showPassword ? "text" : "password"} // Toggle between text and password
            name="password"
            placeholder="Enter Password"
            value={user.password}
            onChange={handleChange}
          />
          {/* Show Password Toggle */}
          <div style={{ marginTop: "8px" }}>
            <label>
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
              />
              Show Password
            </label>
          </div>
          {passwordError && <p style={{ color: "red" }}>{passwordError}</p>}
          {passwordStrengthLabel && <p>{passwordStrengthLabel}</p>}
          <p>Password Strength: {["Weak", "Fair", "Good", "Strong", "Very Strong"][passwordStrength]}</p>
        </div>
        <div className="block--element">
          <label className="block--element">Role</label>
          <span className="checkbox-container">
            <Input
              className="input--checkbox"
              type="checkbox"
              name="system_rights"
              checked={user.system_rights}
              onChange={handleChange}
            />
            Register as Admin
          </span>
        </div>
        <Button className="btn--block" variant="primery" type="submit">
          Add User
        </Button>
      </form>
    </div>
  );
};

export default AddUserForm;