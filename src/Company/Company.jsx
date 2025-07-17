import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CompanyNavbar from "../Company/CompanyNabar";

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
      <CompanyNavbar />
      <h1>Welcome, Company Dashboard!</h1>
    </div>
  );
};

export default Company;
