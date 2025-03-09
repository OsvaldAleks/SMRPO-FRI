import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./style/Lists.css";
import Dropdown from './Dropdown';
import clsx from "clsx";

const List = ({ items = [], variant = "", className }) => {
  return (
    <ul className={clsx("list", `list--${variant}`, className)}>
      {items.map((item, index) => (
        <li key={index} className="list__item">
          {item.items ? (
            <Dropdown label={item.label} items={item.items} path={item.path} />
          ) : (
            <Link to={item.path} className="list__link">
              {item.label}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
};


export default List;