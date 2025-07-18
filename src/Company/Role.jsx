import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../BaseComponet/axiosInstance";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import CompanyTopbar from "./CompanyTopbar";
import CompanySidebar from "./CompanySidebar";
import PaginationComponent from "../Pagination/PaginationComponent";
const RoleModel = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [roles, setRoles] = useState([]);
  const [page, setPage] = useState(0);
  // const [size] = useState(5); // Items per page
  const [totalPages, setTotalPages] = useState(0);
  const [show, setShow] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [size, setSize] = useState(5);

  const [selectedRole, setSelectedRole] = useState({
    roleId: "",
    departmentId: "",
    roleName: "",
    templateAccess: false,
    emailAccess: false,
    leadAccess: false,
  });

  useEffect(() => {
    fetchRoles();
  }, [page, size]); // ✅ so data fetches again when page size changes

  const handleCloseRoleModel = () => setShow(false);
  const handleShowRoleModel = (edit = false) => {
    setShow(true);
    fetchDepartment();
    setEditMode(edit);
  };

  const fetchDepartment = async () => {
    try {
      const response = await axiosInstance.get(`company/getDepartments`);
      setDepartments(response.data);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axiosInstance.get(
        `company/getRoleByCompanyId/${page}/${size}`
      );
      setRoles(response.data.roles);
      // setTotalPages(response.data.totolPages);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
    }
  };

  const saveRole = async (e) => {
    e.preventDefault(); // Prevent form from refreshing the page
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      if (editMode) {
        // Ensure roleId is sent for update
        await axiosInstance.put("/company/updateRole", data);
      } else {
        await axiosInstance.post("/company/createRole", data);
      }

      await fetchRoles(); // Refresh role list
      handleCloseRoleModel(); // Close modal
    } catch (error) {
      console.error("Error saving role:", error);
    }
  };

  const fetchByRoleId = async (roleId) => {
    console.log("Fetching role with ID:", roleId);

    try {
      const response = await axiosInstance.get(
        `/company/getRolesByRoleId/${roleId}`
      );
      const role = response.data;
      setSelectedRole({
        roleId: role.roleId,
        departmentId: role.departmentId,
        roleName: role.roleName,
        templateAccess: role.templateAccess,
        emailAccess: role.emailAccess,
        leadAccess: role.leadAccess,
      });
      handleShowRoleModel(true);

      // Do something with the data, like show modal or fill a form
    } catch (error) {
      console.error("Failed to fetch role:", error);
    }
  };

  return (
    <div>
      <CompanyTopbar />
      <div className="slidebar-main-div">
        <CompanySidebar />

        <div className="slidebar-main-div-right-section">
          <h2 className="mb-3">Roles List</h2>

          <div className="Companalist-main-card">
            <div className="row m-0 p-0 w-100">
              <div className="col-md-12 d-flex justify-content-end">
                <Button
                  variant="btn btn-dark "
                  onClick={() => handleShowRoleModel(false)}
                >
                  Create Role
                </Button>
              </div>
            </div>

            <table className="table table-hover align-middle mt-2">
              <thead className="table-light">
                <tr>
                  <th>Role Name</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {roles.length > 0 ? (
                  roles.map((role) => (
                    <tr key={role.roleId}>
                      <td>{role.roleName}</td>
                      <td className="text-center">
                        {" "}
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => fetchByRoleId(role.roleId)}
                        >
                          <i className="bi bi-pencil-square"></i> Edit
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No Roles found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <PaginationComponent
              currentPage={page}
              pageSize={size}
              pageCount={totalPages}
              onPageChange={(newPage) => setPage(newPage)}
              onPageSizeChange={(newSize) => {
                setSize(newSize);
                setPage(0); // Reset to first page when size changes
              }}
            />

            {/* Pagination Controls */}
            {/* <div className="d-flex justify-content-between">
              <button
                className="btn btn-primary"
                onClick={() => setPage((prev) => (prev > 0 ? prev - 1 : 0))}
              >
                Previous
              </button>

              <span className="align-self-center">
                Page {page + 1} of {totalPages}
              </span>

              <button
                className="btn btn-primary"
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next
              </button>
            </div> */}
          </div>
          <Modal
            show={show}
            onHide={handleCloseRoleModel}
            dialogClassName="right"
            className="modal right fade"
            backdrop="static"
            keyboard={false}
          >
            <Modal.Header closeButton>
              <Modal.Title>Modal heading</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <form onSubmit={saveRole}>
                <div className="mb-3">
                  <input
                    type="hidden"
                    name="roleId"
                    value={selectedRole.roleId || ""}
                  />
                  <label className="form-label">Department Name</label>
                  <select
                    className="form-control"
                    name="departmentId"
                    value={selectedRole.departmentId}
                    onChange={(e) =>
                      setSelectedRole((prev) => ({
                        ...prev,
                        departmentId: e.target.value,
                      }))
                    }
                    required
                  >
                    <option value="">Select a department</option>
                    {departments.map((dept) => (
                      <option key={dept.departmentId} value={dept.departmentId}>
                        {dept.departmentName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Role Name</label>
                  <input
                    className="form-control"
                    name="roleName"
                    required
                    defaultValue={selectedRole.roleName || ""}
                  />
                </div>

                {/* Checkboxes */}
                <div className="mb-3 mt-2">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="templateAccess"
                      value="true"
                      defaultChecked={selectedRole.templateAccess}
                    />
                    <label className="form-check-label">Template Access</label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="emailAccess"
                      value="true"
                      defaultChecked={selectedRole.emailAccess}
                    />
                    <label className="form-check-label">Email Access</label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="leadAccess"
                      value="true"
                      defaultChecked={selectedRole.leadAccess}
                    />
                    <label className="form-check-label">Lead Access</label>
                  </div>
                </div>

                <Modal.Footer>
                  <Button variant="secondary" onClick={handleCloseRoleModel}>
                    Close
                  </Button>
                  <Button variant="primary" type="submit">
                    {editMode ? "Update Role" : "Create Role"}
                  </Button>
                </Modal.Footer>
              </form>
            </Modal.Body>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default RoleModel;
