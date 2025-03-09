import React from "react";
import { Link } from "react-router-dom";
import "./style/Dropdown.css";

const Dropdown = ({ label, items, path }) => {
  return (
    <div className="dropdown">
      {/* Clicking label navigates to path */}
      <Link to={path} className="dropdown__label">
        {label}
      </Link>
      <ul className="dropdown__menu">
        {items.map((item, index) => (
          <li key={index}>
            <Link to={item.path}>{item.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dropdown;
