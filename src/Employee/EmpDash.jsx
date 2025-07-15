import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EmployeeNav from "./EmployeeNavBar";

const EmpDash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    
  });

  return (
    <div>
      <EmployeeNav/>
      <h1>Welcome, Employee Dashboard!</h1>
    </div>
  );
};

export default EmpDash;
