import React from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";
import "./style/Card.css"; 

const Card = ({ projectName, userRole, projectDescription, onClick }) => {
  return (
    <div
      className={clsx("card", { "card--no-role": !userRole })}
      onClick={onClick}
    >
      <div className="card--header">
        <div className="card--header--left">
          <h2 className="card--title">{projectName}</h2>
          <p className="card--description">
            {projectDescription} 
          </p>
        </div>
      </div>
      {userRole && (
      <div className="card--team">
        <span>
          <strong>Your role: </strong> 
          {userRole=="devs" ? 'Developer': userRole=="scrumMasters" ? 'SCRUM master' : 'Product Owner'}
          </span>
      </div>
      )}
    </div>
  );
};

export default Card;