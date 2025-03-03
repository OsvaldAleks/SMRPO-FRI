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
        <div className="nav-left">
          <li>
            <Link to="/">Home</Link>
          </li>
        </div>

        <div className="nav-right">
          {!user ? (
            <li><Link to="/login" className="login-btn">Login</Link></li>
          ) : (
            <>
              <li>
                <Link to="/EditAccount">Edit Account</Link>
              </li>
              <li>
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
              </li>
            </>
          )}
        </div>
      </ul>
    </nav>
  );
};

export default Navbar;
