import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user, loading } = useAuth();

  return (
    <div>
      <h1>Dashboard</h1>
      {user ? (
        <div>
          <p>Welcome, {user.email}!</p>
          <p>Your user ID is: {user.uid}</p>
          <p>Your system rights: {user.system_rights}</p>
        </div>
      ) : (
        <p>homepage</p>
      )}
    </div>
  );
};

export default Dashboard;
