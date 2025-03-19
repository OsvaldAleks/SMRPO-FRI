import React from "react";
import "./style/Input.css";
import "./style/Selects.css";
import clsx from "clsx";

const Input = ({ variant = "", type = "text", className, ...props }) => {
  return (
    <input
      type={type}
      className={clsx("input", `input--${variant}`, className)}
      {...props}
    />
  );
};

export default Input;
