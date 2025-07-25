import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaLink, FaListAlt, FaSignOutAlt } from "react-icons/fa";
import "./EmployeeSidebar.css";

const EmployeeSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="sidebar-employee">
      <div className="sidebar-employee__brand">CRM-Tech</div>

      <ul className="sidebar-employee__nav-links">
        <li
          className={`sidebar-employee__nav-item ${
            location.pathname === "/empHome" ? "active" : ""
          }`}
        >
          <Link to="/empHome">
            <FaHome /> Home
          </Link>
        </li>
        <li
          className={`sidebar-employee__nav-item ${
            location.pathname === "/empLink" ? "active" : ""
          }`}
        >
          <Link to="/empLink">
            <FaLink /> Link
          </Link>
        </li>
        <li
          className={`sidebar-employee__nav-item ${
            location.pathname === "/empDropdown" ? "active" : ""
          }`}
        >
          <Link to="/empDropdown">
            <FaListAlt /> Dropdown
          </Link>
        </li>
      </ul>

      <div className="sidebar-employee__logout">
        <button onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </div>
  );
};

export default EmployeeSidebar;
