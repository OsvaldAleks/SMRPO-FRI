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
  return (
    <div className="center--box dashboard--box">
 
       <Button variant="goback" onClick={goBackHandler} />
      
      <h1>Projects</h1>
     <h2>Select your project</h2>
      <div className=" btn-container">
        <div className="btn--left">
          <Input
          type="text"
          placeholder="Search"
          
          />
        </div>
        <div className="btn--right">
          
             {/* Add Project Button */}
          {user?.system_rights === "Admin" && !loading && (
            <Button
            variant={"secondary"}
              onClick={() => navigate(`/newProject`)}
            >
              +
            </Button>
          )}
        </div>
        </div>

        <div className="project-list">
      {projects.length > 0 ? (
        projects.map((project) => (
          <Card
            key={project.projectName}
            projectName={project.projectName}
            teamMembers={project.teamMembers || []}
            startDate={project.startDate}
            status={project.status}
            onClick={() => handleProjectClick(project.projectName)} 
          />
        ))
      ) : (
        <p>No projects available.</p>
      )}
    </div>
    </div>
  );
};

export default UserProjects;
