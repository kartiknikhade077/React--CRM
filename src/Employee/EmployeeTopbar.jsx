import React from "react";
import { FaSearch, FaBell, FaUser } from "react-icons/fa";
import "./EmployeeTopbar.css";

const EmployeeTopbar = () => {
  return (
    <div className="employee-topbar">
      <div className="topbar-search">
        <FaSearch />
        <input type="text" placeholder="Search..." />
      </div>
      <div className="topbar-icons">
        <FaBell className="icon" />
        <FaUser className="icon" />
      </div>
    </div>
  );
};

export default EmployeeTopbar;
