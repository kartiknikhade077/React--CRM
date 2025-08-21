import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col, Dropdown } from "react-bootstrap";
import { toast } from "react-toastify";
import axiosInstance from "../../BaseComponet/axiosInstance";

const CompanyEditProject = ({ show, onClose, projectId, onProjectUpdated }) => {
  const [employeeList, setEmployeeList] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [customerList, setCustomerList] = useState([]);
  const [searchTermCustomer, setSearchTermCustomer] = useState("");

    const [currentPage] = useState(0);
    const [pageSize] = useState(100);
    const [access,setAccess]=useState({})
  const [formData, setFormData] = useState({
      id: "",   
    projectName: "",
    customerid: "",
    billingType: "",
    projectStatus: "Not Started",
    projectEstimate: "",
    estimateHours: "",
    startDate: "",
    endDate: "",
    description: "",
    projectMembers: "",
  });

  useEffect(() => {
    if (show && projectId) {
      fetchProjectData();
      fetchEmployees();
      const access = JSON.parse(localStorage.getItem("access"));
      setAccess(access)
    }
  }, [show, projectId]);

  const fetchProjectData = async () => {
    try {
      const res = await axiosInstance.get(
        `/project/getProjectById/${projectId}`
      );
      const data = res.data;

      setFormData({
        ...data,
        startDate: data.startDate || "",
        endDate: data.endDate || "",
        projectMembers: data.projectMembers || "",
      });
      setSelectedMembers(data.projectMembers?.split(",").map(String) || []);
    } catch (err) {
      console.error("Error fetching project:", err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axiosInstance.get(`/company/getEmployeeList/0/100`);
      setEmployeeList(res.data.employeeList || []);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

const handleCheckboxChange = (e, emp) => {
  const id = String(emp.employeeId);
  setSelectedMembers((prev) =>
    prev.includes(id) ? prev.filter((empId) => empId !== id) : [...prev, id]
  );
};


  const handleUpdate = async () => {
    const updatedData = {
      ...formData,
      projectMembers: selectedMembers.join(","),
    };

    try {
      await axiosInstance.put(
        `/project/updateProject/${projectId}`,
        updatedData
      );
      toast.success("Project updated successfully");
      onProjectUpdated();
      onClose();
    } catch (err) {
      toast.error("Error updating project");
      console.error(err);
    } 
  };


const handleUpdateSubmit = async (e) => {
  e.preventDefault();
 console.log("Form submitted"); 
  const updatedData = {
    projectId: formData.projectId, // this maps correctly to projectId in API
    projectName: formData.projectName,
    customerid: formData.customerid,
    billingType: formData.billingType,
    projectStatus: formData.projectStatus,
    projectEstimate: formData.projectEstimate,
    estimateHours: formData.estimateHours,
    startDate: formData.startDate,
    endDate: formData.endDate,
    createdDate: new Date().toISOString().split("T")[0], // current date
    description: formData.description,
    projectMembers: selectedMembers.join(","),
  };
 console.log("Update Payload:", updatedData);
  try {
    const response = await axiosInstance.put(
      "/project/updateProject",
      updatedData
    );

    if (response.status === 200) {
      toast.success("Project updated successfully!");
      onClose();
      if (onProjectUpdated) onProjectUpdated();
    } else {
      toast.error("Failed to update project.");
    }
  } catch (error) {
    console.error("Error updating project:", error);
    toast.error("Something went wrong while updating the project.");
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
      console.log("Customer API response:", response.data);
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


const selectedCustomer = customerList.find(
  (c) => String(c.id) === String(formData.customerid)
);



  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Edit Project</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleUpdateSubmit}>
          <fieldset disabled={!access?.projectEdit}>
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
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map((customer, index) => (
                        <Dropdown.Item
                          key={customer.id || `customer-${index}`}
                          onClick={() => {
                            setFormData({
                              ...formData,
                              customerid: String(customer.id),
                            });
                            setSearchTermCustomer("");
                            document.body.click(); // force close dropdown
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
                <Form.Control
                  name="billingType"
                  value={formData.billingType}
                  onChange={handleChange}
                />
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
                            checked={selectedMembers.includes(
                              String(emp.employeeId)
                            )}
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

          <Modal.Footer>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Update Project
            </Button>
          </Modal.Footer>
          </fieldset>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default CompanyEditProject;
