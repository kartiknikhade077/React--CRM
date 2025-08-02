import React, { useEffect, useState } from "react";
import CompanySidebar from "../CompanySidebar";
import CompanyTopbar from "../CompanyTopbar";
import PaginationComponent from "../../Pagination/PaginationComponent";
import Button from "react-bootstrap/Button";
import { useNavigate } from "react-router-dom";

const KickOffList = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [pageCount, setPageCount] = useState(0);

  const navigate = useNavigate(); // ✅ useNavigate hook

  const handleCreateClick = () => {
    navigate("/KickOffCreate"); // ✅ navigate on button click
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
                <h4>Kickoff List</h4>
              </div>
              {/* <div className="col-md-3"></div> */}

              <div className="col-md-6 d-flex justify-content-end">
                <Button className="btn btn-dark" onClick={handleCreateClick}>
                  Create
                </Button>
                <Button variant="outline-primary" className="me-2 ms-2">
                  Filter
                </Button>
              </div>
            </div>
            <div className="table-main-div">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>NO </th>
                    <th>Customer No</th>
                    <th>Project</th>
                    <th>part No</th>
                    <th>KickoffDate</th>
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
    </>
  );
};

export default KickOffList;
