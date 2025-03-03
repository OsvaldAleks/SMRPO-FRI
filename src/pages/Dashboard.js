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

  return (
    <div>
      <h1>Dashboard</h1>
      {user ? (
        <div>
          <p>Welcome, {user.email}!</p> {/* Display the logged-in user's email */}
          <p>Your user ID is: {user.uid}</p> {/* Display the user's unique ID */}
        </div>
      ) : (
        <p>homepage</p>
      )}
    </div>
  );
};

export default Dashboard;
