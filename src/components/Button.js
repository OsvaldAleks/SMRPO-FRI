import React from "react";
import { Link } from "react-router-dom";
import "./style/Button.css";
import clsx from "clsx";

const Button = ({ variant = "primery", to, children, onClick, className, ...props }) => {
  const Component = to ? Link : "button"; 

  return (
    <Component
      to={to}
      className={clsx("btn", `btn--${variant}`, className)}
      onClick={to ? undefined : onClick}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Button;
