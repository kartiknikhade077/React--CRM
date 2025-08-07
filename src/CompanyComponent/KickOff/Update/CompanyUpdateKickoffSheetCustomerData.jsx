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

  const [formData, setFormData] = useState({
    customerid: "",
    customerName: "",
    contactPerson: "",
    phoneNumber: "",
    website: "",
    billingAddress: "",
    shippingAddress: "",
  });

  // Fetch customer list and normalize keys on mount
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axiosInstance.get("/customer/getCustomerList");
    const normalized = (response.data || []).map((c) => {
      const customerid = String(c.companyId || c.customerid || c.id);
      const label = c.companyName || c.customerName || "";

      return {
        value: customerid,
        label: label,
        customerid,
        companyName: c.contactPersonName || "",
        contactPerson: c.contactPersonName || "",
        phoneNumber: c.mobileNumber || "",
        website: c.companyWebsite || "",
        billingAddress: c.billingAddress || "",
        shippingAddress: c.shippingAddress || "",
      };
    });
    setCustomerList(normalized);

      } catch (error) {
        console.error("Failed to fetch customers:", error);
        setCustomerList([]);
      }
    };
    fetchCustomers();
  }, []);

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
    }
  }, [initialData]);

  // Update parent when formData.customerid changes
  useEffect(() => {
    if (formData.customerid) {
      setCustomerId(formData.customerid);
    }
  }, [formData.customerid, setCustomerId]);

  // Find currently selected customer option for react-select value prop
const selectedOption =
  customerList.find((c) => String(c.value) === String(formData.customerid)) ||
  null;


  // Handler when option is selected in react-select
const handleSelectChange = (selected) => {
  if (!selected) {
    setFormData({
      ...formData,
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
    ...formData, // Keep any other unchanged fields
    customerid: selected.value, // ✅ Use `value` instead of `selected.customerid`
    customerName: selected.label, // ✅ Or selected.companyName if preferred
    contactPerson: selected.contactPerson,
    phoneNumber: selected.phoneNumber,
    website: selected.website,
    billingAddress: selected.billingAddress,
    shippingAddress: selected.shippingAddress,
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
                  value={selectedOption}
                  onChange={handleSelectChange}
                  placeholder="Select Customer"
                  isClearable
                  menuPortalTarget={document.body}
                  styles={{
                    control: (base) => ({ ...base, textAlign: "left" }),
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }), // 👈 Ensure dropdown is on top
                  }}
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
