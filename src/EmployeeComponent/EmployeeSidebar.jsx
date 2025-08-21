import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaLink, FaListAlt, FaSignOutAlt } from "react-icons/fa";
import "./EmployeeSidebar.css";
import axiosInstance from "../BaseComponet/axiosInstance";
const EmployeeSidebar = ({ isCollapsed, onAccessFetched  }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [accessPermission, setAccessPermission] = useState({});
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

 useEffect(() => {
  fetchAccess();
}, []);

const fetchAccess = async () => {
  try {
    const response = await axiosInstance.get(`/company/getModuleAccessInfo`);
    setAccessPermission(response.data);
     if (onAccessFetched) {   // ✅ Only call if passed
      onAccessFetched(response.data);
    }
  } catch (err) {
    console.error("Failed to fetch access:", err);
  }
};

  return (
    <div className={`sidebar-employee ${isCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-employee__brand">
        {!isCollapsed && "Employee Portal"}
      </div>

      <ul className="sidebar-employee__nav-links">
      {accessPermission?.customerOwnView &&   (
        <li
          className={`sidebar-employee__nav-item ${location.pathname === "/employee/cutomerList" ? "active" : ""
            }`}
        >
          <Link to="/employee/cutomerList">
            <FaHome />
            {!isCollapsed && <span>Customer</span>}
          </Link>
        </li>
      )}
      {accessPermission?.projectOwnView &&   (
        <li
          className={`sidebar-employee__nav-item ${location.pathname === "/employee/cutomerList" ? "active" : ""
            }`}
        >
          <Link to="/employee/projectList">
            <FaHome />
            {!isCollapsed && <span>Projects</span>}
          </Link>
        </li>
      )}
       {accessPermission?.timeSheetAccess &&   (
        <li
          className={`sidebar-employee__nav-item ${location.pathname === "/employee/timeSheet" ? "active" : ""
            }`}
        >
          <Link to="/employee/timeSheet">
            <FaHome />
            {!isCollapsed && <span>TimeSheet</span>}
          </Link>
        </li>
      )}
        <li
          className={`sidebar-employee__nav-item ${location.pathname === "/empLink" ? "active" : ""
            }`}
        >
          <Link to="/empLink">
            <FaLink />
            {!isCollapsed && <span>Link</span>}
          </Link>
        </li>
        <li
          className={`sidebar-employee__nav-item ${location.pathname === "/empDropdown" ? "active" : ""
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
