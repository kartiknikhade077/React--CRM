// src/components/common/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";

const menuItems = {
  superadmin: [
    { name: "Dashboard", path: "/superDash" },
    { name: "Manage Admins", path: "/adminDashboard" },
  ],
  admin: [
    { name: "Dashboard", path: "/adminDashboard" },
    { name: "Students", path: "/studenList" },
  ],
  employee: [
    { name: "Dashboard", path: "/empDash" },
    { name: "Profile", path: "/profile" },
  ],
};

const Navbar = ({ role }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear(); // Clear token and role
    navigate("/login");  // Redirect to /signin
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <Link className="navbar-brand" to="/">MTech CRM</Link>
      <div className="collapse navbar-collapse">
        <ul className="navbar-nav me-auto">
          {menuItems[role]?.map((item) => (
            <li className="nav-item" key={item.path}>
              <Link className="nav-link" to={item.path}>{item.name}</Link>
            </li>
          ))}
        </ul>
        <button
          onClick={handleLogout}
          className="btn btn-outline-light"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
