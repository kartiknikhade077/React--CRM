import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";

const CompanyTimesheetFilter = ({
  show,
  handleClose,
  onFilterChange,
  onClear,
  designers = [], // dynamic designer list from parent
  itemNumbers = [], // dynamic item numbers
  workOrders = [], // dynamic work orders
  activeFilters = {}, // <-- pass current filters from parent
}) => {
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    designer: "",
    itemNumber: "",
    workOrder: "",
  });

  // Sync modal filters with parent's active filters whenever modal is opened
  useEffect(() => {
    if (show) {
      setFilters(activeFilters);
    }
  }, [show, activeFilters]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApply = () => {
    onFilterChange(filters); // send updated filters to parent
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
    onClear(); // clear filters in parent
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
                <option value="">Select All Designer</option>
                {designers.map((d, idx) => (
                  <option key={idx} value={d}>
                    {d}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Item Number</Form.Label>
              <Form.Control
                type="text"
                name="itemNumber"
                placeholder="Enter Item Number"
                value={filters.itemNumber}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Work Order No</Form.Label>
              <Form.Control
                type="text"
                name="workOrder"
                placeholder="Enter Work Order No"
                value={filters.workOrder}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>

        {/* <Row>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Item Number</Form.Label>
              <Form.Select
                name="itemNumber"
                value={filters.itemNumber}
                onChange={handleChange}
              >
                <option value="">Select All Item Number</option>
                {itemNumbers.map((item, idx) => (
                  <option key={idx} value={item}>
                    {item}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Work All Order No</Form.Label>
              <Form.Select
                name="workOrder"
                value={filters.workOrder}
                onChange={handleChange}
              >
                <option value="">Select All Work Order</option>
                {workOrders.map((wo, idx) => (
                  <option key={idx} value={wo}>
                    {wo}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row> */}
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
