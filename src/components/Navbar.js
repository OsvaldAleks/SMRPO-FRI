// src/components/Navbar.js

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import './style/Navbar.css';
import { useNavigate } from "react-router-dom";
import { getUserProjects } from "../api";  // Import the getAllUsers function

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [userProjects, setUserProjects] = useState([]); // State to store user projects

  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        getUserProjects(currentUser.uid).then((projects) => {
          setUserProjects(projects);
        }).catch((error) => {
          console.error("Error fetching user projects:", error);
        });
      } else {
        setUserProjects([]);
      }
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
      {user && (
        <li className="dropdown">
          My projects
          <ul>
           {userProjects.length > 0 ? (
                userProjects.map((project) => (
                  <li key={project.projectId}>
                    <Link to={`/`}>{project.projectName}</Link>
                  </li>
                ))
              ) : (
                <li>No projects found</li>
              )}
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
