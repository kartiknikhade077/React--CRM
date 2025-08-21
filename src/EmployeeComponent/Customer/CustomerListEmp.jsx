
import CustomerList from "../../Components/Customer/CustomerList";
import EmployeeTopbar from "../EmployeeTopbar";
import EmployeeSidebar from "../EmployeeSidebar";
import { useState } from "react";
const CustomerListEmp = () => {
  const [isCollapsed, setIsCollapsed] = useState(false); // for toggle
  
  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleAccessFetched = (permissionData) => {
    console.log("🔹 Access Permission received in CustomerListEmp:", permissionData);
   localStorage.setItem("access", JSON.stringify(permissionData));
  };
  return (
    <>
      {/* Topbar */}
      <EmployeeTopbar onToggle={handleToggle} />
      <div className="slidebar-main-div">
        {/* sidebar */}
        <EmployeeSidebar isCollapsed={isCollapsed} onAccessFetched={handleAccessFetched} />
        <div className="slidebar-main-div-right-section">

          <CustomerList />

        </div>
      </div>
    </>
  )

}
export default CustomerListEmp;