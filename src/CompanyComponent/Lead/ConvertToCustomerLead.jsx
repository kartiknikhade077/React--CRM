// components/SaferateConvertToCustomer.jsx
import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axiosInstance from "../../BaseComponet/axiosInstance";
import { toast } from "react-toastify";

const ConvertToCustomerLead = ({
  show,
  onClose,
  fixedData,
  handleBackToEdit,
}) => {
  const [formData, setFormData] = useState({
    customerName: "",
    companyName: "",
    email: "",
    phoneNumber: "",
    website: "",
    address: "",
    city: "",
    state: "",
    country: "",
    gstinNumer: "",
    panNumber: "",
  });

//   useEffect(() => {
//     if (fixedData) {
//       setFormData({
//         customerName: fixedData.customerName || "",
//         companyName: fixedData.company || "",
//         email: fixedData.email || "",
//         phoneNumber: fixedData.phone || "",
//         website: fixedData.website || "",
//         address: fixedData.address || "",
//         city: fixedData.city || "",
//         state: fixedData.state || "",
//         country: fixedData.country || "",
//         gstinNumer: fixedData.gstNumber || "",
//         panNumber: fixedData.panNumber || "",
//       });
//     }
//   }, [fixedData]);

useEffect(() => {
  if (fixedData) {
    const baseData = {
      customerName: fixedData.customerName || "",
      companyName: fixedData.company || "",
      email: fixedData.email || "",
      phoneNumber: fixedData.phone || "",
      website: fixedData.website || "",
      address: fixedData.address || "",
      city: fixedData.city || "",
      state: fixedData.state || "",
      country: fixedData.country || "",
      gstinNumer: fixedData.gstNumber || "",
      panNumber: fixedData.panNumber || "",
    };

    // Map dynamic fields (if available)
    if (Array.isArray(fixedData.customFields)) {
      fixedData.customFields.forEach(({ fieldName, fieldValue }) => {
        const normalizedField = fieldName.trim().toLowerCase();

        if (normalizedField === "pan no") baseData.panNumber = fieldValue;
        else if (normalizedField === "gst no") baseData.gstinNumer = fieldValue;
        else if (normalizedField === "website") baseData.website = fieldValue;
        else if (normalizedField === "company")
          baseData.companyName = fieldValue;
        else if (normalizedField === "email") baseData.email = fieldValue;
        else if (
          normalizedField === "phone" ||
          normalizedField === "phone number"
        )
          baseData.phoneNumber = fieldValue;
        else if (normalizedField === "city") baseData.city = fieldValue;
        else if (normalizedField === "state") baseData.state = fieldValue;
        else if (normalizedField === "country") baseData.country = fieldValue;
        else if (normalizedField === "address") baseData.address = fieldValue;
        else if (normalizedField === "customer name")
          baseData.customerName = fieldValue;
      });
    }

    setFormData(baseData);
  }
}, [fixedData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("customer/createCustomer", formData);
      toast.success("Customer created successfully!");
      onClose(); // close modal
    } catch (err) {
      toast.error("Failed to create customer.");
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Convert to Customer</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <div className="row">
            <Form.Group className="col-md-6 mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="col-md-6 mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="col-md-6 mb-3">
              <Form.Label>Company</Form.Label>
              <Form.Control
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="col-md-6 mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="col-md-6 mb-3">
              <Form.Label>Website</Form.Label>
              <Form.Control
                name="website"
                value={formData.website}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="col-md-6 mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="col-md-6 mb-3">
              <Form.Label>City</Form.Label>
              <Form.Control
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="col-md-6 mb-3">
              <Form.Label>State</Form.Label>
              <Form.Control
                name="state"
                value={formData.state}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="col-md-6 mb-3">
              <Form.Label>Country</Form.Label>
              <Form.Control
                name="country"
                value={formData.country}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="col-md-6 mb-3">
              <Form.Label>GST No</Form.Label>
              <Form.Control
                name="gstinNumer"
                value={formData.gstinNumer}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="col-md-6 mb-3">
              <Form.Label>PAN No</Form.Label>
              <Form.Control
                name="panNumber"
                value={formData.panNumber}
                onChange={handleChange}
              />
            </Form.Group>
          </div>

          <Button
            variant="secondary me-2"
            onClick={() => {
              onClose(); // Close ConvertToCustomerLead modal
              handleBackToEdit(); // Callback to open EditLead modal
            }}
          >
            ← Back to Edit Lead
          </Button>

          <Button type="submit" variant="primary">
            Submit
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ConvertToCustomerLead;
