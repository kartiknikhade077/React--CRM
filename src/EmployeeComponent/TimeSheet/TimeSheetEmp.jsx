import EmployeeTopbar from "../EmployeeTopbar";
import EmployeeSidebar from "../EmployeeSidebar";
import { useState } from "react";
import TimeSheetList from "../../Components/TimeSheet/TimeSheetList";
const TimeSheetEmp=()=>{
    const [isCollapsed, setIsCollapsed] = useState(false); // for toggle
   
    const handleToggle = () => {
        setIsCollapsed(!isCollapsed);
    };

    const handleAccessFetched = (permissionData) => {
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

                   <TimeSheetList/>

                </div>
            </div>
        </>
    )
}

export default TimeSheetEmp;