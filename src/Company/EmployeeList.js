import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CompanyNav from "./CompanyNavbar"
import axiosInstance from "../BaseComponet/axiosInstance";

const Company = () => {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [employees, setEmployees] = useState([]);
    const [page, setPage] = useState(0);
    const [size] = useState(5); // Items per page
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        fetchEmployees();
    }, [page]);

    const fetchEmployees = async () => {
        try {
            const response = await axiosInstance.get(`company/getEmployeeList/${page}/${size}`);
            setEmployees(response.data);
        } catch (error) {
            console.error("Failed to fetch employees:", error);
        }
    };




    return (
        <div >
            <CompanyNav />
            <h2 className="mb-3">Employee List</h2>
            <table className="table table-bordered table-striped">
                <thead className="table-dark">
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Department</th>
                        <th>Gender</th>
                    </tr>
                </thead>
                <tbody>
                    {employees.length > 0 ? (
                        employees.map(emp => (
                            <tr key={emp.employeeId}>
                                <td>{emp.employeeId}</td>
                                <td>{emp.name}</td>
                                <td>{emp.email}</td>
                                <td>{emp.phone}</td>
                                <td>{emp.department}</td>
                                <td>{emp.gender}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="text-center">No employees found</td>
                        </tr>
                    )}
                </tbody>
            </table>
            {/* Pagination Controls */}
      <div className="d-flex justify-content-between">
  <button
    className="btn btn-primary"
    onClick={() => setPage(prev => (prev > 0 ? prev - 1 : 0))}
  >
    Previous
  </button>

  <span className="align-self-center">
    Page {page + 1} of {totalPages}
  </span>

  <button
    className="btn btn-primary"
    onClick={() => setPage(prev => prev + 1)}
  >
    Next
  </button>
</div>
    </div>
    
    );
};

export default Company;
