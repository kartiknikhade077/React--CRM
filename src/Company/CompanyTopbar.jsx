import React from "react";
import { FaSearch, FaBell, FaUser } from "react-icons/fa";
import "./CompanyTopbar.css";

const CompanyTopbar = () => {
  return (
    <div className="company-topbar">
      <div className="company-topbar__search">LOGO</div>
      <div className="company-topbar__icons">
        <FaBell className="company-topbar__icon" />
        <FaUser className="company-topbar__icon" />
      </div>
    </div>
  );
};

export default CompanyTopbar;
