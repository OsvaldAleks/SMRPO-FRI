import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import zxcvbn from "zxcvbn";

//some common passwords 12 characters long
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
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordStrengthLabel, setPasswordStrengthLabel] = useState("");
  const [touchedFields, setTouchedFields] = useState({ newPassword: false, confirmNewPassword: false });
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // Track auth state

  const auth = getAuth();
  const navigate = useNavigate();

  //for top 100 vulnerable passwords
  const isPasswordVulnerable = (password) => {
    return top100VulnerablePasswords.includes(password.toLowerCase());
  };


  // Check if user is logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
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
      setError("This password is too common and vulnerable.");
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
    setNewPassword(e.target.value);
    setSuccessMessage("");
    const result = zxcvbn(e.target.value);
    setPasswordStrength(result.score);
    setPasswordStrengthLabel(result.feedback.suggestions.join(" "));
  };

  if (authLoading) {
    return <p>Loading...</p>; // Show loading until Firebase authentication state is known
  }

  return (
    <div>
      <h1>Edit Account</h1>
      {user && (
        <>
          <p>Email: {user.email}</p>
          <p>User ID: {user.uid}</p>
        </>
      )}
      <form onSubmit={handlePasswordChange}>
        <div>
          <label>Current Password</label>
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
        </div>
        <div>
          <label>New Password</label>
          <input type="password" value={newPassword} onChange={handlePasswordChangeInput} onFocus={() => handleFieldFocus("newPassword")} required />
        </div>
        <div>
          <label>Confirm New Password</label>
          <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} onFocus={() => handleFieldFocus("confirmNewPassword")} required />
        </div>
        {touchedFields.newPassword && newPassword.length < 12 && <p style={{ color: "red" }}>Password must be at least 12 characters long.</p>}
        {touchedFields.newPassword && newPassword.length > 128 && <p style={{ color: "red" }}>Password must be no more than 128 characters.</p>}
        {touchedFields.newPassword && passwordStrength < 1 && <p style={{ color: "red" }}>Password is too weak. Please choose a stronger password.</p>}
        {touchedFields.newPassword && isPasswordVulnerable(newPassword) && <p style={{ color: "red" }}>Password is too common.</p>}
        {touchedFields.newPassword && (
          <>
            <p>Password Strength: {["Weak", "Fair", "Good", "Strong", "Very Strong"][passwordStrength]}</p>
            <p>{passwordStrengthLabel}</p>
          </>
        )}
        {touchedFields.confirmNewPassword && newPassword !== confirmNewPassword && <p style={{ color: "red" }}>Passwords do not match.</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
        <button type="submit" disabled={loading}>{loading ? "Updating..." : "Change Password"}</button>
      </form>
    </div>
  );
};

export default EditAccount;
