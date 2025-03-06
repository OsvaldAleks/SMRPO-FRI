// src/components/Navbar.js

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import './style/Navbar.css'; // Import the CSS file
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [user, setUser] = useState(null);
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
      {user && (
        <li className="dropdown">
          My projects
          <ul>
            {/* TODO: MAKE LIST OF USERS PROJECTS */}
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
