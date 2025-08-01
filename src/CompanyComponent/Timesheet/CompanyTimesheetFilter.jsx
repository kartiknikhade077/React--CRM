import React, { useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";

const CompanyTimesheetFilter = ({
  show,
  handleClose,
  onFilterChange,
  onClear,
}) => {
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    designer: "",
    itemNumber: "",
    workOrder: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...filters, [name]: value };
    setFilters(updated);
  };

  const handleApply = () => {
    onFilterChange(filters);
    handleClose();
  };

  const handleReset = () => {
    const cleared = {
      startDate: "",
      endDate: "",
      designer: "",
      itemNumber: "",
      workOrder: "",
    };
    setFilters(cleared);
    onClear();
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Filter Timesheets</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Designer</Form.Label>
              <Form.Select
                name="designer"
                value={filters.designer}
                onChange={handleChange}
              >
                <option value="">Select Designers</option>
                <option value="John">John</option>
                <option value="Alice">Alice</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Item Number</Form.Label>
              <Form.Select
                name="itemNumber"
                value={filters.itemNumber}
                onChange={handleChange}
              >
                <option value="">Select Item Numbers</option>
                <option value="Item001">Item001</option>
                <option value="Item002">Item002</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Work Order No</Form.Label>
              <Form.Select
                name="workOrder"
                value={filters.workOrder}
                onChange={handleChange}
              >
                <option value="">Select Work Orders</option>
                <option value="WO001">WO001</option>
                <option value="WO002">WO002</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleReset}>
          Clear
        </Button>
        <Button variant="primary" onClick={handleApply}>
          Apply
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CompanyTimesheetFilter;
