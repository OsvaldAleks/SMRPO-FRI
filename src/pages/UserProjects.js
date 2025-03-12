import React, { useContext } from "react";
import { useAuth } from "../context/AuthContext";
import { ProjectsContext } from "../context/ProjectsContext"; 
import { useNavigate } from 'react-router-dom';
import Button from "../components/Button";
import Input from "../components/Input";


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
    <div className="center--box wide--box">
       <Button variant="goback" onClick={goBackHandler} />
      
      <h1>Projects</h1>
     
      <div className="grid ">
        <div className="grid--rightdiv">
          
             {/* Add Project Button */}
          {user?.system_rights === "Admin" && !loading && (
            <Button
            variant={"primery"}
              onClick={() => navigate(`/newProject`)}
            >
              +
            </Button>
          )}
        </div>
        </div>
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
       
      </div>
    </div>
  );
};

export default UserProjects;
