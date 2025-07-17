// src/components/navbars/NavbarSuperAdmin.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";

const NavbarSuperAdmin = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <Link className="navbar-brand" to="/">
        MTech CRM
      </Link>
      <ul className="navbar-nav me-auto">
        <li className="nav-item">
          <Link className="nav-link" to="/superDash">
            Dashboard
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/adminDashboard">
            Manage Admins
          </Link>
        </li>
      </ul>
      <button onClick={handleLogout} className="btn btn-outline-light">
        Logout
      </button>
    </nav>
  );
};

export default NavbarSuperAdmin;
