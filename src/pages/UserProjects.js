import React, { useContext } from "react";
import { useAuth } from "../context/AuthContext";
import { ProjectsContext } from "../context/ProjectsContext"; 
import { useNavigate } from 'react-router-dom';
import Button from "../components/Button";
import Input from "../components/Input";
import Card from "../components/Card";

const UserProjects = () => {
  const { user, loading } = useAuth();
  const { projects } = useContext(ProjectsContext);
  const navigate = useNavigate();

  const handleProjectClick = (projectName) => {
    navigate(`/project/${projectName}`);
  };

  const goBackHandler = () => {
    navigate(-1);
  };

  // Separate projects where the user is an owner
  const ownerProjects = projects.filter(project => project.userRole === "owner");
  const otherProjects = projects.filter(project => project.userRole !== "owner");

  return (
    <div className="center--box dashboard--box">
      <span style={{ display: window.location.pathname === "/" ? "none" : "block" }}>
        <Button variant="goback" onClick={goBackHandler} />
      </span>
      <h1>Projects</h1>
      <h2>Select your project</h2>
      <div className="btn-container">
        <div className="btn--left">
          <Input type="text" placeholder="Search" />
        </div>
        <div className="btn--right">
          {user?.system_rights === "Admin" && !loading && (
            <Button variant={"secondary"} onClick={() => navigate(`/newProject`)}>
              +
            </Button>
          )}
        </div>
      </div>
      
      {otherProjects.length > 0 && (
        <>
          <div className="project-list">
            {otherProjects.map((project) => (
              <Card
                key={project.projectName}
                title={project.projectName}
                description={project.projectDescription}
                extraText="Your role"
                extraContent={project.userRole == "devs" ? 'Developer': project.userRole=="scrumMasters" ? 'SCRUM master' : 'Product Owner' || []}
                onClick={() => handleProjectClick(project.projectName)}
              />
            ))}
          </div>
        </>
      )}

        {ownerProjects.length > 0 && (
        <>
          <h3>View as admin:</h3>
          <div className="project-list">
            {ownerProjects.map((project) => (
              <Card
                key={project.projectName}
                title={project.projectName}
                description={project.projectDescription}
                onClick={() => handleProjectClick(project.projectName)}
              />
            ))}
          </div>
        </>
      )}
      
      {projects.length === 0 && <p>No projects available.</p>}
    </div>
  );
};

export default UserProjects;
