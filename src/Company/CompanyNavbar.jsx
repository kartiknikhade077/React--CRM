// src/components/navbars/CompanyNavbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";

const CompanyNavbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <Link className="navbar-brand" to="/">
        CRM-Tech
      </Link>

      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#companyNavbar"
        aria-controls="companyNavbar"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="companyNavbar">
        <ul className="navbar-nav me-auto">
          <li className="nav-item">
            <Link className="nav-link" to="/compDash">
              Dashboard
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/EmployeeList">
              Employee
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/department">
              Department
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/CompRole">
              {" "}
              Role
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="#">
              Settings
            </Link>
          </li>
        </ul>
        <button onClick={handleLogout} className="btn btn-outline-light">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default CompanyNavbar;
