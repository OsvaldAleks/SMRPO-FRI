// src/components/Navbar.js

import React, { useState, useEffect, useContext } from 'react';
import { Link,useNavigate} from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { useAuth } from "../context/AuthContext";
import './style/Navbar.css';
// import { useNavigate } from "react-router-dom";
import { ProjectsContext } from "../context/ProjectsContext";

// import { Link, useNavigate } from "react-router-dom";

import Button from "../components/Button";
import List from "../components/Lists";

const Navbar = () => {
  const { user, loading } = useAuth();
  const { projects } = useContext(ProjectsContext) || { projects: [] };
  
  // Ensure projects is always an array
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

  return (
    // <nav>
    //   <ul>
    //     <li className="nav-left">
    //       <Link to="/">Home</Link>
    //     </li>

    //     {/* Only show projects if user is logged in */}
    //     {user && (
    //       <li className="dropdown">
    //         <Link to="/userProjects">My projects</Link>
    //         <ul>
    //           {projectList.length > 0 ? (
    //             projectList.map((project) => (
    //               <li key={project.projectId}>
    //                 <Link to={`/project/${project.projectName}`}>{project.projectName}</Link>
    //               </li>
    //             ))
    //           ) : (
    //             <li>No projects available</li> // Prevents map() error
    //           )}
              
    //           {user.system_rights == 'Admin' &&
    //             <li><Link to="/newProject">+ Create Project</Link></li>
    //           }
    //         </ul>
    //       </li>
    //     )}

    //     {user && user.system_rights == 'Admin' && (
    //       <li><Link to="/manageUsers">Manage users</Link></li>
    //     )}

    //     <li className="nav-right">
    //       {!user ? (
    //         <Link to="/login" className="login-btn">Login</Link>
    //       ) : (
    //         <>
    //           <Link to="/EditAccount">Edit Account</Link>
    //           <button className="logout-btn" onClick={handleLogout}>Logout</button>
    //         </>
    //       )}
    //     </li>
    //   </ul>
    // </nav>
    <nav className="nav">
      <span className="nav-tittle">Sprintly</span>
      {!user ? (
        <>

          <List className="nav-left" items={[{ label: "Home", path: "/" }]} variant="inline" />
          <Button className="nav-right" variant="outline" to="/login">
            Login
          </Button>
        </>
      ) : (
        <>
          <List
            className="nav-left"
            items={[
              { label: "Home", path: "/" },
              { label: "Dashboard", path: "/dashboard" },
              { label: "Add User", path:"/addUser" },
              { label: "New Project", path: "/newProject" }, 
              { label: "Edit Account", path: "/EditAccount" },
            ]}
            variant="inline"
          />

            <Button className="nav-right" variant="secondary" onClick={handleLogout}>
              Logout
            </Button>
        </>
      )}
    </nav>
  );
};

export default Navbar;
