import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { getUser, getUsers, updateUserInfo, updateUserPassword } from "../api";
import zxcvbn from "zxcvbn";
import Button from '../components/Button';
import Input from '../components/Input';

const top100VulnerablePasswords = [
  "password1234", "123456789012", "qwertyuiopas", "letmein12345", "welcome12345", "adminpassword", "football1234", "baseball1234", "iloveyou1234", "sunshine1234",
  "monkey123456", "shadow123456", "master123456", "superman1234", "harley123456", "jennifer1234", "jordan123456", "thomas123456", "michelle1234", "ginger123456",
  "buster123456", "hunter123456", "soccer123456", "summer123456", "ashley123456", "bailey123456", "passw0rd1234", "charlie12345", "daniel123456", "matthew12345",
  "andrew123456", "access123456", "tigger123456", "joshua123456", "pepper123456", "jessica12345", "zxcvbnm12345", "qwerty123456", "maggie123456", "computer1234",
  "amanda123456", "nicole123456", "chelsea12345", "biteme123456", "ginger123456", "princess1234", "welcome12345", "password123", "adminadmin123", "letmein123456",
  "1234567890ab", "1234567890cd", "1234567890ef", "1234567890gh", "1234567890ij", "1234567890kl", "1234567890mn", "1234567890op", "1234567890qr", "1234567890st",
  "1234567890uv", "1234567890wx", "1234567890yz", "qwertyuiop12", "asdfghjkl123", "zxcvbnm12345", "password123!", "password123@", "password123#", "password123$",
  "password123%", "password123^", "password123&", "password123*", "password123(", "password123)", "password123-", "password123_", "password123=", "password123+",
  "password123[", "password123]", "password123{", "password123}", "password123|", "password123;", "password123:", "password123'", "password123<", "password123>",
  "password123,", "password123.", "password123?", "password123/", "password123`", "password123~"
];

const EditAccount = () => {
  // Existing password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordStrengthLabel, setPasswordStrengthLabel] = useState("");
  const [touchedFields, setTouchedFields] = useState({ 
    newPassword: false, 
    confirmNewPassword: false,
    username: false
  });
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [previousOnline, setPreviousOnline] = useState(null);

  // New states for user info
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [editMode, setEditMode] = useState(false);

  // Password visibility toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const auth = getAuth();
  const navigate = useNavigate();

  const isPasswordVulnerable = (password) => {
    return top100VulnerablePasswords.includes(password.toLowerCase());
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        try {
          const userData = await getUser(user.uid);
          if (userData) {
            setPreviousOnline(userData.previous_online || "No data available");
            setName(userData.name || "");
            setSurname(userData.surname || "");
            setUsername(userData.username || "");
          }
          // Fetch all users for username validation
          const usersData = await getUsers();
          setAllUsers(usersData);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        navigate("/login");
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  const handleFieldFocus = (field) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  };

  const validateUsername = async (value) => {
    if (!value) {
      setUsernameError("Username is required");
      return false;
    }
    if (value.length < 3) {
      setUsernameError("Username must be at least 3 characters");
      return false;
    }
    
    // Convert to lowercase for comparison
    const normalizedValue = value.toLowerCase();
    const normalizedCurrent = username.toLowerCase();
    
    // Only check uniqueness if username changed (case-insensitive)
    if (normalizedValue !== normalizedCurrent) {
      const isTaken = allUsers.some(u => 
        u.username.toLowerCase() === normalizedValue && 
        u.id !== user?.uid
      );
      if (isTaken) {
        setUsernameError("Username is already taken");
        return false;
      }
    }
    
    setUsernameError("");
    return true;
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value;
  setUsername(value);
  // Always validate when in edit mode
  if (editMode) {
    validateUsername(value);
  }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!user) return;

    if (newPassword !== confirmNewPassword) {
      setError("New password and confirm password do not match.");
      return;
    }
    if (newPassword.length < 12 || newPassword.length > 128) {
      setError("Password must be between 12 and 128 characters.");
      return;
    }
    if (passwordStrength < 1) {
      setError("Password is too weak. Please choose a stronger password.");
      return;
    }
    if (isPasswordVulnerable(newPassword)) {
      setError("This password is too common.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await updateUserPassword(user.uid, newPassword);
      setSuccessMessage("Password updated successfully!");
      setNewPassword("");
      setConfirmNewPassword("");
      setCurrentPassword("");
    } catch (err) {
      console.error(err);
      setError(err.message || "Error updating password.");
    } finally {
      setLoading(false);
    }
  };

  const handleUserInfoUpdate = async (e) => {
    e.preventDefault();
    if (!user) return;
  
    const isUsernameValid = await validateUsername(username);
    if (!isUsernameValid) return;
  
    setLoading(true);
    setError("");
  
    try {
      await updateUserInfo(user.uid, { name, surname, username });
      setSuccessMessage("Personal information updated successfully!");
      setEditMode(false);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error updating personal information.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === "No data available") return dateString;
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    return `${day}. ${month}. ${year}. (${hours}:${minutes})`;
  };

  const handlePasswordChangeInput = (e) => {
    setNewPassword(e.target.value);
    setSuccessMessage("");
    const result = zxcvbn(e.target.value);
    setPasswordStrength(result.score);
    setPasswordStrengthLabel(result.feedback.suggestions.join(" "));
  };

  // Update the cancel button handler to reset all fields
const handleCancelEdit = () => {
  // Reset all fields to their original values
  if (user) {
    getUser(user.uid).then(userData => {
      if (userData) {
        setName(userData.name || "");
        setSurname(userData.surname || "");
        setUsername(userData.username || "");
        setUsernameError(""); // Clear any errors
      }
    });
  }
  setEditMode(false);
};

  if (authLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="center--box">
      <h1>Edit Account</h1>
      
      {user && (
        <div className="block--element">
          <p>Email: <b>{user.email}</b></p>
          <p>Last Login: <b>{formatDate(previousOnline)}</b></p>
        </div>
      )}

      {/* Personal Information Section */}
      <form onSubmit={handleUserInfoUpdate} className="block--element">
        <h2>Personal Information</h2>
        
        {editMode ? (
          <>
            <div className="block--element">
              <label>First Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="block--element">
              <label>Last Name</label>
              <Input
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                required
              />
            </div>
            
            <div className="block--element">
              <label>Username</label>
              <Input
                value={username}
                onChange={handleUsernameChange}
                onBlur={() => handleFieldFocus("username")}
                required
              />
              {usernameError && <p style={{ color: "red" }}>{usernameError}</p>}
            </div>
            
            <div className="flex-row gap--8">
              <Button 
                type="submit" 
                variant="primary" 
                disabled={loading || !!usernameError}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={handleCancelEdit}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="block--element">
              <p><b>Name:</b> {name} {surname}</p>
              <p><b>Username:</b> {username}</p>
            </div>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => setEditMode(true)}
            >
              Edit Personal Information
            </Button>
          </>
        )}
      </form>

      {/* Password Change Section */}
      <form onSubmit={handlePasswordChange} className="block--element">
        <h2>Change Password</h2>
        
        <div className="block--element">
          <label>Current Password</label>
          <Input
            type={showCurrentPassword ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <label style={{ marginTop: "8px", display: "block" }}>
            <input
              type="checkbox"
              checked={showCurrentPassword}
              onChange={() => setShowCurrentPassword(!showCurrentPassword)}
            />
            Show Current Password
          </label>
        </div>
        
        <div className="block--element">
          <label>New Password</label>
          <Input
            type={showNewPassword ? "text" : "password"}
            value={newPassword}
            onChange={handlePasswordChangeInput}
            onFocus={() => handleFieldFocus("newPassword")}
            required
          />
          <label style={{ marginTop: "8px", display: "block" }}>
            <input
              type="checkbox"
              checked={showNewPassword}
              onChange={() => setShowNewPassword(!showNewPassword)}
            />
            Show New Password
          </label>
        </div>
        
        <div className="block--element">
          <label>Confirm New Password</label>
          <Input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            onFocus={() => handleFieldFocus("confirmNewPassword")}
            required
          />
          <label style={{ marginTop: "8px", display: "block" }}>
            <input
              type="checkbox"
              checked={showConfirmPassword}
              onChange={() => setShowConfirmPassword(!showConfirmPassword)}
            />
            Show Confirm Password
          </label>
        </div>
        
        <div className="block--element">
          {touchedFields.newPassword && newPassword.length < 12 && (
            <p style={{ color: "red" }}>Password must be at least 12 characters long.</p>
          )}
          {touchedFields.newPassword && newPassword.length > 128 && (
            <p style={{ color: "red" }}>Password must be no more than 128 characters.</p>
          )}
          {touchedFields.newPassword && (
            <>
              <p>Password Strength: {["Weak", "Fair", "Good", "Strong", "Very Strong"][passwordStrength]}</p>
              <p>{passwordStrengthLabel}</p>
            </>
          )}
          {touchedFields.confirmNewPassword && newPassword !== confirmNewPassword && (
            <p style={{ color: "red" }}>Passwords do not match.</p>
          )}
        </div>
        
        <Button 
          type="submit" 
          variant="primary" 
          disabled={loading}
          className="btn--block"
        >
          {loading ? "Updating..." : "Change Password"}
        </Button>
      </form>
      
      {error && <p style={{ color: "red" }}>{error}</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
    </div>
  );
};

export default EditAccount;