import React, { useState } from "react";
import Select from "react-select";
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
  const [activePartItemNo, setActivePartItemNo] = useState(null);
  const [processesByPart, setProcessesByPart] = useState({});

  const [parts, setParts] = useState([]);

  const suffixOptions = ["UL", "CF", "LF", "TL"];
  const [selectedSuffixByPart, setSelectedSuffixByPart] = useState({});

  const partProcesses = processesByPart[activePartItemNo] || [];

  const getSuffix = (woNo) => woNo.replace(activePartItemNo, "");
  const isManualProcess = (suffix) => /^[A-Z]$/.test(suffix);

  const manualProcesses = partProcesses
    .filter((p) => isManualProcess(getSuffix(p.woNo)))
    .sort((a, b) => getSuffix(a.woNo).localeCompare(getSuffix(b.woNo)));

  const workorderProcesses = partProcesses
    .filter((p) => !isManualProcess(getSuffix(p.woNo)))
    .sort((a, b) => getSuffix(a.woNo).localeCompare(getSuffix(b.woNo)));

  const sortedProcesses = [...manualProcesses, ...workorderProcesses];

  const addPart = () => {
    const newPart = {
      id: Date.now(),
      itemNo: `PT-${1540 + parts.length + 1}`,
      partName: "",
      material: "",
      thickness: "",
      images: [],
    };
    const updatedParts = [...parts, newPart];
    setParts(updatedParts);
    setActivePartItemNo(newPart.itemNo); // Set tab active
    setProcessesByPart((prev) => ({
      ...prev,
      [newPart.itemNo]: [], // initialize empty process list
    }));
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
    if (!activePartItemNo) return;


    const existingProcesses = processesByPart[activePartItemNo] || [];

    // Filter only manual processes (e.g. A, B, C, ...)
    const manualSuffixes = existingProcesses
      .map((p) => getSuffix(p.woNo))
      .filter((suf) => /^[A-Z]$/.test(suf) && !suffixOptions.includes(suf));

    // Get next unused alphabet suffix
    const allLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const usedSet = new Set(manualSuffixes);
    const nextSuffix = allLetters.find((letter) => !usedSet.has(letter)) || "Z";

    const woNo = `${activePartItemNo}${nextSuffix}`;

    const newProc = {
      id: Date.now(),
      woNo,
      designer: "",
      opNo: "",
      processName: "",
      length: "",
      width: "",
      height: "",
      remarks: "",
    };

    setProcessesByPart((prev) => ({
      ...prev,
      [activePartItemNo]: [...existingProcesses, newProc],
    }));
  };

  const removeProcess = (id) => {
    setProcessesByPart((prev) => ({
      ...prev,
      [activePartItemNo]: prev[activePartItemNo].filter((p) => p.id !== id),
    }));
  };

  const updateProcess = (id, field, value) => {
    setProcessesByPart((prev) => ({
      ...prev,
      [activePartItemNo]: prev[activePartItemNo].map((proc) =>
        proc.id === id ? { ...proc, [field]: value } : proc
      ),
    }));
  };

  const getAlphabetSuffix = (index) => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return letters[index] || String.fromCharCode(65 + index); // fallback
  };

const handleCustomProcessChange = (newSelected) => {
  const prevSelected = selectedProcessesByPart[activePartItemNo] || [];
  const prevValues = prevSelected.map((p) => p.value);
  const newValues = newSelected?.map((p) => p.value) || [];

  const added = newValues.filter((val) => !prevValues.includes(val));
  const removed = prevValues.filter((val) => !newValues.includes(val));

  const newProcesses = added.map((suffix) => {
    const woNo = `${activePartItemNo}${suffix}`;
    return {
      id: Date.now() + Math.random(),
      woNo,
      designer: "",
      opNo: "",
      processName: "",
      length: "",
      width: "",
      height: "",
      remarks: "",
    };
  });

  setProcessesByPart((prev) => {
    let updated = prev[activePartItemNo] || [];

    // Add new ones
    updated = [...updated, ...newProcesses];

    // Remove removed suffixes
    updated = updated.filter((proc) => {
      const suffix = proc.woNo.replace(activePartItemNo, "");
      return !removed.includes(suffix);
    });

    // Sort logic
    const isManual = (suffix) => /^[A-Z]$/.test(suffix) && !suffixOptions.includes(suffix);

    const manualRows = updated
      .filter((p) => isManual(p.woNo.replace(activePartItemNo, "")))
      .sort((a, b) =>
        a.woNo.replace(activePartItemNo, "").localeCompare(b.woNo.replace(activePartItemNo, ""))
      );

    const workorderRows = updated
      .filter((p) => !isManual(p.woNo.replace(activePartItemNo, "")))
      .sort((a, b) =>
        a.woNo.replace(activePartItemNo, "").localeCompare(b.woNo.replace(activePartItemNo, ""))
      );

    return {
      ...prev,
      [activePartItemNo]: [...manualRows, ...workorderRows],
    };
  });

  setSelectedProcessesByPart((prev) => ({
    ...prev,
    [activePartItemNo]: newSelected,
  }));
};


  const processOptions = [
    { label: "UL", value: "UL" },
    { label: "CF", value: "CF" },
    { label: "LF", value: "LF" },
    { label: "TL", value: "TL" },
  ];

  const [selectedProcessesByPart, setSelectedProcessesByPart] = useState({});

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
                        <Form.Control
                          type="text"
                          placeholder="Enter Part Name"
                          value={part.partName}
                          onChange={(e) =>
                            updatePart(part.id, "partName", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="text"
                          placeholder="Enter Material"
                          value={part.material}
                          onChange={(e) =>
                            updatePart(part.id, "material", e.target.value)
                          }
                        />
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
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          {part.images.map((img, idx) => (
                            <div
                              key={idx}
                              style={{
                                position: "relative",
                                width: "100px",
                                height: "100px",
                                border: "1px solid #ddd",
                                borderRadius: "4px",
                                // overflow: "hidden",
                              }}
                            >
                              <img
                                src={URL.createObjectURL(img)}
                                alt={`preview-${idx}`}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                              <button
                                onClick={() => {
                                  const updatedImages = [...part.images];
                                  updatedImages.splice(idx, 1);
                                  updatePart(part.id, "images", updatedImages);
                                }}
                                style={{
                                  position: "absolute",
                                  top: "-8px",
                                  right: "-8px",
                                  background: "red",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "50%",
                                  width: "24px",
                                  height: "24px",
                                  cursor: "pointer",
                                  fontSize: "14px",
                                }}
                              >
                                ×
                              </button>
                            </div>
                          ))}

                          {/* Add More Images Button */}
                          <div
                            className="d-flex align-items-center justify-content-center"
                            style={{
                              border: "2px dashed #ccc",
                              padding: "12px",
                              cursor: "pointer",
                              borderRadius: "6px",
                              textAlign: "center",
                              minWidth: "100px",
                              height: "100px",
                              flexDirection: "column",
                              backgroundColor: "#f9f9f9",
                            }}
                            onClick={() =>
                              document
                                .getElementById(`multi-image-upload-${part.id}`)
                                .click()
                            }
                          >
                            <div className="text-center text-muted">
                              <i className="bi bi-plus-circle fs-4" />
                              <div
                                style={{ fontSize: "12px", marginTop: "4px" }}
                              >
                                Add More Images
                              </div>
                            </div>
                          </div>

                          {/* Hidden Input for Multiple Images */}
                          <input
                            type="file"
                            id={`multi-image-upload-${part.id}`}
                            accept="image/*"
                            multiple
                            style={{ display: "none" }}
                            onChange={(e) => {
                              const newImages = Array.from(e.target.files);
                              updatePart(part.id, "images", [
                                ...part.images,
                                ...newImages,
                              ]);
                            }}
                          />
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

            {/* -------- Part Process Tabs -------- */}
            {parts.length > 0 && (
              <div>
                <div className="d-flex mb-2">
                  {parts.map((part) => (
                    <div
                      key={part.itemNo}
                      className={`px-3 py-2 me-2 cursor-pointer ${
                        activePartItemNo === part.itemNo
                          ? "bg-primary text-white"
                          : "bg-light"
                      }`}
                      style={{ borderRadius: "4px", cursor: "pointer" }}
                      onClick={() => setActivePartItemNo(part.itemNo)}
                    >
                      {part.itemNo}
                    </div>
                  ))}
                </div>

                {/* -------- Process Table for Active Part -------- */}
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
                      <th>Length</th>
                      <th>Width</th>
                      <th>Height</th>
                      <th>Remarks</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedProcesses.length > 0 ? (
                      sortedProcesses.map((proc) => (
                        <tr key={proc.id}>
                          <td>
                            <Form.Control
                              value={proc.woNo}
                              onChange={(e) =>
                                updateProcess(proc.id, "woNo", e.target.value)
                              }
                            />
                          </td>
                          <td>
                            <Form.Select
                              value={proc.designer}
                              onChange={(e) =>
                                updateProcess(
                                  proc.id,
                                  "designer",
                                  e.target.value
                                )
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
                            />
                          </td>
                          <td>
                            <Form.Control
                              value={proc.length}
                              onChange={(e) =>
                                updateProcess(proc.id, "length", e.target.value)
                              }
                            />
                          </td>
                          <td>
                            <Form.Control
                              value={proc.width}
                              onChange={(e) =>
                                updateProcess(proc.id, "width", e.target.value)
                              }
                            />
                          </td>
                          <td>
                            <Form.Control
                              value={proc.height}
                              onChange={(e) =>
                                updateProcess(proc.id, "height", e.target.value)
                              }
                            />
                          </td>
                          <td>
                            <Form.Control
                              value={proc.remarks}
                              onChange={(e) =>
                                updateProcess(
                                  proc.id,
                                  "remarks",
                                  e.target.value
                                )
                              }
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
                    ) : (
                      <tr>
                        <td colSpan="9" className="text-center text-muted py-4">
                          No processes for this part yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>

                {activePartItemNo && (
                  <div className="d-flex align-items-center just0fy-content-between gap-2 mb-3">
                    <strong className="me-2">Workorder Process</strong>
                    <Select
                      isMulti
                      isClearable
                      options={processOptions}
                      value={selectedProcessesByPart[activePartItemNo] || []}
                      onChange={(newSelected) =>
                        handleCustomProcessChange(newSelected)
                      }
                      placeholder="Select from list..."
                      className="flex-grow-1"
                      styles={{
                        container: (base) => ({ ...base, width: "300px" }),
                      }}
                    />
                    <Button onClick={addProcess} variant="primary">
                      <FaPlusCircle className="me-2" /> Add Another Process
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Form>
        </Card.Body>
      </Accordion.Collapse>
    </Card>
  );
};

export default ProjectRegistrationKickoffSheet;
