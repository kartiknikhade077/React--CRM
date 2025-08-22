import { useState } from "react";
import EmployeeSidebar from "../EmployeeSidebar";
import EmployeeTopbar from "../EmployeeTopbar";
import LeadsList from "../../Components/Lead/LeadList";

const LeadListEmp=()=>{
  const [isCollapsed, setIsCollapsed] = useState(false); // for toggle
  
  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleAccessFetched = (permissionData) => {
    console.log("🔹 Access Permission received in CustomerListEmp:", permissionData);
   localStorage.setItem("access", JSON.stringify(permissionData));
  };
 return(
       <>
      {/* Topbar */}
      <EmployeeTopbar onToggle={handleToggle} />
      <div className="slidebar-main-div">
        {/* sidebar */}
        <EmployeeSidebar isCollapsed={isCollapsed} onAccessFetched={handleAccessFetched} />
        <div className="slidebar-main-div-right-section">

         <LeadsList/>

        </div>
      </div>
    </>
 )

}

export default LeadListEmp;