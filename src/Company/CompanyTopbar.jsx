import React from "react";
import { FaSearch, FaBell, FaUser, FaBars } from "react-icons/fa";
import "./CompanyTopbar.css";


const CompanyTopbar = ({ onToggle }) => {
  return (
    <div className="company-topbar">
      <div className="company-topbar__toggle" onClick={onToggle}>
        <FaBars className="company-topbar__icon" />
      </div>
      <div className="company-topbar__search">LOGO</div>
      <div className="company-topbar__icons">
        <FaBell className="company-topbar__icon" />
        <FaUser className="company-topbar__icon" />
      </div>
    </div>
  );
};

export default CompanyTopbar;
