import React from "react";
import clsx from "clsx";
import "./style/Card.css"; 

const Card = ({ title, extraContent, extraText, description, onClick, colorScheme="card--default" }) => {
  return (
    <div
      className={clsx("card", { "card--no-role": !extraContent }, colorScheme)}
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
      <div className="card--extra">
        {Array.isArray(extraText) && Array.isArray(extraContent) ? (
          extraText.map((text, index) => (
            <p key={index}>
              <strong>{text} </strong> 
              {extraContent[index]}
            </p>

          ))
        ) : (
          <span>
            <strong>{extraText} </strong> 
            {extraContent}
          </span>
        )}
      </div>
      )}
    </div>
  );
};

export default Card;