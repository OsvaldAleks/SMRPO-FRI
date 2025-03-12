import React from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";
import "./style/Card.css";

const Card = ({ variant = "default", to, title, description, image, className, onClick, children, ...props }) => {
const Component = to ? Link : "div"; 

  return (
    <Component
      to={to}
      className={clsx("card", `card--${variant}`, className)}
      onClick={to ? undefined : onClick} 
      {...props}
    >
    </Component>
  );
};

export default Card;
