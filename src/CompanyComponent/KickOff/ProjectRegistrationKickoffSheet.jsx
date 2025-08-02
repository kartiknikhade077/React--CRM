import React, { useState } from "react";
import {
  Accordion,
  Card,
  Form,
  Row,
  Col,
  Button,
  Table,
} from "react-bootstrap";
import { FaTrash, FaPlusCircle } from "react-icons/fa";

const ProjectRegistrationKickoffSheet = ({
  eventKey,
  activeKey,
  CustomToggle,
  handleAccordionClick,
}) => {
  // ---------------- State for Part Details ----------------
  const [parts, setParts] = useState([]);

  const addPart = () => {
    const newPart = {
      id: Date.now(),
      itemNo: `PT-${1540 + parts.length + 1}`,
      partName: "",
      material: "",
      thickness: "",
      image: null,
    };
    setParts([...parts, newPart]);
  };

  const removePart = (id) => {
    setParts(parts.filter((part) => part.id !== id));
  };

  const updatePart = (id, field, value) => {
    setParts(
      parts.map((part) => (part.id === id ? { ...part, [field]: value } : part))
    );
  };

  // ---------------- State for Part Process ----------------
  const [processes, setProcesses] = useState([]);

  const addProcess = () => {
    const newProcess = {
      id: Date.now(),
      woNo: "",
      designer: "",
      opNo: "",
      processName: "",
      quotedSize: "",
      remarks: "",
    };
    setProcesses([...processes, newProcess]);
  };

  const removeProcess = (id) => {
    setProcesses(processes.filter((proc) => proc.id !== id));
  };

  const updateProcess = (id, field, value) => {
    setProcesses(
      processes.map((proc) =>
        proc.id === id ? { ...proc, [field]: value } : proc
      )
    );
  };

  return (
    <Card className="mb-3 shadow-sm border-0">
      <CustomToggle
        eventKey={eventKey}
        activeKey={activeKey}
        onClick={() => handleAccordionClick(eventKey)}
      >
        Project Registration/Enquiry
      </CustomToggle>
      <Accordion.Collapse eventKey={eventKey}>
        <Card.Body>
          {/* ---------------- Project Details Section ---------------- */}
          <h5
            className="mb-3"
            style={{ borderLeft: "4px solid #1a3c8c", paddingLeft: "12px" }}
          >
            Project Details
          </h5>

          <Form>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="projectName">
                  <Form.Label>
                    Enter Project Name <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control type="text" placeholder="Project Name" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="projectTitle">
                  <Form.Label>Project Title</Form.Label>
                  <Form.Control type="text" placeholder="Enter Project Title" />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-4">
              <Col md={6}>
                <Form.Group controlId="kickOffDate">
                  <Form.Label>Kick-Off Date</Form.Label>
                  <Form.Control type="date" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Label>Delivery Date</Form.Label>
                <Row>
                  <Col>
                    <Form.Text className="text-muted">T0 : 8/1/2025</Form.Text>
                    <Form.Control type="date" />
                  </Col>
                  <Col>
                    <Form.Text className="text-muted">T1 : 8/1/2025</Form.Text>
                    <Form.Control type="date" />
                  </Col>
                </Row>
              </Col>
            </Row>

            {/* ---------------- Part Details Section ---------------- */}
            <h5
              className="mb-3"
              style={{ borderLeft: "4px solid #1a3c8c", paddingLeft: "12px" }}
            >
              Part Details
            </h5>

            <Table bordered responsive className="mb-0">
              <thead
                className="text-white"
                style={{ backgroundColor: "#002855" }}
              >
                <tr>
                  <th>Item No.</th>
                  <th>Part Name</th>
                  <th>Material</th>
                  <th>Thickness</th>
                  <th>Image</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {parts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">
                      No parts added yet. Click "Add Part" to get started.
                    </td>
                  </tr>
                ) : (
                  parts.map((part) => (
                    <tr key={part.id}>
                      <td>
                        <strong>{part.itemNo}</strong>
                      </td>
                      <td>
                        <Form.Select
                          value={part.partName}
                          onChange={(e) =>
                            updatePart(part.id, "partName", e.target.value)
                          }
                        >
                          <option value="">Select an option</option>
                          <option value="Part A">Part A</option>
                          <option value="Part B">Part B</option>
                        </Form.Select>
                      </td>
                      <td>
                        <Form.Select
                          value={part.material}
                          onChange={(e) =>
                            updatePart(part.id, "material", e.target.value)
                          }
                        >
                          <option value="">Select an option</option>
                          <option value="Steel">Steel</option>
                          <option value="Aluminum">Aluminum</option>
                        </Form.Select>
                      </td>
                      <td>
                        <Form.Control
                          placeholder="Select thickness..."
                          value={part.thickness}
                          onChange={(e) =>
                            updatePart(part.id, "thickness", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <div
                          className="d-flex align-items-center justify-content-center"
                          style={{
                            border: "1px dashed #ccc",
                            padding: "16px",
                            cursor: "pointer",
                            borderRadius: "6px",
                            textAlign: "center",
                            minWidth: "120px",
                          }}
                          onClick={() => alert("Upload handler")}
                        >
                          <div className="text-center text-muted">
                            <i className="bi bi-image fs-3" />
                            <div>Upload Image</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-center">
                        <Button
                          variant="link"
                          onClick={() => removePart(part.id)}
                          className="text-danger"
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>

            <div className="d-flex justify-content-end mt-3 mb-5">
              <Button onClick={addPart} variant="primary">
                <FaPlusCircle className="me-2" /> Add Part
              </Button>
            </div>

            {/* ---------------- Part Process Section ---------------- */}
            {/* ---------------- Part Process Section ---------------- */}
            <h5
              className="mb-3"
              style={{ borderLeft: "4px solid #1a3c8c", paddingLeft: "12px" }}
            >
              Part Process
            </h5>

            <Table bordered responsive>
              <thead
                className="text-white"
                style={{ backgroundColor: "#002855" }}
              >
                <tr>
                  <th>WO NO</th>
                  <th>Designer</th>
                  <th>OP NO</th>
                  <th>Process</th>
                  <th colSpan="3">Quoted Die Sizes (mm)</th>{" "}
                  {/* Separate columns */}
                  <th>Remarks</th>
                  <th>Actions</th>
                </tr>
                {/* <tr>
                  <th></th>
                  <th></th>
                  <th></th>
                  <th></th>
                  <th>Length</th>
                  <th>Width</th>
                  <th>Height</th>
                  <th></th>
                  <th></th>
                </tr> */}
              </thead>
              <tbody>
                {processes.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center text-muted py-4">
                      No process data available. Click "Add Process" to create
                      one.
                    </td>
                  </tr>
                ) : (
                  processes.map((proc) => (
                    <tr key={proc.id}>
                      <td>
                        <Form.Control
                          value={proc.woNo}
                          onChange={(e) =>
                            updateProcess(proc.id, "woNo", e.target.value)
                          }
                          placeholder="WO NO"
                        />
                      </td>
                      <td>
                        <Form.Select
                          value={proc.designer}
                          onChange={(e) =>
                            updateProcess(proc.id, "designer", e.target.value)
                          }
                        >
                          <option value="">Designer Name</option>
                          <option value="Designer 1">Designer 1</option>
                          <option value="Designer 2">Designer 2</option>
                        </Form.Select>
                      </td>
                      <td>
                        <Form.Select
                          value={proc.opNo}
                          onChange={(e) =>
                            updateProcess(proc.id, "opNo", e.target.value)
                          }
                        >
                          <option value="">Select</option>
                          <option value="05">05</option>
                          <option value="10">10</option>
                          <option value="20">20</option>
                          <option value="30">30</option>
                          <option value="40">40</option>
                          <option value="50">50</option>
                          <option value="60">60</option>
                          <option value="70">70</option>
                          <option value="80">80</option>
                          <option value="90">90</option>
                          <option value="100">100</option>
                          <option value="120">120</option>
                          <option value="140">140</option>
                          <option value="160">160</option>
                          <option value="180">180</option>
                          <option value="200">200</option>
                          <option value="XX">XX</option>
                        </Form.Select>
                      </td>

                      <td>
                        <Form.Control
                          value={proc.processName}
                          onChange={(e) =>
                            updateProcess(
                              proc.id,
                              "processName",
                              e.target.value
                            )
                          }
                          placeholder="Process"
                        />
                      </td>

                      {/* Quoted Die Sizes (Length, Width, Height) */}
                      <td>
                        <Form.Control
                          value={proc.length}
                          onChange={(e) =>
                            updateProcess(proc.id, "length", e.target.value)
                          }
                          placeholder="Length"
                        />
                      </td>
                      <td>
                        <Form.Control
                          value={proc.width}
                          onChange={(e) =>
                            updateProcess(proc.id, "width", e.target.value)
                          }
                          placeholder="Width"
                        />
                      </td>
                      <td>
                        <Form.Control
                          value={proc.height}
                          onChange={(e) =>
                            updateProcess(proc.id, "height", e.target.value)
                          }
                          placeholder="Height"
                        />
                      </td>

                      <td>
                        <Form.Control
                          value={proc.remarks}
                          onChange={(e) =>
                            updateProcess(proc.id, "remarks", e.target.value)
                          }
                          placeholder="Remarks"
                        />
                      </td>
                      <td className="text-center">
                        <Button
                          variant="link"
                          onClick={() => removeProcess(proc.id)}
                          className="text-danger"
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>

            <div className="d-flex justify-content-end mt-3">
              <Button onClick={addProcess} variant="primary">
                <FaPlusCircle className="me-2" /> Add Another Process
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Accordion.Collapse>
    </Card>
  );
};

export default ProjectRegistrationKickoffSheet;
