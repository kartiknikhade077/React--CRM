import React, { useEffect, useState } from "react";
import CompanySidebar from "../CompanySidebar";
import CompanyTopbar from "../CompanyTopbar";
import PaginationComponent from "../../Pagination/PaginationComponent";
import Button from "react-bootstrap/Button";
import CompanyCreateTimesheet from "./CompanyCreateTimesheet";
import CompanyTimesheetFilter from "./CompanyTimesheetFilter";

const CompanyTimesheetList = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [pageCount, setPageCount] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const [filters, setFilters] = useState({});

  const handleFilterChange = (updatedFilters) => {
    setFilters(updatedFilters);
    // Filter table data here if needed
  };

  const handleClearFilter = () => {
    setFilters({});
  };

  return (
    <>
      <CompanyTopbar onToggle={handleToggle} />
      <div className="slidebar-main-div">
        <CompanySidebar isCollapsed={isCollapsed} />

        <div className="slidebar-main-div-right-section">
          <div className="Companalist-main-card">
            <div className="row m-0 p-0 w-100 d-flex justify-content-between mb-3">
              <div className="col-md-3">
                <h4>Timesheet</h4>
              </div>
              {/* <div className="col-md-3"></div> */}

              <div className="col-md-6 d-flex justify-content-end">
                <Button
                  className="btn btn-dark"
                  onClick={() => setShowModal(true)}
                >
                  Create
                </Button>
                <Button
                  variant="outline-primary"
                  className="me-2 ms-2"
                  onClick={() => setShowFilterModal(true)}
                >
                  Filter
                </Button>
              </div>
            </div>

            <CompanyTimesheetFilter
              onFilterChange={handleFilterChange}
              onClear={handleClearFilter}
            />
            <div className="table-main-div">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Date </th>
                    <th>Item No</th>
                    <th>Work Order No</th>
                    <th>Designer</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Toatal Time</th>
                    <th>Remarks</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            </div>
          </div>

          <div className="pagination-main-crd">
            <PaginationComponent
              currentPage={currentPage}
              pageSize={pageSize}
              pageCount={pageCount}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setCurrentPage(0);
                setPageSize(size);
              }}
            />
          </div>
        </div>
      </div>

      <CompanyCreateTimesheet
        show={showModal}
        handleClose={() => setShowModal(false)}
      />

      <CompanyTimesheetFilter
        show={showFilterModal}
        handleClose={() => setShowFilterModal(false)}
        onFilterChange={handleFilterChange}
        onClear={handleClearFilter}
      />
    </>
  );
};

export default CompanyTimesheetList;
