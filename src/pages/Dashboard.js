import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import UserProjects from "./UserProjects";
import Button from "../components/Button";
import './style/Dashboard.css'

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="dashboard-wrapper">
      {user ? (
        <>
          <h1 >Welcome!</h1>
          <h2>Select a project</h2>

          <UserProjects></UserProjects>
          <div className="center--box">
            <h2>Your ongoing sprints</h2>
          </div>
        </>
      ) : (
        <>
          <h1>HOMEPAGE</h1>
          <h2>You con log in here</h2>
            <Button onClick={() => navigate(`/login`)}>LOGIN</Button>
        </>
      )}
    </div>
  );
};

export default Dashboard;
