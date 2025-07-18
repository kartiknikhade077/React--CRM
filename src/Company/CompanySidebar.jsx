import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUsers,
  FaBuilding,
  FaUserTag,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import "./CompanySidebar.css";

const CompanySidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="sidebar-company">
      <div className="brand">CRM-Tech</div>

      <ul className="nav-links">
        <li className={location.pathname === "/compDash" ? "active" : ""}>
          <Link to="/compDash">
            <FaTachometerAlt /> Dashboard
          </Link>
        </li>
        <li className={location.pathname === "/EmployeeList" ? "active" : ""}>
          <Link to="/EmployeeList">
            <FaUsers /> Employee
          </Link>
        </li>
        <li className={location.pathname === "/department" ? "active" : ""}>
          <Link to="/department">
            <FaBuilding /> Department
          </Link>
        </li>
        <li className={location.pathname === "/CompRole" ? "active" : ""}>
          <Link to="/CompRole">
            <FaUserTag /> Role
          </Link>
        </li>
        <li className={location.pathname === "/CompSettings" ? "active" : ""}>
          <Link to="/CompSettings">
            <FaCog /> Settings
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

export default CompanySidebar;
