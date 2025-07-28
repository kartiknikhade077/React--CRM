// src/Company/UpdateLead.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Row, Col, Form, Button } from "react-bootstrap";
import { FaWpforms } from "react-icons/fa"; // form icon
import { toast, ToastContainer } from "react-toastify";
import CompanySidebar from "./CompanySidebar";
import CompanyTopbar from "./CompanyTopbar";
import axiosInstance from "../BaseComponet/axiosInstance";

const UpdateLead = () => {
  const { leadId } = useParams();
  const navigate = useNavigate();

  // form state
  const [form, setForm] = useState({
    leadCreatedDate: "",
    leadUpdateDate: "",
    customerName: "",
    mobileNumber: "",
    phoneNumber: "",
    email: "",
    companyName: "",
    address: "",
    country: "",
    state: "",
    city: "",
    zipCode: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // fetch existing lead
  useEffect(() => {
    async function load() {
      try {
        const res = await axiosInstance.get(`/lead/getLead/${leadId}`);
        const toLocal = (iso) => iso?.slice(0, 16) || "";
        setForm({
          ...res.data,
          leadCreatedDate: toLocal(res.data.leadCreatedDate),
          leadUpdateDate: toLocal(res.data.leadUpdateDate),
        });
      } catch (err) {
        toast.error("Could not load lead details.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [leadId]);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axiosInstance.put("/lead/updateLead", {
        ...form,
        leadCreatedDate: new Date(form.leadCreatedDate).toISOString(),
        leadUpdateDate: new Date(form.leadUpdateDate).toISOString(),
      });
   toast.success("Lead updated successfully!");
  
    } catch {
          toast.error("Error updating lead.");

    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <CompanyTopbar />
        <div className="slidebar-main-div">
          <CompanySidebar />
          <div className="slidebar-main-div-right-section p-4">
            <h5>Loading…</h5>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ToastContainer position="top-right" />
      <CompanyTopbar />
      <div className="slidebar-main-div">
        <CompanySidebar />
        <div className="slidebar-main-div-right-section p-4">
          {/* Update Lead Card */}
          <Card className="mb-4">
            <Card.Header className="d-flex align-items-center">
              <FaWpforms className="me-2" />
              <h5 className="mb-0">Update Lead #{leadId}</h5>
            </Card.Header>

            <Card.Body>
              <Form onSubmit={onSubmit}>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group controlId="customerName">
                      <Form.Label>Customer Name</Form.Label>
                      <Form.Control
                        name="customerName"
                        value={form.customerName}
                        onChange={onChange}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group controlId="companyName">
                      <Form.Label>Company Name</Form.Label>
                      <Form.Control
                        name="companyName"
                        value={form.companyName}
                        onChange={onChange}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group controlId="mobileNumber">
                      <Form.Label>Mobile Number</Form.Label>
                      <Form.Control
                        name="mobileNumber"
                        type="tel"
                        value={form.mobileNumber}
                        onChange={onChange}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group controlId="phoneNumber">
                      <Form.Label>Phone Number</Form.Label>
                      <Form.Control
                        name="phoneNumber"
                        type="tel"
                        value={form.phoneNumber}
                        onChange={onChange}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group controlId="email">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={onChange}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group controlId="country">
                      <Form.Label>Country</Form.Label>
                      <Form.Control
                        name="country"
                        value={form.country}
                        onChange={onChange}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group controlId="state">
                      <Form.Label>State</Form.Label>
                      <Form.Control
                        name="state"
                        value={form.state}
                        onChange={onChange}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group controlId="city">
                      <Form.Label>City</Form.Label>
                      <Form.Control
                        name="city"
                        value={form.city}
                        onChange={onChange}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group controlId="zipCode">
                      <Form.Label>Zip Code</Form.Label>
                      <Form.Control
                        name="zipCode"
                        value={form.zipCode}
                        onChange={onChange}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group controlId="leadCreatedDate">
                      <Form.Label>Created Date & Time</Form.Label>
                      <Form.Control
                        name="leadCreatedDate"
                        type="datetime-local"
                        value={form.leadCreatedDate}
                        onChange={onChange}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group controlId="leadUpdateDate">
                      <Form.Label>Updated Date & Time</Form.Label>
                      <Form.Control
                        name="leadUpdateDate"
                        type="datetime-local"
                        value={form.leadUpdateDate}
                        onChange={onChange}
                        required
                      />
                    </Form.Group>
                  </Col>

                  {/* Address spans full width */}
                  <Col xs={12}>
                    <Form.Group controlId="address">
                      <Form.Label>Address</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="address"
                        value={form.address}
                        onChange={onChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="text-end mt-3">
                  <Button type="submit" variant="primary" disabled={submitting}>
                    {submitting ? "Updating…" : "Update Lead"}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </div>
    </>
  );
};

export default UpdateLead;
