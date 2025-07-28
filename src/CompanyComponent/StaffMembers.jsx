import React, { useState } from "react";
import CompanyTopbar from "./CompanyTopbar";
import CompanySidebar from "./CompanySidebar";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";



const StaffMembers = () => {

  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
  };
  return (
    <>
      <CompanyTopbar onToggle={handleToggle} />
      <div className="slidebar-main-div">
        <CompanySidebar isCollapsed={isCollapsed} />

        <div className="slidebar-main-div-right-section">
          <div className="Companalist-main-card">
            <div className="row m-0 p-0 w-100  d-flex justify-content-between">
              <div className="col-md-3 d-flex">
                <h2 className="">Staff</h2>
              </div>

              <div className="col-md-3 d-flex justify-content-end">
                <Button
                  variant="btn btn-dark "
                  //   onClick={() => handleShowDepartment(false)}
                >
                  Create
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StaffMembers;
