import React, { useEffect, useState } from "react";
import PaginationComponent from "../../Pagination/PaginationComponent";
import Button from "react-bootstrap/Button";
import CompanyCreateTimesheet from "../../CompanyComponent/Timesheet/CompanyCreateTimesheet";
import CompanyTimesheetFilter from "../../CompanyComponent/Timesheet/CompanyTimesheetFilter";
import axiosInstance from "../../BaseComponet/axiosInstance";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CompanyUpdateTimesheet from "../../CompanyComponent/Timesheet/CompanyUpdateTimesheet";

const TimeSheetList = () => {
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

  const [timesheetData, setTimesheetData] = useState([]);

  const [selectedTimesheet, setSelectedTimesheet] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const [designerList, setDesignerList] = useState([]); // For filter dropdown
  const [itemNumberList, setItemNumberList] = useState([]);
  const [workOrderList, setWorkOrderList] = useState([]);
  const [access,setAccess]=useState({})
 
  const handleFilterChange = (updatedFilters) => {
    setFilters(updatedFilters);
    // Filter table data here if needed
  };



  const downloadExcel = async () => {
    try {
      const response = await axiosInstance.get("/timesheet/exportTimeSheet", {
        params: {
          designer: filters.designer || "",
          startDate: filters.startDate || "",
          endDate: filters.endDate || "",
          itemNumber: filters.itemNumber || "",
          workOrderNumber: filters.workOrder || "",
        },

        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "timesheet.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Excel download failed:", error);
    }
  };

  // Fetch Designer list for Filter
  const fetchDropdownData = async () => {
    try {
      // Fetch designers
      const designerRes = await axiosInstance.get(
        "/company/getEmployeeList/0/1000"
      );
      const designers =
        designerRes.data.employeeList?.map((emp) => emp.name) || [];
      setDesignerList(designers);

      // Fetch item numbers
      // const itemRes = await axiosInstance.get("/timesheet/getItemNumbers");
      // setItemNumberList(itemRes.data || []);

      // Fetch work orders
      // const workOrderRes = await axiosInstance.get("/timesheet/getWorkOrders");
      // setWorkOrderList(workOrderRes.data || []);
    } catch (error) {
      console.error("Error fetching filter dropdown data:", error);
    }
  };

  const fetchTimesheetData = async () => {
    try {
      const response = await axiosInstance.get(
        `/timesheet/getAllTimeSheets/${currentPage}/${pageSize}`,
        {
          params: {
            designer: filters.designer || "",
            startDate: filters.startDate || "",
            endDate: filters.endDate || "",
            itemNumber: filters.itemNumber || "",
            workOrderNumber: filters.workOrder || "",
          },
        }
      );

      // setTimesheetData(response.data.timeSheetList || []);
      const data = response.data.timeSheetList || [];
      setTimesheetData(data);
      setPageCount(response.data.totalPages || 0);

      // Extract unique Designers, Item Numbers, and Work Orders
      // const designers = [
      //   ...new Set(data.map((item) => item.designerName)),
      // ].filter(Boolean);
      // const itemNumbers = [
      //   ...new Set(data.map((item) => item.itemNumber)),
      // ].filter(Boolean);
      // const workOrders = [
      //   ...new Set(data.map((item) => item.workOrderNo)),
      // ].filter(Boolean);

      // setDesignerList(designers);
      // setItemNumberList(itemNumbers);
      // setWorkOrderList(workOrders);
    } catch (error) {
      console.error("Error fetching timesheet data:", error);
    }
  };

  useEffect(() => {
    fetchTimesheetData();


  }, [currentPage, pageSize, filters]);

  // Load designer list once
  useEffect(() => {
    const access = JSON.parse(localStorage.getItem("access"));
    setAccess(access)
    fetchDropdownData();
  }, []);

  return (
    <>
     

        <div className="slidebar-main-div-right-section">
          <div className="Companalist-main-card">
            <div className="row m-0 p-0 w-100 d-flex justify-content-between mb-3">
              <div className="col-md-3">
                <h4>Timesheet</h4>
              </div>
              {/* <div className="col-md-3"></div> */}

              <div className="col-md-6 d-flex justify-content-end">
               {access.timeSheetCreate &&( <Button
                  className="btn btn-dark"
                  onClick={() => setShowModal(true)}
                >
                  Create
                </Button>
               )}
                <Button
                  variant="outline-primary"
                  className="me-2 ms-2"
                  onClick={() => downloadExcel()}
                >
                  Export
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
                    <th>Total Time</th>
                    <th>Remarks</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {timesheetData.length > 0 ? (
                    timesheetData.map((sheet, index) => (
                      <tr key={index}>
                        <td>{sheet.createDate}</td>
                        <td>{sheet.itemNumber}</td>
                        <td>{sheet.workOrderNo}</td>
                        <td>{sheet.designerName}</td>
                        <td>{sheet.startTime}</td>
                        <td>{sheet.endTime}</td>
                        <td>{sheet.totalTime}</td>
                        <td>{sheet.remarks}</td>
                        <td>
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => {
                              setSelectedTimesheet(sheet);
                              setShowUpdateModal(true);
                            }}
                          >
                            <i className="bi bi-pencil-square"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center">
                        No data found
                      </td>
                    </tr>
                  )}
                </tbody>
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
      

      <CompanyCreateTimesheet
        show={showModal}
        handleClose={() => setShowModal(false)}
        onSuccess={() => {
          fetchTimesheetData();
          setShowModal(false);
        }}
        showToast={toast}
      />
      <CompanyTimesheetFilter
        show={showFilterModal}
        handleClose={() => setShowFilterModal(false)}
        onFilterChange={(updatedFilters) => setFilters(updatedFilters)}
        onClear={() => setFilters({})}
        designers={designerList}
        itemNumbers={itemNumberList}
        workOrders={workOrderList}
        activeFilters={filters}
      />

      <CompanyUpdateTimesheet
        show={showUpdateModal}
        handleClose={() => setShowUpdateModal(false)}
        timeSheetId={selectedTimesheet?.timeSheetId}
        timesheetData={selectedTimesheet} // optional if needed later
        onSuccess={() => {
          fetchTimesheetData();
          setShowUpdateModal(false);
        }}
      />
    </>
  );
};

export default TimeSheetList;
