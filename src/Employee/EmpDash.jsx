import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const EmpDash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "ROLE_EMP") {
      navigate("/"); // block unauthorized access
    }
  }, [navigate]);

  return (
    <div>
      <h1>Welcome, Employee Dashboard!</h1>
    </div>
  );
};

export default EmpDash;
