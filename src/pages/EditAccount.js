import React, { useState } from "react";
import { getAuth, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import zxcvbn from "zxcvbn"; // Password strength checker library

const EditAccount = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0); // Track password strength
  const [passwordStrengthLabel, setPasswordStrengthLabel] = useState(""); // Display strength level
  const [touchedFields, setTouchedFields] = useState({
    newPassword: false,
    confirmNewPassword: false,
  });

  const auth = getAuth();
  const user = auth.currentUser;
  const navigate = useNavigate();

  const handleFieldFocus = (field) => {
    setTouchedFields((prev) => ({
      ...prev,
      [field]: true,
    }));
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    if (newPassword.length < 12 || newPassword.length > 128) {
      setError("Password must be between 12 and 128 characters.");
      return;
    }

    // Block weak passwords (score below 2)
    if (passwordStrength < 1) {
      setError("Password is too weak. Please choose a stronger password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      await updatePassword(user, newPassword);

      setSuccessMessage("Password updated successfully!");
    } catch (err) {
      console.error(err);
      setError("Error updating password. Please check your current password.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChangeInput = (e) => {
    const passwordInput = e.target.value;
    setNewPassword(passwordInput);
    
    // Reset success message when user is typing
    setSuccessMessage("");

    // Check password strength with zxcvbn
    const result = zxcvbn(passwordInput);
    setPasswordStrength(result.score); // Get strength score (0-4)
    setPasswordStrengthLabel(result.feedback.suggestions.join(" ")); // Show suggestions for weak password
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmNewPassword(e.target.value);

    // Reset success message when user is typing
    setSuccessMessage("");
  };

  const handleCurrentPasswordChange = (e) => {
    setCurrentPassword(e.target.value);

    // Reset success message when user is typing
    setSuccessMessage("");
  };

  return (
    <div>
      <h1>Edit Account</h1>
      <form onSubmit={handlePasswordChange}>
        <div>
          <label>Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={handleCurrentPasswordChange}
            onFocus={() => handleFieldFocus("currentPassword")}
            required
          />
        </div>
        <div>
          <label>New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={handlePasswordChangeInput} // Handle password input change
            onFocus={() => handleFieldFocus("newPassword")} // Set touched when field is focused
            required
          />
          {touchedFields.newPassword && newPassword.length < 12 && (
            <p style={{ color: "red" }}>Password must be at least 12 characters long.</p>
          )}
          {touchedFields.newPassword && newPassword.length > 128 && (
            <p style={{ color: "red" }}>Password must be no more than 128 characters.</p>
          )}
          {touchedFields.newPassword && passwordStrength < 1 && (
            <p style={{ color: "red" }}>Password is too weak. Please choose a stronger password.</p>
          )}
          {touchedFields.newPassword && (
            <>
              <p>Password Strength: {["Weak", "Fair", "Good", "Strong", "Very Strong"][passwordStrength]}</p>
              <p>{passwordStrengthLabel}</p>
            </>
          )}
        </div>
        <div>
          <label>Confirm New Password</label>
          <input
            type="password"
            value={confirmNewPassword}
            onChange={handleConfirmPasswordChange}
            onFocus={() => handleFieldFocus("confirmNewPassword")}
            required
          />
          {touchedFields.confirmNewPassword && newPassword !== confirmNewPassword && (
            <p style={{ color: "red" }}>Passwords do not match.</p>
          )}
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Change Password"}
        </button>
      </form>
      <button onClick={() => navigate("/")}>Back to HOME</button>
    </div>
  );
};

export default EditAccount;
