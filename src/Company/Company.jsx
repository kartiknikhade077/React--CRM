import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import CompanySidebar from "./CompanySidebar";
import CompanyTopbar from "./CompanyTopbar";
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
      <CompanyTopbar />
      <div className="slidebar-main-div">
        <CompanySidebar />
        <div className="slidebar-main-div-right-section">
          <h1>Welcome, Company Dashboard!</h1>
        </div>
      </div>
    </div>
  );
};

export default Company;
