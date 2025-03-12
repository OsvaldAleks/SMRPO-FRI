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
    <div className="center--box wide--box">
       <Button variant="goback" onClick={goBackHandler} />
      
      <h1>Projects</h1>
     
      <div className=" block--element grid ">
        <div className="grid--leftdiv">
          <Input
          type="text"
          placeholder="Search"
          
          />
        </div>
        <div className="grid--rightdiv">
          
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
            onClick={() => handleProjectClick(project.projectName)} // On click handler for the card
          />
        ))
      ) : (
        <p>No projects available.</p>
      )}
    </div>


      {/* <div className="grid-container">

        
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
       
      </div> */}
    </div>
  );
};

export default UserProjects;
