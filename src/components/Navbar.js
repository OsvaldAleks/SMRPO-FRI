import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { useAuth } from "../context/AuthContext";
import './style/Navbar.css';
import { ProjectsContext } from "../context/ProjectsContext";
import List from "../components/Lists";

const Navbar = () => {
  const { user, loading } = useAuth();
  const { projects } = useContext(ProjectsContext) || { projects: [] };

  const projectList = Array.isArray(projects) ? projects : [];

  const navigate = useNavigate();

  const handleLogout = () => {
    const auth = getAuth();
    auth.signOut()
      .then(() => {
        console.log("User signed out!");
        navigate("/");
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  };

  // Generate dropdown items for "My Projects"
  const myProjectsItems = projectList.map((project) => ({
    label: project.projectName, 
    path: `/project/${project.projectName}`, 
  }));

  // Add "Create Project" item if the user is an admin
  if (user && user.system_rights === 'Admin') {
    myProjectsItems.push({
      label: "+ Create Project",
      path: "/newProject",
    });
  }

  return (
    <nav className="nav">
      <Link to="/" className="nav-title">Sprintly</Link>
      {!user ? (
        <>
          <Link to="/login" className="login-link">Login</Link>
        </>
      ) : (
        <>
          <List
            className="nav-left"
            items={[
              {
                label: "My Projects",
                path: "/userProjects",
                items: myProjectsItems,
              },
              ...(user && user.system_rights === "Admin"
                ? [{ label: "Manage Users", path: "/manageUsers" }]
                : []),
            ]}
            variant="inline"
          />

          <div className="nav-right">
            <Link to="/EditAccount" className="edit-account-link">Edit Account</Link>
            <span className="logout-link" onClick={handleLogout}>Logout</span>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;