import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useAuth } from "../context/AuthContext";
import { getUserProjects } from "../api"; 
import { useNavigate } from 'react-router-dom';

const UserProjects = () => {
  const { user, loading } = useAuth();
  const [userProjects, setUserProjects] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setIsLoadingProjects(true);
      getUserProjects(user.uid)
        .then((projects) => {
          setUserProjects(projects);
        })
        .catch((error) => {
          console.error("Error fetching user projects:", error);
        })
        .finally(() => {
          setIsLoadingProjects(false);
        });
    } else {
      setUserProjects([]);
    }
  }, [user]);

  const handleProjectClick = (projectName) => {
    navigate(`/project/${projectName}`);
  };

  return (
    <div className="center--box">
      <h1>Your projects</h1>
      <div className="sprints-grid">
        {isLoadingProjects ? (
          <div
            className="sprint-box gray"
          >
            <p>Loading projects...</p>
          </div>
        ) : userProjects.length > 0 ? (
          userProjects.map((project) => (
            <div
              key={project.projectName}
              className="sprint-box"
              onClick={() => handleProjectClick(project.projectName)}
            >
              <h2 key={project.projectId}>
                {project.projectName}
              </h2>
            </div>
          ))
        ) : (
          <li>No projects found</li>
        )}
        {/* Add Sprint Button */}
        {user?.system_rights === "Admin" && (
          <button
            className="add-sprint-button"
            onClick={() => navigate(`/newProject`)}
          >
            +
          </button>
        )}
      </div>
    </div>
  );
};

export default UserProjects;