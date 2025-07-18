import React from "react";
import { FaSearch, FaBell, FaUser } from "react-icons/fa";
import "./CompanyTopbar.css";

const CompanyTopbar = () => {
  return (
    <div className="company-topbar">
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

export default CompanyTopbar;
