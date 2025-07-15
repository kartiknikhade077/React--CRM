import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Company = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "ROLE_COMPANY") {
      navigate("/"); // block unauthorized access
    }
  }, [navigate]);

  return (
    <div>
      <h1>Welcome, Company Dashboard!</h1>
    </div>
  );
};

export default Company;
