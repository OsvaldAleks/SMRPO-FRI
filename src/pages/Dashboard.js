import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth"; // Firebase Auth methods

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, [auth]);

  const handleLogout = () => {
    signOut(auth).then(() => {
      console.log("User signed out!");
      setUser(null);
      navigate("/login"); // Redirect to login page after logout
    });
  };

  return (
    <div>
      <h1>Dashboard</h1>
      {user ? (
        <div>
          <p>Welcome, {user.email}!</p> {/* Display the logged-in user's email */}
          <p>Your user ID is: {user.uid}</p> {/* Display the user's unique ID */}
          <button onClick={handleLogout}>Logout</button>
          <button onClick={() => navigate("/EditAccount")}>Edit Account</button> {/* Redirect to Edit Account */}
        </div>
      ) : (
        <div>
          <p>To log in, click the button below:</p>
          <button onClick={() => navigate("/login")}>Go to Login</button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
