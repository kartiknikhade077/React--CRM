import React from "react";
import { FaSearch, FaBell, FaUser, FaBars } from "react-icons/fa";
import "./EmployeeTopbar.css";

const EmployeeTopbar = ({ onToggle }) => {
  return (
    <div className="employee-topbar">
      <div className="employee-topbar__toggle-btn" onClick={onToggle}>
        <FaBars className="employee-topbar__icon" />
      </div>
      <div className="employee-topbar__search">
        <FaSearch className="employee-topbar__icon" />
        <input type="text" placeholder="Search..." />
      </div>
      <div className="employee-topbar__icons">
        <FaBell className="employee-topbar__icon" />
        <FaUser className="employee-topbar__icon" />
      </div>
    </div>
  );
};

export default EmployeeTopbar;
