import React from "react";
import { Link } from "react-router-dom";
import "./style/Lists.css";
import clsx from "clsx";

const List = ({ items = [], variant = "", className }) => {

    return (
    <ul className={clsx("list", `list--${variant}`, className)}>
      {items.map((item, index) => (
        <li key={index} className="list__item">
          <Link to={item.path} className="list__link">
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default List;
