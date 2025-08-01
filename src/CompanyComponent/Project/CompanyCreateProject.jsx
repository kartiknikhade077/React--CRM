import React, { useEffect, useState } from "react";
import { Modal, Button, Form , Row, Col, Dropdown } from "react-bootstrap";

import { toast } from "react-toastify";
import axiosInstance from "../../BaseComponet/axiosInstance";


const CompanyCreateProject = ({ show, onClose, onProjectCreated }) => {
  const [employeeList, setEmployeeList] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [currentPage] = useState(0);
  const [pageSize] = useState(100);

  const [searchTerm, setSearchTerm] = useState("");

  const [customerList, setCustomerList] = useState([]);
  const [searchTermCustomer, setSearchTermCustomer] = useState("");

  const [formData, setFormData] = useState({
    projectName: "",
    customerid: "",
    billingType: "",
    projectStatus: "Not Started",
    projectEstimate: "",
    estimateHours: "",
    startDate: "",
    endDate: "",
    createdDate: new Date().toISOString().split("T")[0],
    description: "",
    projectMembers: "",
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axiosInstance.get(
          `/company/getEmployeeList/${currentPage}/${pageSize}`
        );

        // ✅ FIX: Use employeeList instead of content
        setEmployeeList(response.data.employeeList || []);
      } catch (error) {
        console.error("Failed to fetch employees:", error);
        setEmployeeList([]);
      }
    };

    fetchEmployees();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e, emp) => {
    const id = emp.employeeId;
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((empId) => empId !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    const finalData = {
      ...formData,
      projectMembers: selectedMembers.join(","),
    };

    try {
console.log("Final Payload:", finalData);

        await axiosInstance.post("/project/createProject", finalData);
      toast.success("Project Created Successfully");

   setFormData({
     projectName: "",
     customerid: "",
     billingType: "",
     projectStatus: "Not Started",
     projectEstimate: "",
     estimateHours: "",
     startDate: "",
     endDate: "",
     createdDate: new Date().toISOString().split("T")[0],
     description: "",
     projectMembers: "",
   });
   setSelectedMembers([]);

      onProjectCreated();
      onClose();
    } catch (error) {
      toast.error("Error creating project");
      console.error(error);
    }
  };


  
const filteredEmployees = employeeList.filter((emp) =>
  emp.name.toLowerCase().includes(searchTerm.toLowerCase())
);

useEffect(() => {
  const fetchCustomers = async () => {
    try {
      const response = await axiosInstance.get(
        `/customer/getAllCustomer/${currentPage}/${pageSize}`
      );
      setCustomerList(response.data.customerList || []);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      setCustomerList([]);
    }
  };

  fetchCustomers();
}, []);

const filteredCustomers = customerList.filter((c) =>
  c.companyName.toLowerCase().includes(searchTermCustomer.toLowerCase())
);

const selectedCustomer = customerList.find((c) => c.id === formData.customerid);



  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Create New Project</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-2">
                <Form.Label>Project Name</Form.Label>
                <Form.Control
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-2">
                <Form.Label>Customer</Form.Label>
                <Dropdown>
                  <Dropdown.Toggle
                    variant="secondary"
                    style={{ width: "100%", textAlign: "left" }}
                    id="dropdown-customer"
                  >
                    {selectedCustomer
                      ? selectedCustomer.companyName
                      : "Select Customer"}
                  </Dropdown.Toggle>

                  <Dropdown.Menu
                    style={{
                      maxHeight: "300px",
                      overflowY: "auto",
                      width: "100%",
                    }}
                  >
                    <div className="px-3 py-2">
                      <Form.Control
                        type="text"
                        placeholder="Search customers..."
                        value={searchTermCustomer}
                        onChange={(e) => setSearchTermCustomer(e.target.value)}
                        onClick={(e) => e.stopPropagation()} // Prevent closing on click
                      />
                    </div>

                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map((customer, index) => (
                        <Dropdown.Item
                          key={customer.id || `customer-${index}`}
                          onClick={() => {
                            console.log("Selected Customer:", customer);
                            setFormData({
                              ...formData,
                              customerid: customer.id, // Set only the ID as number/string
                            });
                            setSearchTermCustomer("");
                            document.body.click(); // force close the dropdown
                          }}
                          active={formData.customerid === customer.id}
                        >
                          {customer.companyName}
                        </Dropdown.Item>
                      ))
                    ) : (
                      <Dropdown.Item disabled className="text-muted">
                        No results found
                      </Dropdown.Item>
                    )}
                  </Dropdown.Menu>
                </Dropdown>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-2">
                <Form.Label>Billing Type</Form.Label>
                <Form.Select
                  name="billingType"
                  value={formData.billingType}
                  onChange={handleChange}
                >
                  <option value="">Nothing selected</option>
                  <option value="Fixed Rate">Fixed Rate</option>
                  <option value="Project Hours">Project Hours</option>
                  <option value="Task Hours">
                    Task Hours &nbsp;&nbsp; Based on task hourly rate
                  </option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-2">
                <Form.Label>Project Status</Form.Label>
                <Form.Select
                  name="projectStatus"
                  value={formData.projectStatus}
                  onChange={handleChange}
                >
                  <option>Not Started</option>
                  <option>In Progress</option>
                  <option>On Hold</option>
                  <option>Cancelled</option>
                  <option>Finished</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-2">
                <Form.Label>Project Estimate</Form.Label>
                <Form.Control
                  name="projectEstimate"
                  value={formData.projectEstimate}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-2">
                <Form.Label>Estimate Hours</Form.Label>
                <Form.Control
                  name="estimateHours"
                  value={formData.estimateHours}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-2">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-2">
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  min={formData.startDate}
                />
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group className="mb-2">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group className="mb-2">
                <Form.Label>Project Members</Form.Label>
                <Dropdown>
                  <Dropdown.Toggle variant="secondary">
                    Select Members
                  </Dropdown.Toggle>

                  <Dropdown.Menu
                    style={{
                      userSelect: "none",
                      maxHeight: "300px",
                      overflowY: "auto",
                      width: "100%",
                    }}
                  >
                    <div className="px-3 py-2">
                      <Form.Control
                        type="text"
                        placeholder="Search members..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    {filteredEmployees.length > 0 ? (
                      filteredEmployees.map((emp) => (
                        <div key={emp.employeeId} className="px-3">
                          <Form.Check
                            type="checkbox"
                            label={emp.name}
                            checked={selectedMembers.includes(emp.employeeId)}
                            onChange={(e) => handleCheckboxChange(e, emp)}
                          />
                        </div>
                      ))
                    ) : (
                      <div className="px-3 text-muted">No results found</div>
                    )}
                  </Dropdown.Menu>
                </Dropdown>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Create Project
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CompanyCreateProject;