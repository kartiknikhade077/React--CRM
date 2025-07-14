import React, { useEffect, useState } from "react";
import axiosInstance from "../BaseComponet/axiosInstance";
import EmployeeTable from "./EmployeeTable";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { Link } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";


const AdminDashboard = () => {
  const [error, setError] = useState("");
  const [employeeData, setEmployeeData] = useState([]);
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null); // Store selected employee for edit
  const [isUpdateMode, setIsUpdateMode] = useState(false); // Track create/update mode

  const handleClose = () => setShow(false);
  const handleShow = (employee = null) => {
    setSelectedEmployee(employee);
    setIsUpdateMode(!!employee); // Set to update mode if employee data exists
    setShow(true);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get("/admin/getAllEmployees");
        setEmployeeData(response.data);
      } catch (err) {
        setError(err.response?.data || "Failed to fetch users");
      }
    };

    fetchUsers();
  }, []);

  // Handle form submission (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      if (isUpdateMode) {
        // Update Employee
        const response = await axiosInstance.post("/admin/updateEmployee", {
          ...selectedEmployee,
          ...data, // Merge changes
        });
        setMessage("Employee updated successfully!");
        setEmployeeData((prevData) =>
          prevData.map((emp) =>
            emp.cId === response.data.cId ? response.data : emp
          )
        );
      } else {
        // Create Employee
        const response = await axiosInstance.post("/admin/createEmployee", data);
        setMessage("Employee created successfully!");
        setEmployeeData((prevData) => [...prevData, response.data]);
      }

      handleClose();
    } catch (err) {
      setError(err.response?.data || "Failed to submit employee data");
    }
  };

  // This function is responsible for fetching the employee object based on the cId
  const getEmployee = (cId) => {
    // Find the employee object based on the cId
    const employee = employeeData.find((emp) => emp.cId === cId);
    handleShow(employee);  // Pass the found employee object to the handleShow function
  };

  return (
    <div>
      <AdminNavbar/>
      <h1>Admin Dashboard</h1>
      <h1>
          <Link to="/studenList">Student List</Link>
        </h1>
      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <Button variant="primary" onClick={() => handleShow()}>
        Add New Employee
      </Button>

      {/* Modal */}
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            {isUpdateMode ? "Update Employee" : "Add Employee"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Name</label>
              <input
                type="text"
                className="form-control"
                name="name"
                defaultValue={selectedEmployee?.name || ""}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Second Name</label>
              <input
                type="text"
                className="form-control"
                name="secondName"
                defaultValue={selectedEmployee?.secondName || ""}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Work</label>
              <input
                type="text"
                className="form-control"
                name="work"
                defaultValue={selectedEmployee?.work || ""}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Phone</label>
              <input
                type="text"
                className="form-control"
                name="phone"
                defaultValue={selectedEmployee?.phone || ""}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                name="email"
                defaultValue={selectedEmployee?.email || ""}
                required
              />
            </div>
            <Button type="submit" variant="primary">
              {isUpdateMode ? "Update Employee" : "Save Employee"}
            </Button>
          </form>
        </Modal.Body>
      </Modal>

      {/* EmployeeTable */}
      <EmployeeTable data={employeeData} getEmployee={getEmployee} />
    </div>
  );
};

export default AdminDashboard;
