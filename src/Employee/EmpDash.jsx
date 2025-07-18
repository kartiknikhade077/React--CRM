import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EmployeeNav from "./EmployeeNavBar";

import EmployeeSidebar from "./EmployeeSidebar";
import EmployeeTopbar from "./EmployeeTopbar";

const EmpDash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    
  });

  return (
    <div>
      <EmployeeTopbar />
      <div className="slidebar-main-div">
        <EmployeeSidebar />

        <div className="slidebar-main-div-right-section">
          <h1>Welcome, Employee Dashboard!</h1>
        </div>
      </div>
    </div>
  );
};

export default EmpDash;
