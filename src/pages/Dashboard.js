import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user, loading } = useAuth();

  return (
    <div>
      <h1>Dashboard</h1>
      {user ? (
        <div>
          <p>Welcome, {user.email}!</p> {/* Display the logged-in user's email */}
          <p>Your user ID is: {user.uid}</p> {/* Display the user's unique ID */}
          <p>Your system rights: {user.system_rights}</p> {/* Display the user's unique ID */}
        </div>
      ) : (
        <p>homepage</p>
      )}
    </div>
  );
};

export default Dashboard;
