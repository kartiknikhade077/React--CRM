import React, { useEffect, useState } from "react";
import { Accordion, Card, Form, Row, Col, Dropdown } from "react-bootstrap";
import axiosInstance from "../../../BaseComponet/axiosInstance";
import Select from "react-select";

const CompanyUpdateKickoffSheetCustomerData = ({
  eventKey,
  activeKey,
  CustomToggle,
  handleAccordionClick,
  setCustomerId,

  initialData = {},
}) => {
  const [customerList, setCustomerList] = useState([]);

  const [selectedCustomer, setSelectedCustomer] = useState();

  const [formData, setFormData] = useState({
    customerid: "",
    customerName: "",
    contactPerson: "",
    phoneNumber: "",
    website: "",
    billingAddress: "",
    shippingAddress: "",
  });

  const fetchCustomers = async () => {
    try {
      const response = await axiosInstance.get("/customer/getCustomerList");
      const data = response.data;

      console.log("checking data", data);

      const options = data.map((c) => ({
        value: c.companyId,
        label: c.companyName,
        fullData: c,
      }));

      setCustomerList(options);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      setCustomerList([]);
    }
  };

  // Set formData after customer list load, using initialData
  useEffect(() => {
    if (initialData) {
      setFormData({
        customerid: initialData.customerid || "",
        customerName: initialData.customerName || "",
        contactPerson: initialData.contactPerson || "",
        phoneNumber: initialData.phoneNumber || "",
        website: initialData.website || "",
        billingAddress: initialData.billingAddress || "",
        shippingAddress: initialData.shippingAddress || "",
      });


      const options = {
        value: initialData.customerid || "",
        label: initialData.companyName || "",
        fullData: {},
      };
      setSelectedCustomer(options);
    }
  }, [initialData]);

  // Update parent when formData.customerid changes
  useEffect(() => {
    if (formData.customerid) {
      setCustomerId(formData.customerid);
    }
  }, [formData.customerid, setCustomerId]);

  // Handler when option is selected in react-select

  const handleSelectChange = (selected) => {
    setSelectedCustomer(selected); // ✅ Update selectedCustomer state

    if (!selected) {
      setFormData({
        customerid: "",
        customerName: "",
        contactPerson: "",
        phoneNumber: "",
        website: "",
        billingAddress: "",
        shippingAddress: "",
      });
      return;
    }

    setFormData({
      ...formData,
      customerid: selected.value,
      customerName: selected.label,
      contactPerson: selected.fullData?.contactPerson || "",
      phoneNumber: selected.fullData?.phoneNumber || "",
      website: selected.fullData?.website || "",
      billingAddress: selected.fullData?.billingAddress || "",
      shippingAddress: selected.fullData?.shippingAddress || "",
    });
  };

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
                <Select
                  options={customerList}
                  value={selectedCustomer}
                  onChange={handleSelectChange}
                  placeholder="Select Customer"
                  onMenuOpen={fetchCustomers}
                  isClearable
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="contactPerson">
                <Form.Label>
                  Contact Person Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Contact Person Name"
                  value={formData.contactPerson}
                  onChange={(e) =>
                    setFormData({ ...formData, contactPerson: e.target.value })
                  }
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="phoneNumber">
                <Form.Label>
                  <span className="text-danger">*</span> Mobile Number
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Mobile Number"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="website">
                <Form.Label>Company Website</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Company Website"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                />
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
                  value={formData.billingAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, billingAddress: e.target.value })
                  }
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
                  value={formData.shippingAddress}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shippingAddress: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Accordion.Collapse>
    </Card>
  );
};

export default CompanyUpdateKickoffSheetCustomerData;
