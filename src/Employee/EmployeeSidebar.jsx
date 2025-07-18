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
      <div className="brand">CRM-Tech</div>

      <ul className="nav-links">
        <li className={location.pathname === "/empHome" ? "active" : ""}>
          <Link to="/empHome">
            <FaHome /> Home
          </Link>
        </li>
        <li className={location.pathname === "/empLink" ? "active" : ""}>
          <Link to="/empLink">
            <FaLink /> Link
          </Link>
        </li>
        <li className={location.pathname === "/empDropdown" ? "active" : ""}>
          <Link to="/empDropdown">
            <FaListAlt /> Dropdown
          </Link>
        </li>
      </ul>

      <div className="logout-link">
        <button onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </div>
  );
};

export default EmployeeSidebar;
