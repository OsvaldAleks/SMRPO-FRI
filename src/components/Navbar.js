import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { useAuth } from "../context/AuthContext";
import './style/Navbar.css';
import { ProjectsContext } from "../context/ProjectsContext";
import List from "../components/Lists";

const Navbar = () => {
  const { user } = useAuth();
  const { projects } = useContext(ProjectsContext) || { projects: [] };
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(window.scrollY);

  const navigate = useNavigate();
  const projectList = Array.isArray(projects) ? projects : [];

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (Math.abs(currentScrollY - lastScrollY) > 20) {
        setIsVisible(currentScrollY < lastScrollY);
        setLastScrollY(currentScrollY);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleLogout = () => {
    getAuth().signOut()
      .then(() => {
        console.log("User signed out!");
        navigate("/");
      })
      .catch((error) => console.error("Error signing out:", error));
  };

  const myProjectsItems = projectList.map((project) => ({
    label: project.projectName, 
    path: `/project/${project.projectName}`, 
  }));

  if (user?.system_rights === 'Admin') {
    myProjectsItems.push({ label: "+ Create Project", path: "/newProject" });
  }

  return (
    <nav className={`nav ${isVisible ? "visible" : "hidden"}`}>
      <Link to="/" className="nav-title">Sprintly</Link>
      {!user ? (
        <Link to="/login" className="login-link">Login</Link>
      ) : (
        <>
          <List
            className="nav-left"
            items={[
              { label: "My Projects", path: "/userProjects", items: myProjectsItems },
              ...(user.system_rights === "Admin" ? [{ label: "Manage Users", path: "/manageUsers" }] : []),
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
