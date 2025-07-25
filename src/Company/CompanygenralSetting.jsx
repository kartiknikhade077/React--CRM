import React from "react";
import CompanySidebar from "./CompanySidebar";
import CompanyTopbar from "./CompanyTopbar";
import Button from "react-bootstrap/Button";
import { toast } from "react-toastify";
const CompanygenralSetting = () => {
  return (
    <>
      <CompanyTopbar />
      <div className="slidebar-main-div d-flex">
        <CompanySidebar />

        <div className="slidebar-main-div-right-section p-4 w-100">
          <div className="Companalist-main-card mb-4">
            <div className="row m-0 p-0 w-100 justify-content-between">
              <div className="col-md-6 d-flex align-items-center">
                <h2>Genral Settings</h2>
              </div>
              <div className="col-md-6 d-flex justify-content-end"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CompanygenralSetting;
