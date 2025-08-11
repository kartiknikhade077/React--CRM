import React, { useEffect, useState } from "react";
import { Accordion, Card, Form, Row, Col, Button } from "react-bootstrap";
import Select from "react-select";
import axiosInstance from "../../../BaseComponet/axiosInstance";

const CompanyUpdateKickoffSheetCustomerData = ({
  eventKey,
  activeKey,
  CustomToggle,
  handleAccordionClick,
  formData,
  setFormData,
  id // <-- pass from parent for kickOffId
}) => {
  const [customerList, setCustomerList] = useState([]);
  const [projectSelectOptions, setProjectSelectOptions] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  // Fetch customers
  useEffect(() => {
    axiosInstance
      .get("/customer/getCustomerList")
      .then((res) => {
        if (Array.isArray(res.data)) {
          setCustomerList(res.data);

          if (formData.customerid) {
            const cust = res.data.find(c => c.companyId === formData.customerid);
            if (cust) {
              const sel = { value: cust.companyId, label: cust.companyName || cust.customerName };
              setSelectedCustomer(sel);

              // Pass projectId for edit-mode preselection
              fetchProjectsByCustomerId(cust.companyId, formData.projectId);
            }
          }
        }
      })
      .catch(err => console.error("Error fetching customers:", err));
  }, [formData.customerid, formData.projectId]);

  // Fetch projects per customer
  const fetchProjectsByCustomerId = (customerId, preselectProjectId = null) => {
    axiosInstance
      .get(`/project/getProjectByCustomerId/${customerId}`)
      .then((res) => {
        let projects = Array.isArray(res.data?.data) ? res.data.data : res.data;
        if (!Array.isArray(projects)) projects = [];

        const projectOptions = projects.map((project) => ({
          value: project.projectId,
          label: project.projectName,
          fullData: project
        }));
        setProjectSelectOptions(projectOptions);

        // Handle preselect for both new/edit
        if (preselectProjectId) {
          const selected = projectOptions.find(p => p.value === preselectProjectId);
          setSelectedProject(selected || null);
        } else {
          setSelectedProject(null);
        }
      })
      .catch(err => console.error("Error fetching projects:", err));
  };

  // Handle customer change
  const handleCustomerChange = (selectedOption) => {
    setSelectedCustomer(selectedOption);
    setFormData((prev) => ({
      ...prev,
      customerid: selectedOption?.value || "",
      customerName: selectedOption?.label || "",
      // Reset project fields
      projectId: "",
      projectName: "",
      projectTitle: "",
      kickOffDate: "",
      startDate: "",
      endDate: ""
    }));
    setSelectedProject(null);

    if (selectedOption?.value) {
      fetchProjectsByCustomerId(selectedOption.value);
    }
  };

  // Handle project change
  const handleProjectChange = (selectedOption) => {
    setSelectedProject(selectedOption);
    const project = selectedOption?.fullData || {};
    setFormData(prev => ({
      ...prev,
      projectId: project.projectId || "",
      projectName: project.projectName || "",
      projectTitle: project.projectTitle || "",
      kickOffDate: project.kickOffDate || "",
      startDate: project.startDate || "",
      endDate: project.endDate || ""
    }));
  };

  // --- ✅ Independent SAVE Function for this child ---
  const handleUpdate = async () => {
    const payload = {
      kickOffId: id,
      employeeid: null, // or pass actual employee id if available
      projectId: formData.projectId,
      customerName: formData.customerName,
      contactPersonName: formData.contactPerson,
      mobileNumber: formData.phoneNumber,
      companyWebsite: formData.website,
      billingAddress: formData.billingAddress,
      shippingAddress: formData.shippingAddress,
      projectName: formData.projectName,
      projectTitle: formData.projectTitle,
      kickOffDate: formData.kickOffDate,
      startDate: formData.startDate,
      endDate: formData.endDate,
      createdDateTime: new Date().toISOString() // or the original if you keep it
    };

    try {
      await axiosInstance.put("/kickoff/updateKickOffInfo", payload);
      alert("Customer & Project details updated successfully!");
    } catch (error) {
      console.error("Update failed", error);
      alert("Failed to update customer/project details.");
    }
  };

  return (
    <Accordion activeKey={activeKey}>
      <Card>
        <CustomToggle
          as={Card.Header}
          eventKey={eventKey}
          onClick={() => handleAccordionClick(eventKey)}
        >
          Customer & Project Details
        </CustomToggle>
        <Accordion.Collapse eventKey={eventKey}>
          <Card.Body>
            <h5>Customer Details</h5>
            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Select Customer</Form.Label>
                  <Select
                    value={selectedCustomer}
                    onChange={handleCustomerChange}
                    options={customerList.map((cust) => ({
                      value: cust.companyId,
                      label: cust.companyName || cust.customerName,
                    }))}
                    placeholder="Select customer..."
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Contact Person</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        contactPerson: e.target.value,
                      }))
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phoneNumber: e.target.value,
                      }))
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Website</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.website}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        website: e.target.value,
                      }))
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Billing Address</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.billingAddress}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        billingAddress: e.target.value,
                      }))
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Shipping Address</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.shippingAddress}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        shippingAddress: e.target.value,
                      }))
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Project Details */}
            <h5 className="mt-4">Project Details</h5>
            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Select Project</Form.Label>
                  <Select
                    value={selectedProject}
                    onChange={handleProjectChange}
                    options={projectSelectOptions}
                    placeholder="Select project..."
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Project Title</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.projectTitle}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        projectTitle: e.target.value,
                      }))
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Kickoff Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.kickOffDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        kickOffDate: e.target.value,
                      }))
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Save Button */}
            <div className="mt-4 text-end">
              <Button variant="primary" onClick={handleUpdate}>
                Update Customer & Project
              </Button>
            </div>
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    </Accordion>
  );
};

export default CompanyUpdateKickoffSheetCustomerData;
