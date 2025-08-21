import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaLink, FaListAlt, FaSignOutAlt } from "react-icons/fa";
import "./EmployeeSidebar.css";

const EmployeeSidebar = ({ isCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className={`sidebar-employee ${isCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-employee__brand">
        {!isCollapsed && "Employee Portal"}
      </div>

      <ul className="sidebar-employee__nav-links">
        <li
          className={`sidebar-employee__nav-item ${
            location.pathname === "/empHome" ? "active" : ""
          }`}
        >
          <Link to="/employee/cutomerList">
            <FaHome />
            {!isCollapsed && <span>Customer</span>}
          </Link>
        </li>
        <li
          className={`sidebar-employee__nav-item ${
            location.pathname === "/empLink" ? "active" : ""
          }`}
        >
          <Link to="/empLink">
            <FaLink />
            {!isCollapsed && <span>Link</span>}
          </Link>
        </li>
        <li
          className={`sidebar-employee__nav-item ${
            location.pathname === "/empDropdown" ? "active" : ""
          }`}
        >
          <Link to="/empDropdown">
            <FaListAlt />
            {!isCollapsed && <span>Dropdown</span>}
          </Link>
        </li>
      </ul>
      <div className="sidebar-employee__logout">
        <button onClick={handleLogout}>
          <FaSignOutAlt />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default EmployeeSidebar;
