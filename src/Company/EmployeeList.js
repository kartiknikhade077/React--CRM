import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CompanyNavbar from "./CompanyNavbar";
import axiosInstance from "../BaseComponet/axiosInstance";
import { toast } from "react-toastify";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap/dist/js/bootstrap.bundle.min.js";
import CompanySidebar from "./CompanySidebar";
import CompanyTopbar from "./CompanyTopbar";

import PaginationComponent

from "../Pagination/PaginationComponent";

const EmployeeList = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [employees, setEmployees] = useState([]);




  const [emailError, setEmailError] = useState("");
  const [allEmployees, setAllEmployees] = useState([]); // store full list

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [pageCount, setPageCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState("");

  const defaultFormData = {
    name: "",
    email: "",
    password: "",
    phone: "",
    department: "",
    role: "",
    gender: "",
    description: "",
    leadAccess: false,
    templateAccess: false,
    emailAccess: false,
  };
  const [formData, setFormData] = useState(defaultFormData);

useEffect(() => {
  fetchEmployees();
}, [currentPage, pageSize]);

const fetchEmployees = async () => {
  try {
    const response = await axiosInstance.get(
      `/company/getEmployeeList/${currentPage}/${pageSize}`
    );

     const fetchedEmployees = response.data.content || response.data;

    // Adjust according to your API structure
    setEmployees(response.data.content || response.data);
    setPageCount(response.data.totalPages || 1);

      console.log("Employee List:", fetchedEmployees);

  } catch (error) {
    console.error("Failed to fetch employees:", error);
    toast.error("Failed to fetch employees");
  }
};


  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axiosInstance.get("/company/getDepartments");
        setDepartments(res.data);
      } catch (err) {
        toast.error("Failed to load departments");
      }
    };

    fetchDepartments();
  }, []);


  const handleDepartmentChange = async (e) => {
    const departmentId = e.target.value;
    setSelectedDepartmentId(departmentId);

    const selectedDept = departments.find(
      (d) => d.departmentId.toString() === departmentId
    );

    setFormData((prev) => ({
      ...prev,
      department: selectedDept?.departmentName || "",
      role: "", // reset role
    }));

    try {
      const res = await axiosInstance.get(
        `/company/getRolesByDepartmentId/${departmentId}`
      );
      setRoles(res.data);
    } catch (err) {
      toast.error("Failed to load roles for this department");
    }
  };

  const handleRoleChange = async (e) => {
    const roleId = e.target.value;
    setSelectedRoleId(roleId);

    const selectedRole = roles.find((r) => r.roleId.toString() === roleId);

    setFormData((prev) => ({
      ...prev,
      role: selectedRole?.roleName || "",
    }));

    try {
      const res = await axiosInstance.get(
        `/company/getRolesByRoleId/${roleId}`
      );
      const data = res.data;

      // Set default access from role
      setFormData((prev) => ({
        ...prev,
        leadAccess: data.leadAccess,
        templateAccess: data.templateAccess,
        emailAccess: data.emailAccess,
      }));
    } catch (err) {
      toast.error("Failed to load role access");
    }
  };

  // For search Console
  const searchEmployees = async (term) => {
    try {
      const response = await axiosInstance.get(
        `/company/getEmployeeList/0/1000?name=${term}`
      );
      const data = response.data ?? [];

      setAllEmployees(data);
      setEmployees(data.slice(0, pageSize));
      setPageCount(Math.ceil(data.length / pageSize));
      setCurrentPage(0);
    } catch (error) {
      console.error("Error searching companies:", error);
      toast.error("Failed to search companies");
    }
  };

  //    form code
  const checkEmailDuplicate = async (email) => {
    try {
      const response = await axiosInstance.get(
        `/company/checkDuplicateEmail/${email}`
      );
      return response.data; // true = unique, false = already exists
    } catch (err) {
      console.error("Error checking duplicate email", err);
      return false;
    }
  };

  const handleInputChange = async (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "email") {
      setFormData({ ...formData, email: value });

      if (value.trim() !== "") {
        try {
          const token = localStorage.getItem("token");

          const response = await axiosInstance.get(
            `/company/checkDuplicateEmail/${value}`
          );

          const isUnique = response.data;
          console.log("isUnique:", isUnique);

          if (!isUnique) {
            setEmailError("Email already exists.");
          } else {
            setEmailError("");
          }
        } catch (err) {
          console.error("Error checking email:", err);
          setEmailError("Error checking email.");
        }
      } else {
        setEmailError("");
      }

      return;
    }

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check duplicate email
    const isEmailUnique = await checkEmailDuplicate(formData.email);
    if (!isEmailUnique) {
      toast.error("❌ Email already exists. Please use a different one.");
      return;
    }

    try {
      const payload = {
        ...formData,
        departmentId: selectedDepartmentId, // ✅ Add this
        roleId: selectedRoleId, // ✅ Add this
        tempalteAccess: formData.templateAccess, // match typo in backend
      };
      delete payload.templateAccess; // remove correct key since backend uses typo

      console.log("Submitted payload:", payload);

      await axiosInstance.post("/company/createEmployee", payload);
      toast.success("✅ Employee created successfully");

      // Reset
      setFormData(defaultFormData);
      setSelectedDepartmentId("");
      setSelectedRoleId("");

      document.querySelector("#createEmployeeModal .btn-close")?.click();
      fetchEmployees();
    } catch (error) {
      console.error("Error creating employee:", error);
      toast.error("❌ Failed to create employee. See console for details.");
    }
  };

  const handleUpdate = (emp) => {
    navigate(`/UpdateEmployeeList/${emp.employeeId}`, {
      state: { emp },
    });
  };

  return (
    <div>
      <CompanyTopbar />
      <div className="slidebar-main-div">
        <CompanySidebar />

        <div className="slidebar-main-div-right-section">
          <div className="Companalist-main-card">
            <div className="row m-0 p-0 w-100 d-flex justify-content-between mb-2">
              <div className="col-md-3">
                <h4>Employee List</h4>
              </div>
              <div className="col-md-3">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <i className="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => {
                      const term = e.target.value;
                      setSearchTerm(term);
                      searchEmployees(term);
                    }}
                  />
                </div>
              </div>
              <div className="col-md-3 d-flex justify-content-end">
                <button
                  className="btn btn-dark mb-2"
                  data-bs-toggle="modal"
                  data-bs-target="#createEmployeeModal"
                >
                  Create Employee
                </button>
              </div>
            </div>

            {/* Modal */}
            <div
              className="modal fade"
              id="createEmployeeModal"
              tabIndex="-1"
              aria-labelledby="createEmployeeModalLabel"
              aria-hidden="true"
            >
              <div className="modal-dialog">
                <form onSubmit={handleSubmit}>
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title" id="createEmployeeModalLabel">
                        Create Employee
                      </h5>
                      <button
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="modal"
                        aria-label="Close"
                      />
                    </div>
                    <div className="modal-body">
                      <div className="mb-3">
                        <label className="form-label">Employee Name</label>
                        <input
                          type="text"
                          name="name"
                          className="form-control"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          name="email"
                          className={`form-control ${
                            emailError ? "is-invalid" : ""
                          }`}
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                        {emailError && (
                          <div className="invalid-feedback">{emailError}</div>
                        )}
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input
                          type="password"
                          name="password"
                          className="form-control"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Phone Number</label>
                        <input
                          type="number"
                          name="phone"
                          className="form-control"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Department</label>
                        <select
                          className="form-select"
                          value={selectedDepartmentId}
                          onChange={handleDepartmentChange}
                          required
                        >
                          <option value="">-- Select Department --</option>
                          {departments.map((dept) => (
                            <option
                              key={dept.departmentId}
                              value={dept.departmentId}
                            >
                              {dept.departmentName}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Role</label>
                        <select
                          className="form-select"
                          value={selectedRoleId}
                          onChange={handleRoleChange}
                          required
                        >
                          <option value="">-- Select Role --</option>
                          {roles.map((role) => (
                            <option key={role.roleId} value={role.roleId}>
                              {role.roleName}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Gender</label>
                        <select
                          className="form-select"
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">-- Select Gender --</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Description</label>
                        <textarea
                          name="description"
                          className="form-control"
                          value={formData.description}
                          onChange={handleInputChange}
                          rows={2}
                        />
                      </div>

                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="leadAccess"
                          checked={formData.leadAccess}
                          onChange={handleInputChange}
                        />
                        <label className="form-check-label">Lead Access</label>
                      </div>

                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="templateAccess" // ✅ must match exactly
                          checked={formData.templateAccess}
                          onChange={handleInputChange}
                        />
                        <label className="form-check-label">
                          Template Access
                        </label>
                      </div>

                      <div className="form-check mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="emailAccess"
                          checked={formData.emailAccess}
                          onChange={handleInputChange}
                        />
                        <label className="form-check-label">Email Access</label>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button type="submit" className="btn btn-success">
                        Save
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        data-bs-dismiss="modal"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Department</th>
                  <th>Gender</th>
                  <th className="text-end">Update</th>
                </tr>
              </thead>
              <tbody>
                {employees.length > 0 ? (
                  employees.map((emp) => (
                    <tr key={emp.employeeId}>
                      <td>{emp.name}</td>
                      <td>{emp.email}</td>
                      <td>{emp.phone}</td>
                      <td>{emp.department}</td>
                      <td>{emp.gender}</td>
                      <td className="text-end">
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => handleUpdate(emp)}
                        >
                          <i className="bi bi-pencil-square"></i> Edit
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No employees found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination-main-crd">
            <PaginationComponent
              currentPage={currentPage}
              pageSize={pageSize}
              pageCount={pageCount}
              onPageChange={(newPage) => setCurrentPage(newPage)}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(0); // reset to first page
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeList;
