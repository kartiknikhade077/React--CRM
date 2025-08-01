import React, { useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";

const CompanyCreateTimesheet = ({ show, handleClose }) => {
  const [formData, setFormData] = useState({
    date: "",
    workOrder: "",
    designer: "",
    fromTime: "",
    toTime: "",
    remarks: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    console.log("Submitted Data:", formData);
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Create Timesheet</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {/* First Row */}
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>
                  <span className="text-danger">*</span> Date
                </Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>
                  <span className="text-danger">*</span> Work Order No.
                </Form.Label>
                <Form.Select
                  name="workOrder"
                  value={formData.workOrder}
                  onChange={handleChange}
                >
                  <option value="">Select Work Order</option>
                  <option value="WO001">WO001</option>
                  <option value="WO002">WO002</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>
                  <span className="text-danger">*</span> Designer
                </Form.Label>
                <Form.Select
                  name="designer"
                  value={formData.designer}
                  onChange={handleChange}
                >
                  <option value="">Select Designer</option>
                  <option value="John">John</option>
                  <option value="Alice">Alice</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* Second Row */}
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>
                  <span className="text-danger">*</span> From
                </Form.Label>
                <Form.Control
                  type="time"
                  name="fromTime"
                  value={formData.fromTime}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>
                  <span className="text-danger">*</span> To
                </Form.Label>
                <Form.Control
                  type="time"
                  name="toTime"
                  value={formData.toTime}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Remarks</Form.Label>
                <Form.Control
                  type="text"
                  name="remarks"
                  placeholder="Enter Remarks Here..."
                  value={formData.remarks}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CompanyCreateTimesheet;
