// src/components/Navbar.js

import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import './style/Navbar.css';
import { useNavigate } from "react-router-dom";
import { getUserProjects } from "../api"; 
import { ProjectsContext } from "../context/ProjectsContext";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const { projects } = useContext(ProjectsContext);

  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);

    });
    console.log(projects)

    return () => unsubscribe();
  }, []);


  const handleLogout = () => {
    const auth = getAuth();
    auth.signOut().then(() => {
      console.log("User signed out!");
      navigate("/");
    }).catch((error) => {
      console.error("Error signing out:", error);
    });
  };

  return (
    <nav>
    <ul>
      <li className="nav-left">
        <Link to="/">Home</Link>
      </li>
      {user && (
        <li className="dropdown">
          <Link to="/userProjects">My projects</Link>
          <ul>
          {projects.map((project) => (
            <li key={project.projectId}>
              <Link to={`project/`+project.projectName}>{project.projectName}</Link>
            </li>
          ))}
            {/* TODO: Check if user is admin - if they are, let them create a new project */}
            <li><Link to="/newProject">+ Create Project</Link></li>
          </ul>
        </li>
      )}
      {user && (
        <li><Link to="/manageUsers">Manage users</Link></li>
      )}
      <li className="nav-right">
        {!user ? (
          <Link to="/login" className="login-btn">Login</Link>
        ) : (
          <>
            <Link to="/EditAccount">Edit Account</Link>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </>
        )}
      </li>
    </ul>
  </nav>
  

  );
};

export default Navbar;
