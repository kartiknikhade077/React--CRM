import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CompanyNav from "./CompanyNavbar";
import axiosInstance from "../BaseComponet/axiosInstance";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { toast } from "react-toastify";
import CompanyTopbar from "./CompanyTopbar";
import CompanySidebar from "./CompanySidebar";
import PaginationComponent from "../Pagination/PaginationComponent";
const Department = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [show, setShow] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const handleCloseDepartment = () => {
    setShow(false);
    setIsEditMode(false);
    setSelectedDepartment(null);
  };

  const handleShowDepartment = () => {
    setShow(true);
  };

  useEffect(() => {
    fetchDepartment();
  }, [page, size]);

const fetchDepartment = async () => {
  try {
    const response = await axiosInstance.get(
      `/company/getDepartments/${page}/${size}`
    );

    const departmentList =
      response.data.departmentList || response.data.content || [];

    setDepartments(Array.isArray(departmentList) ? departmentList : []);
    setTotalPages(response.data.totalPages || response.data.totalPage || 1);
  } catch (error) {
    console.error("Error fetching departments:", error);
  }
};


  const fetchByDepartmentId = (departmentId) => {
    const dept = departments.find((d) => d.departmentId === departmentId);
    if (dept) {
      setSelectedDepartment(dept);
      setIsEditMode(true);
      setShow(true);
    }
  };

  const saveDepartment = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    data.companyId = 1;

    try {
      if (isEditMode && selectedDepartment) {
        data.departmentId = selectedDepartment.departmentId;
        await axiosInstance.put("/company/updateDepartment", data);
        toast.success("Department updated successfully!");
      } else {
        const response = await axiosInstance.post(
          "/company/createDepartment",
          data
        );
        setDepartments((prev) => [...prev, response.data]);
        toast.success("Department created successfully!");
      }

      fetchDepartment();
      handleCloseDepartment();
    } catch (error) {
      console.error("Error saving department:", error);
    }
  };

  return (
    <div>
      <CompanyTopbar />
      <div className="slidebar-main-div">
        <CompanySidebar />

        <div className="slidebar-main-div-right-section">
          <div className="Companalist-main-card">
            <div className="row m-0 p-0 w-100  d-flex justify-content-between">
              <div className="col-md-3 d-flex">
                <h2 className="">Department</h2>
              </div>

              <div className="col-md-3 d-flex justify-content-end">
                <Button
                  variant="btn btn-dark "
                  onClick={() => handleShowDepartment(false)}
                >
                  Create
                </Button>
              </div>
            </div>

            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Dept Name</th>
                  <th>Email</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {departments.length > 0 ? (
                  departments.map((dept) => (
                    <tr key={dept.departmentId}>
                      <td>{dept.departmentId}</td>
                      <td>{dept.departmentName}</td>
                      <td>{dept.departmentEmail}</td>

                      <td className="text-end">
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => fetchByDepartmentId(dept.departmentId)}
                        >
                          <i className="bi bi-pencil-square"></i> Edit
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center">
                      Department Not Set
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <Modal show={show} onHide={handleCloseDepartment}>
              <Modal.Header closeButton>
                <Modal.Title>
                  {isEditMode ? "Update Department" : "Create Department"}
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <form onSubmit={saveDepartment}>
                  <div className="mb-3">
                    <label className="form-label">Department Name</label>
                    <input
                      className="form-control"
                      name="departmentName"
                      required
                      defaultValue={selectedDepartment?.departmentName || ""}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Department Email</label>
                    <input
                      className="form-control"
                      name="departmentEmail"
                      required
                      defaultValue={selectedDepartment?.departmentEmail || ""}
                    />
                  </div>

                  <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseDepartment}>
                      Close
                    </Button>
                    <Button variant="primary" type="submit">
                      {isEditMode ? "Update" : "Create"}
                    </Button>
                  </Modal.Footer>
                </form>
              </Modal.Body>
            </Modal>
          </div>

          <div className="pagination-main-crd">
            <PaginationComponent
              currentPage={page}
              pageSize={size}
              pageCount={totalPages}
              onPageChange={(newPage) => setPage(newPage)}
              onPageSizeChange={(newSize) => {
                setSize(newSize);
                setPage(0); // reset to first page when size changes
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Department;
