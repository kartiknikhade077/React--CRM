import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CompanyNav from "./CompanyNavbar"
import axiosInstance from "../BaseComponet/axiosInstance";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

const Department = () => {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [departments, setDepartments] = useState([]);
    const [show, setShow] = useState(false);

    const handleCloseDepartment = () => setShow(false);
    const handleShowDeptartment = () => setShow(true);



    useEffect(() => {
        fetchDepartment();
    });

    const fetchDepartment = async () => {
        try {
            const response = await axiosInstance.get(`company/getDepartments`);
            setDepartments(response.data);
        } catch (error) {
            console.error("Failed to fetch employees:", error);
        }
    };

    const saveDepartment = async (e) => {
        e.preventDefault(); // Prevent form from refreshing the page
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        console.log(data); // Print form data to the console

        try {
            const response = await axiosInstance.post("/company/createDepartment", data);
            setDepartments((prev) => [...prev, response.data]);

            handleCloseDepartment(); // Close the modal after saving
        } catch (error) {
            console.error("Error creating employee:", error);
        }
    };


    return (
        <div >
            <CompanyNav />
            <h2 className="mb-3">Department List</h2>
            <Button variant="primary" onClick={handleShowDeptartment}>
                Launch demo modal
            </Button>
            <table className="table table-bordered table-striped">
                <thead className="table-dark">
                    <tr>
                        <th>ID</th>
                        <th>Dept Name</th>
                        <th>Email</th>

                    </tr>
                </thead>
                <tbody>
                    {departments.length > 0 ? (
                        departments.map(dept => (
                            <tr key={dept.departmentId}>
                                <td>{dept.departmentId}</td>
                                <td>{dept.departmentName}</td>
                                <td>{dept.departmentEmail}</td>


                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="text-center">Department Not Set</td>
                        </tr>
                    )}
                </tbody>
            </table>



            <Modal show={show} onHide={handleCloseDepartment}>
                <Modal.Header closeButton>
                    <Modal.Title>Modal heading</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={saveDepartment}>
                        <div className="mb-3">
                            <label className="form-label">Department Name</label>
                            <input className="form-control" name="departmentName" required />
                        </div>
                        <div>
                            <label className="form-label">Deparment Email</label>
                            <input className="form-control" name="departmentEmail" required />
                        </div>

                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleCloseDepartment}>
                                Close
                            </Button>
                            <Button variant="primary" type="submit">
                                Save Changes
                            </Button>
                        </Modal.Footer>
                    </form>
                </Modal.Body>

            </Modal>

        </div>

    );
};

export default Department;
