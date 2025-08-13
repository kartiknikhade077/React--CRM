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
  id, // <-- pass from parent for kickOffId
  onProjectSelect,
}) => {
  const [customerList, setCustomerList] = useState([]);
  const [projectSelectOptions, setProjectSelectOptions] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [customers, setCustomers] = useState([]);

  // Fetch customers
  useEffect(() => {
    axiosInstance
      .get("/customer/getCustomerList")
      .then((res) => {
        if (Array.isArray(res.data)) {
          setCustomerList(res.data);

          console.log("checking cust data", res.data);
          setCustomers(res.data);

          console.log("Form data ",formData);

          if (formData.companyId) {
            const cust = res.data.find(
              (c) => c.id === formData.savedcusomerid
            );
            if (cust) {
              const sel = {
                value: cust.companyId, // for dropdown display
                label: cust.companyName,
                customerId: cust.id, // ✅ backend customerId
              };

              setSelectedCustomer(sel);
              console.log("getcustomerid::::::", sel);

              // Use backend customerId for API
              fetchProjectsByCustomerId(cust.id, formData.projectId);
            }
          }
        }
      })
      .catch((err) => console.error("Error fetching customers:", err));
  }, []);

  // Fetch projects per customer
  const fetchProjectsByCustomerId = (customerId, preselectProjectId = null) => {
    if (!customerId) return;
    console.log("customerId =", customerId);

    axiosInstance
      .get(`/project/getProjectByCustomerId/${customerId}`) // ✅ using arg, not stale state
      .then((res) => {
        let projects = Array.isArray(res.data?.data) ? res.data.data : res.data;
        if (!Array.isArray(projects)) projects = [];

        const projectOptions = projects.map((project) => ({
          value: project.projectId,
          label: project.projectName,
          fullData: project,
        }));
        setProjectSelectOptions(projectOptions);

        if (preselectProjectId) {
          const selected = projectOptions.find(
            (p) => p.value === preselectProjectId
          );
          setSelectedProject(selected || null);
        } else {
          setSelectedProject(null);
        }
      })
      .catch((err) => console.error("Error fetching projects:", err));
  };

  // Handle customer change
  const handleCustomerChange = (selectedOption) => {
    setSelectedCustomer(selectedOption);

    const custData = selectedOption;

    console.log("customer selected data", custData.customerId);

    const selectedCustomer = customers.find(
      (c) => c.id === custData.customerId
    );

    // Set the company name to project details
    if (selectedCustomer) {
      //  setProjectDetails(selectedCustomer.companyName);
      console.log(selectedCustomer.companyName);

      setFormData((prev) => ({
        ...prev,
        companyId: selectedCustomer?.companyId || "",
        savedcusomerid: selectedCustomer?.id || "", // backend ID for /project API
        customerName: selectedCustomer?.companyName || "", // Company name
        contactPerson: selectedCustomer?.customerName || "", // Contact person
        phoneNumber: selectedCustomer?.phoneNumber || "",
        website: selectedCustomer?.website || "",
        billingAddress: selectedCustomer?.billingAddress || "",
        shippingAddress: selectedCustomer?.shippingAddress || "",
        // Reset project info
        projectId: "",
        projectName: "",
        projectTitle: "",
        kickOffDate: "",
        startDate: "",
        endDate: "",
      }));
    }
    setSelectedProject(null);

    if (custData?.customerId) {
      fetchProjectsByCustomerId(selectedCustomer.id); // ✅ always fetch
    }
  };

  // Handle project change
  const handleProjectChange = (selectedOption) => {
    const projectId = selectedOption?.fullData?.projectId || "";
    setSelectedProject(selectedOption);
    const project = selectedOption?.fullData || {};
    setFormData((prev) => ({
      ...prev,
      projectId: project.projectId || "",
      projectName: project.projectName || "",
      projectTitle: project.projectTitle || "",
      kickOffDate: project.kickOffDate || "",
      startDate: project.startDate || "",
      endDate: project.endDate || "",
    }));

    onProjectSelect(projectId);
  };

  
  const handleUpdate = async () => {
    const payload = {
      kickOffId: id,
      employeeid: null, 
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
      customerId:formData.savedcusomerid,
      createdDateTime: new Date().toISOString(), // or the original if you keep it
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
          handleAccordionClick={() => handleAccordionClick(eventKey)}
        >
          Customer & Project Details
        </CustomToggle>
        <Accordion.Collapse eventKey={eventKey}>
          <Card.Body>
            {/* Save Button */}
            <div className="d-flex justify-content-between">
              <h5>Customer Details</h5>
              <Button variant="primary" onClick={handleUpdate}>
                Update Customer & Project
              </Button>
            </div>
            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Select Customer</Form.Label>
                  <Select
                    value={selectedCustomer}
                    onChange={handleCustomerChange}
                    options={customerList.map((cust) => ({
                      value: cust.companyId,
                      label: cust.companyName,
                      customerId: cust.id,
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
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    </Accordion>
  );
};

export default CompanyUpdateKickoffSheetCustomerData;
