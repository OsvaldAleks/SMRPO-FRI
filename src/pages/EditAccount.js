import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import zxcvbn from "zxcvbn";
import Button from '../components/Button';
import Input from '../components/Input';

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
    return <p>Loading...</p>;
  }

  return (
      <div className="center--box wide--box">
      <form onSubmit={handlePasswordChange}>
      <h1>Edit Account</h1>
      {user && (
       <div className={"block--element"}>
          <p>Email: <b>{user.email}</b></p>
        </div>
      )}
       <div className={"block--element"}>
       <label className={"block--element"}>
          Current Password</label>
          <Input type="password" className={"block--element"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
        </div>
        <div className={"block--element"}>
        <label className={"block--element"}>
          New Password</label>
          <Input type="password" className={"block--element"} value={newPassword} onChange={handlePasswordChangeInput} onFocus={() => handleFieldFocus("newPassword")} required />
        </div>
        <div className={"block--element"}>
        <label className={"block--element"}>
          Confirm New Password</label>
          <Input type="password" className={"block--element"} value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} onFocus={() => handleFieldFocus("confirmNewPassword")} required />
        </div>
        <div className={"block--element"}>  
          {touchedFields.newPassword && newPassword.length < 12 && <p style={{ color: "red" }}>Password must be at least 12 characters long.</p>}
          {touchedFields.newPassword && newPassword.length > 128 && <p style={{ color: "red" }}>Password must be no more than 128 characters.</p>}
          {touchedFields.newPassword && passwordStrength < 1 && <p style={{ color: "red" }}>Password is too weak. Please choose a stronger password.</p>}
          {touchedFields.newPassword && (
            <>
              <p>Password Strength: {["Weak", "Fair", "Good", "Strong", "Very Strong"][passwordStrength]}</p>
              <p>{passwordStrengthLabel}</p>
            </>
          )}
          {touchedFields.confirmNewPassword && newPassword !== confirmNewPassword && <p style={{ color: "red" }}>Passwords do not match.</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}
          {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
        </div>
        <Button type="submit" disabled={loading}>{loading ? "Updating..." : "Change Password"}</Button>
      </form>
    </div>
  );
};

export default EditAccount;
