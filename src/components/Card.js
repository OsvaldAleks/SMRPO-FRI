import React from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";
import "./style/Card.css"; 

const Card = ({ title, extraContent, extraText, description, onClick }) => {
  return (
    <div
      className={clsx("card", { "card--no-role": !extraContent })}
      onClick={onClick}
    >
      <div className="card--header">
        <div className="card--header--left">
          <h2 className="card--title">{title}</h2>
          <p className="card--description">
            {description} 
          </p>
        </div>
      </div>
      {extraContent && (
      <div className="card--team">
        <span>
          <strong>{extraText} </strong> 
          {extraContent}
          </span>
      </div>
      )}
    </div>
  );
};

export default Card;