import React from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";
import "./style/Card.css"; 

const Card = ({ projectName, teamMembers, startDate, status, onClick }) => {
  return (
    <div className="card" onClick={onClick}>

        <div className="card--header">
        <p className="card--status">
        <strong> statuse: {status}</strong>
        </p>
        <div className="card--header--left">
        <h2 className="card--title">{projectName}</h2>
        <p className="card--p">
        project discreption
        </p>
      
        </div>
        </div>
        <div>
        <p className="card--date">
            Due to
            {startDate ? new Date(startDate).toLocaleDateString() : "N/A"}
        </p>
       </div>
     
      <div className="card__team">
        <strong>Team Members: </strong>
        <ul>
          {teamMembers && teamMembers.length > 0 ? (
            teamMembers.map((member, index) => <li key={index}>{member}</li>)
          ) : (
            <li>No team members assigned yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Card;
