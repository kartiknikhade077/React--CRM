import React, { useState, useEffect } from "react";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import axiosInstance from "../BaseComponet/axiosInstance";
import AdminNavbar from "./AdminNavbar";
import Form from 'react-bootstrap/Form';


function StudentList() {
  const [show, setShow] = useState(false);
  const [studentUpdateModel, updateStudent] = useState(false);
  const [students, setStudents] = useState([]); // State to store students
  const [selectedStudent, setSelectedStudent] = useState(null); // State for selected student

  const CloseModel = () => setShow(false);
  const ShowModel = () => setShow(true);

  const closeUpdateStudentModel = () => updateStudent(false);
  const openUpdateStudentModel = (student) => {
    setSelectedStudent(student);
    updateStudent(true);
  };
  // Fetch all students from API
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axiosInstance.get("/admin/getAllStudent");
        setStudents(response.data); // Update students state with API data
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    fetchStudents();
  }, []); // Run once on component mount

  const saveStudent = async (e) => {
    e.preventDefault(); // Prevent form from refreshing the page
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    console.log(data); // Print form data to the console

    try {
      const response = await axiosInstance.post("/admin/addStudent", data);
      setStudents((prev) => [...prev, response.data]);
      console.log(response.data); // Log the response from the API
      CloseModel(); // Close the modal after saving
    } catch (error) {
      console.error("Error creating employee:", error);
    }
  };

  const searchStudent = async (e) => {
    const name = e.target.value; // Get the input value from the event
    console.log(name);
  
    try {
      // Send the search request with the input value
      const response = await axiosInstance.get(`/admin/searchStudent`, {
        params: { name },
      });
  
      // Update the state with the returned student list
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };


  const updateStudentData = async (e) => {
    e.preventDefault(); // Prevent form from refreshing the page
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    console.log(data); // Print form data to the console

    try {
      const response = await axiosInstance.put(`/admin/updateStudent`, data);
      setStudents((prev) =>
        prev.map((student) =>
          student.id === selectedStudent.id ? response.data : student
        )
      );
      console.log(response.data); // Log the response from the API
      closeUpdateStudentModel(); // Close the modal after updating
    } catch (error) {
      console.error("Error updating student:", error);
    }
  };

  return (
    <div>
      <AdminNavbar />
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="m-0">Student List</h1>
        <Form className="d-flex">
  <Form.Control
    type="search"
    placeholder="Search Student"
    className="me-2"
    aria-label="Search"
    onKeyUp={searchStudent} // Pass the function reference, not the invocation
  />
</Form>
        <Button className="m-1" variant="primary" onClick={ShowModel}>
          Add Student
        </Button>
      </div>

      <>
        <Modal show={show} onHide={CloseModel}>
          <Modal.Header closeButton>
            <Modal.Title>Modal heading</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={saveStudent}>
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input className="form-control" name="name" required />
              </div>
              <div>
                <label className="form-label">City</label>
                <input className="form-control" name="city" required />
              </div>
              <div>
                <label className="form-label" >Age</label>
                <input className="form-control" name="age" type="number" required />
              </div>
              <Modal.Footer>
                <Button variant="secondary" onClick={CloseModel}>
                  Close
                </Button>
                <Button variant="primary" type="submit">
                  Save Changes
                </Button>
              </Modal.Footer>
            </form>
          </Modal.Body>
        </Modal>
      </>

      {/* Student Update ShowModel */}
      <>
        <Modal show={studentUpdateModel} onHide={closeUpdateStudentModel}>
          <Modal.Header closeButton>
            <Modal.Title>Update Student</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedStudent && (
              <form onSubmit={updateStudentData}>
                <div className="mb-3" hidden>
                  <label className="form-label">id</label>
                  <input
                    className="form-control"
                    name="id"
                    defaultValue={selectedStudent.id}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    className="form-control"
                    name="name"
                    defaultValue={selectedStudent.name}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">City</label>
                  <input
                    className="form-control"
                    name="city"
                    defaultValue={selectedStudent.city}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Age</label>
                  <input
                    className="form-control"
                    name="age"
                    type="number"
                    defaultValue={selectedStudent.age}
                    required
                  />
                </div>
                <Modal.Footer>
                  <Button variant="secondary" onClick={closeUpdateStudentModel}>
                    Close
                  </Button>
                  <Button variant="primary" type="submit">
                    Save Changes
                  </Button>
                </Modal.Footer>
              </form>
            )}
          </Modal.Body>
        </Modal>
      </>

      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>#</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Username</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <tr key={student.id}>
              <td>{index + 1}</td>
              <td>{student.name}</td>
              <td>{student.city}</td>
              <td>{student.age}</td>
              <td>
                <Button onClick={() => openUpdateStudentModel(student)}>
                  Edit
                </Button>
              </td>

            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default StudentList;
