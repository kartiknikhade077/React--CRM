// src/layouts/RoleLayout.jsx
import React from "react";
import Navbar from "./Navbar";

const RoleLayout = ({ role, children }) => {
  return (
    <>
      <Navbar role={role} />
      <div className="container mt-4">
        {children}
      </div>
    </>
  );
};

export default RoleLayout;
