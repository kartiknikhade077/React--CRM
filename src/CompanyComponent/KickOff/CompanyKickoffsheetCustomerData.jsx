import React, { useEffect, useState } from "react";
import { Accordion, Card, Form, Row, Col } from "react-bootstrap";
import axiosInstance from "../../BaseComponet/axiosInstance";
import { Dropdown } from "react-bootstrap";

const CompanyKickoffsheetCustomerData = ({
  eventKey,
  activeKey,
  CustomToggle,
  handleAccordionClick,
}) => {
  const [customerList, setCustomerList] = useState([]);
  const [searchTermCustomer, setSearchTermCustomer] = useState("");

  const currentPage = 0; // or 1 depending on your backend pagination indexing
  const pageSize = 100;

  const [formData, setFormData] = useState({
    customerid: "",
    // Add other fields here if needed
  });

  const filteredCustomers = customerList.filter((c) =>
    c.companyName.toLowerCase().includes(searchTermCustomer.toLowerCase())
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


  return (
    <Card className="mb-3 shadow-sm border-0">
      <CustomToggle
        eventKey={eventKey}
        activeKey={activeKey}
        onClick={() => handleAccordionClick(eventKey)}
      >
        Customer Data
      </CustomToggle>
      <Accordion.Collapse eventKey={eventKey}>
        <Card.Body>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="customerName">
                <Form.Label>
                  Customer Name <span className="text-danger">*</span>
                </Form.Label>
                <Dropdown>
                  <Dropdown.Toggle
                    variant="secondary"
                    style={{ width: "100%", textAlign: "left" }}
                    id="dropdown-customer"
                  >
                    {/* Show selected customer name or placeholder */}
                    {(() => {
                      const selectedCustomer = customerList.find(
                        (c) => c.id === formData.customerid
                      );
                      return selectedCustomer
                        ? selectedCustomer.companyName
                        : "Select Customer";
                    })()}
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
                        autoComplete="off"
                      />
                    </div>
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map((customer, index) => (
                        <Dropdown.Item
                          key={customer.id || `customer-${index}`}
                          onClick={() => {
                            setFormData({
                              ...formData,
                              customerid: customer.id, // Store only the ID!
                            });
                            setSearchTermCustomer(""); // Clear search bar after selection
                            document.body.click(); // Close dropdown
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
              <Form.Group controlId="contactPerson">
                <Form.Label>
                  Contact Person Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control type="text" placeholder="Customer Name" />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="mobileNumber">
                <Form.Label>
                  <span className="text-danger">*</span> Mobile Number
                </Form.Label>
                <Form.Control type="text" placeholder="Enter Mobile Number" />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="companyWebsite">
                <Form.Label>Company Website</Form.Label>
                <Form.Control type="text" placeholder="Enter Company Website" />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group controlId="billingAddress">
                <Form.Label>Billing Address</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Enter Billing Address"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="shippingAddress">
                <Form.Label>Shipping Address</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Enter Shipping Address"
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Accordion.Collapse>
    </Card>
  );
};

export default CompanyKickoffsheetCustomerData;
