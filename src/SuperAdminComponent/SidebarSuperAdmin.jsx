import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUserShield,
  FaUsers,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import "./SidebarSuperAdmin.css";

const SidebarSuperAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="sidebar-superadmin">
      <div className="sidebar-superadmin__brand">MTech CRM</div>
      <ul className="sidebar-superadmin__nav-links">
        <li
          className={`sidebar-superadmin__nav-item ${
            location.pathname === "/superDash" ? "active" : ""
          }`}
        >
          <Link to="/superDash">
            <FaTachometerAlt /> Dashboard
          </Link>
        </li>
        <li
          className={`sidebar-superadmin__nav-item ${
            location.pathname === "/adminDashboard" ? "active" : ""
          }`}
        >
          <Link to="">
            <FaUserShield /> Manage Admins
          </Link>
        </li>
        <li
          className={`sidebar-superadmin__nav-item ${
            location.pathname === "/manageEmployees" ? "active" : ""
          }`}
        >
          <Link to="">
            <FaUsers /> Manage Employees
          </Link>
        </li>
        <li
          className={`sidebar-superadmin__nav-item ${
            location.pathname === "/settings" ? "active" : ""
          }`}
        >
          <Link to="/settings">
            <FaCog /> Settings
          </Link>
        </li>
      </ul>

      <div className="sidebar-superadmin__logout">
        <button onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </div>
  );
};

export default SidebarSuperAdmin;
