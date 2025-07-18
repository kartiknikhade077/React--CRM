// File: src/SuperAdminComponent/NavbarTopSuperAdmin.jsx
import React from "react";
import { FaSearch, FaBell, FaCog, FaUser } from "react-icons/fa";
import "./NavbarTopSuperAdmin.css";

const NavbarTopSuperAdmin = () => {
  return (
    <div className="superadmin-topbar">
      <div className="topbar-search">
        <FaSearch className="icon" />
        <input type="text" placeholder="Search..." />
      </div>
      <div className="topbar-icons">
        <FaBell className="icon" />
        <FaCog className="icon" />
        <FaUser className="icon" />
      </div>
    </div>
  );
};

export default NavbarTopSuperAdmin;
