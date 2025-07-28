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

const SidebarSuperAdmin = ({ isCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className={`sidebar-superadmin ${isCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-superadmin__brand">
        {!isCollapsed && "MTech CRM"}
      </div>
      <ul className="sidebar-superadmin__nav-links">
        <li
          className={`sidebar-superadmin__nav-item ${
            location.pathname === "/superDash" ? "active" : ""
          }`}
        >
          <Link to="/superDash">
            <FaTachometerAlt />
            {!isCollapsed && <span>Dashboard</span>}
          </Link>
        </li>
        <li
          className={`sidebar-superadmin__nav-item ${
            location.pathname === "/adminDashboard" ? "active" : ""
          }`}
        >
          <Link to="">
            <FaUserShield />
            {!isCollapsed && <span>Manage Admins</span>}
          </Link>
        </li>
        <li
          className={`sidebar-superadmin__nav-item ${
            location.pathname === "/manageEmployees" ? "active" : ""
          }`}
        >
          <Link to="">
            <FaUsers />
            {!isCollapsed && <span>Manage Employees</span>}
          </Link>
        </li>
        <li
          className={`sidebar-superadmin__nav-item ${
            location.pathname === "/settings" ? "active" : ""
          }`}
        >
          <Link to="/settings">
            <FaCog />
            {!isCollapsed && <span>Settings</span>}
          </Link>
        </li>
      </ul>

      <div className="sidebar-superadmin__logout">
        <button onClick={handleLogout}>
          <FaSignOutAlt />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default SidebarSuperAdmin;
