import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EmployeeNav from "./EmployeeNavBar";

import EmployeeSidebar from "./EmployeeSidebar";
import EmployeeTopbar from "./EmployeeTopbar";

const EmpDash = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false); // for toggle

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
  };
  return (
    <div>
      <EmployeeTopbar onToggle={handleToggle} />
      <div className="slidebar-main-div">
        <EmployeeSidebar isCollapsed={isCollapsed} />

        <div className="slidebar-main-div-right-section">
          <h1>Welcome, Employee Dashboard!</h1>
        </div>
      </div>
    </div>
  );
};

export default EmpDash;
