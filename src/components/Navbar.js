// src/components/Navbar.js

import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import './style/Navbar.css';
import { useNavigate } from "react-router-dom";
import { ProjectsContext } from "../context/ProjectsContext";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const { projects } = useContext(ProjectsContext) || { projects: [] };
  
  // Ensure projects is always an array
  const projectList = Array.isArray(projects) ? projects : [];

  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });

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

        {/* Only show projects if user is logged in */}
        {user && (
          <li className="dropdown">
            <Link to="/userProjects">My projects</Link>
            <ul>
              {projectList.length > 0 ? (
                projectList.map((project) => (
                  <li key={project.projectId}>
                    <Link to={`/project/${project.projectName}`}>{project.projectName}</Link>
                  </li>
                ))
              ) : (
                <li>No projects available</li> // Prevents map() error
              )}
              
              {/* Only show project creation if user is logged in */}
              <li><Link to="/newProject">+ Create Project</Link></li>
            </ul>
          </li>
        )}

        {/* Only show manage users if user is logged in */}
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
