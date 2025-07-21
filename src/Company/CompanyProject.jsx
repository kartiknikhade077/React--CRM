import React from "react";
import CompanyTopbar from "./CompanyTopbar";
import CompanySidebar from "./CompanySidebar";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

const CompanyProject = () => {
  return (
    <>
      <CompanyTopbar />
      <div className="slidebar-main-div">
        <CompanySidebar />

        <div className="slidebar-main-div-right-section">
          <div className="Companalist-main-card">
            <div className="row m-0 p-0 w-100  d-flex justify-content-between">
              <div className="col-md-3 d-flex">
                <h2 className="">Project</h2>
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

export default CompanyProject;
