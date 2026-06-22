import React from "react";
import { Link } from "react-router-dom";
import "../styles/Sidebar.css";

const Sidebar = ({ isOpen }) => {
  return (
    <div className={`sidebar ${isOpen ? "active" : ""}`}>
      <ul className="nav-menu">
        <li>
          <Link to="/dashboard">
            <span>📊</span> Dashboard
          </Link>
        </li>
        <li>
          <Link to="/food-log">
            <span>🍽️</span> Food Log
          </Link>
        </li>
        <li>
          <Link to="/set-goals">
            <span>📋</span> Set Goals
          </Link>
        </li>
        <li>
          <Link to="/settings">
            <span>⚙️</span> Settings
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
