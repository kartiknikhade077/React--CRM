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
      <div className="brand">MTech CRM</div>
      <ul className="nav-links">
        <li className={location.pathname === "/superDash" ? "active" : ""}>
          <Link to="/superDash">
            <FaTachometerAlt /> Dashboard
          </Link>
        </li>
        <li className={location.pathname === "/adminDashboard" ? "active" : ""}>
          <Link to="/adminDashboard">
            <FaUserShield /> Manage Admins
          </Link>
        </li>
        <li
          className={location.pathname === "/manageEmployees" ? "active" : ""}
        >
          <Link to="/manageEmployees">
            <FaUsers /> Manage Employees
          </Link>
        </li>
        <li className={location.pathname === "/settings" ? "active" : ""}>
          <Link to="/settings">
            <FaCog /> Settings
          </Link>
        </li>
      </ul>

      {/* Logout Button */}
      <div className="logout-link">
        <button onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </div>
  );
};

export default SidebarSuperAdmin;
