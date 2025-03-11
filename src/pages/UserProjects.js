import React, { useContext } from "react";
import { useAuth } from "../context/AuthContext";
import { ProjectsContext } from "../context/ProjectsContext"; 
import { useNavigate } from 'react-router-dom';

const UserProjects = () => {
  const { user, loading } = useAuth();
  const { projects } = useContext(ProjectsContext);
  const navigate = useNavigate();

  const handleProjectClick = (projectName) => {
    navigate(`/project/${projectName}`);
  };

  return (
    <div className="center--box">
      <h1>Your projects</h1>
      <div className="grid-container">
        {projects.length > 0 && (
          projects.map((project) => (
            <div
              key={project.projectName}
              className="grid-item"
              onClick={() => handleProjectClick(project.projectName)}
            >
              <h2>{project.projectName}</h2>
            </div>
          )))}
        {/* Add Project Button */}
        {user?.system_rights === "Admin" && !loading && (
          <button
            className="add-button"
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
