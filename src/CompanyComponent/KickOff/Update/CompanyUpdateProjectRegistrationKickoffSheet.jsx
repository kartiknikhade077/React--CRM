import React, { useState, useEffect } from "react";
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
import axiosInstance from "../../../BaseComponet/axiosInstance";

const CompanyUpdateProjectRegistrationKickoffSheet = ({
  eventKey,
  activeKey,
  CustomToggle,
  handleAccordionClick,
  customerId,
  initialProjectData = {},
  initialPartsData = [],
  initialProcessesData = [],
  onProjectDataChange,
  onPartsChange,
  onProcessesChange,
}) => {
  // States for managing project
  const [projectData, setProjectData] = useState({
    projectId: "",
    projectName: "",
    projectTitle: "",
    kickOffDate: "",
    startDate: "",
    endDate: "",
  });
  const [selectedProjectId, setSelectedProjectId] = useState("");

  // Parts, processes, and active part
  const [parts, setParts] = useState([]);
  const [processesByPart, setProcessesByPart] = useState({});
  const [activePartItemNo, setActivePartItemNo] = useState(null);

  // To keep track of max part number suffix for new parts
  const [latestItemNumber, setLatestItemNumber] = useState(0);

  // Employee list for designer dropdowns
  const [employeeList, setEmployeeList] = useState([]);

  // Fetch employee list once
  useEffect(() => {
    axiosInstance
      .get("/company/getEmployeeList/0/10")
      .then((response) => {
        setEmployeeList(response.data.employeeList || []);
      })
      .catch((err) => {
        console.error("Failed to fetch employee list:", err);
      });
  }, []);

  // Initialize project data when initialProjectData changes
  useEffect(() => {
    if (initialProjectData && Object.keys(initialProjectData).length > 0) {
      setProjectData({
        projectId: initialProjectData.projectId || "",
        projectName: initialProjectData.projectName || "",
        projectTitle: initialProjectData.projectTitle || "",
        kickOffDate: initialProjectData.kickOffDate || "",
        startDate: initialProjectData.startDate || "",
        endDate: initialProjectData.endDate || "",
      });
      setSelectedProjectId(initialProjectData.projectId || "");
    }
  }, [initialProjectData]);

  // Initialize parts when initialPartsData changes
  useEffect(() => {
    if (Array.isArray(initialPartsData) && initialPartsData.length > 0) {
      // Ensure images array exists on every part to avoid errors
   const safeParts = initialPartsData.map((p) => ({
     ...p,
     itemNo: typeof p.itemNo === "string" ? p.itemNo : `PT-${p.itemNo || 0}`,
     images: Array.isArray(p.images) ? p.images : [],
   }));
   setParts(safeParts);

     
      setActivePartItemNo(safeParts[0]?.itemNo || null);

      // Calculate max item number suffix from initial parts
      const initialNumbers = safeParts.map((part) => {
        const match = part.itemNo?.match(/PT-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      });
      setLatestItemNumber(
        initialNumbers.length ? Math.max(...initialNumbers) : 0
      );
    } else {
      setParts([]);
      setActivePartItemNo(null);
      setLatestItemNumber(0);
    }
  }, [initialPartsData]);

  // Initialize processes when initialProcessesData changes
  useEffect(() => {
    if (
      Array.isArray(initialProcessesData) &&
      initialProcessesData.length > 0
    ) {
      const grouped = {};
      initialProcessesData.forEach((proc) => {
        if (!grouped[proc.itemNo]) grouped[proc.itemNo] = [];
        grouped[proc.itemNo].push(proc);
      });
      setProcessesByPart(grouped);
    } else {
      setProcessesByPart({});
    }
  }, [initialProcessesData]);

  // If activePartItemNo is null but parts exist (rare case), set it to first part
  useEffect(() => {
    if (!activePartItemNo && parts.length > 0) {
      setActivePartItemNo(parts[0].itemNo);
    }
  }, [parts, activePartItemNo]);

  // Fetch projects list when customerId changes
  const [projects, setProjects] = useState([]);
  useEffect(() => {
    if (customerId) {
      axiosInstance
        .get(`/project/getProjectByCustomerId/${customerId}`)

        .then((res) => {setProjects(res.data)}
      
      )
        .catch((err) => console.error("Error fetching projects:", err));
    } else {
      setProjects([]);
    }
  }, [customerId]);

  // Sync selectedProjectId and update projectData.projectName on project selection
  useEffect(() => {
    const selectedProject = projects.find(
      (p) => p.projectId === selectedProjectId
    );
    setProjectData((prev) => ({
      ...prev,
      projectId: selectedProjectId,
      projectName: selectedProject ? selectedProject.projectName : "",
    }));
  }, [selectedProjectId, projects]);

  // Inform parent about projectData changes
 

  // Utility to extract suffix from woNo
  const getSuffix = (woNo) => woNo?.replace(activePartItemNo, "") || "";

  // Suffixes considered normal (non-manual)
  const suffixOptions = ["UL", "CF", "LF", "TL"];
  const isManualProcess = (suffix) =>
    /^[A-Z]$/.test(suffix) && !suffixOptions.includes(suffix);

  // Processes for active part, sorted
  const partProcesses = processesByPart[activePartItemNo] || [];
  const manualProcesses = partProcesses
    .filter((p) => isManualProcess(getSuffix(p.woNo)))
    .sort((a, b) => getSuffix(a.woNo).localeCompare(getSuffix(b.woNo)));
  const workorderProcesses = partProcesses
    .filter((p) => !isManualProcess(getSuffix(p.woNo)))
    .sort((a, b) => getSuffix(a.woNo).localeCompare(getSuffix(b.woNo)));
  const sortedProcesses = [...manualProcesses, ...workorderProcesses];

  // Add a new part with incremented itemNo based on latestItemNumber
  const addPart = () => {
    const existingNumbers = parts.map((part) => {
      // Safely check if itemNo is a string before matching
      if (typeof part.itemNo === "string") {
        const match = part.itemNo.match(/PT-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      }
      // If itemNo is not string, return 0 or handle appropriately
      return 0;
    });

    const maxExisting = Math.max(latestItemNumber, ...existingNumbers);
    const nextItemNumber = maxExisting + 1;
    const newItemNo = `PT-${nextItemNumber}`;

    const newPart = {
      id: Date.now(),
      itemNo: newItemNo,
      partName: "",
      material: "",
      thickness: "",
      images: [],
    };

    setParts((prev) => [...prev, newPart]);
    setActivePartItemNo(newItemNo);
    setProcessesByPart((prev) => ({ ...prev, [newItemNo]: [] }));
    setLatestItemNumber(nextItemNumber);
  };

  // Remove a part and its processes, adjust active part if needed
  const removePart = (id) => {
    setParts((prev) => prev.filter((p) => p.id !== id));

    const part = parts.find((p) => p.id === id);
    if (part && part.itemNo in processesByPart) {
      setProcessesByPart((prev) => {
        const copy = { ...prev };
        delete copy[part.itemNo];
        return copy;
      });
    }

    if (activePartItemNo === part?.itemNo && parts.length > 1) {
      const remainingParts = parts.filter((p) => p.id !== id);
      if (remainingParts.length > 0) {
        setActivePartItemNo(remainingParts[0].itemNo);
      } else {
        setActivePartItemNo(null);
      }
    }
  };

  // Update a specific field of a part
  const updatePart = (id, field, value) => {
    setParts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  // Add a process to active part with next unused manual suffix
  const addProcess = () => {
    if (!activePartItemNo) return;
    const existingProcesses = processesByPart[activePartItemNo] || [];

    const manualSuffixes = existingProcesses
      .map((p) => getSuffix(p.woNo))
      .filter(isManualProcess);

    const allLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const usedSet = new Set(manualSuffixes);
    const nextSuffix = allLetters.find((letter) => !usedSet.has(letter)) || "Z";

    const woNo = `${activePartItemNo}${nextSuffix}`;

    const newProc = {
      id: Date.now(),
      woNo,
      itemNo: activePartItemNo,
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
      [activePartItemNo]: [...(prev[activePartItemNo] || []), newProc],
    }));
  };

  // Remove a process by id from current active part
  const removeProcess = (id) => {
    const procList = processesByPart[activePartItemNo] || [];
    setProcessesByPart((prev) => ({
      ...prev,
      [activePartItemNo]: procList.filter((p) => p.id !== id),
    }));
  };

  // Update a specific field of a process by id in active part
  const updateProcess = (id, field, value) => {
    setProcessesByPart((prev) => ({
      ...prev,
      [activePartItemNo]: prev[activePartItemNo].map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      ),
    }));
  };

  // Sync selected multi processes per active part for Select control
  const [selectedProcessesByPart, setSelectedProcessesByPart] = useState({});

  useEffect(() => {
    const selected = {};
    Object.entries(processesByPart).forEach(([itemNo, procs]) => {
      selected[itemNo] = procs.map((p) => ({
        label: getSuffix(p.woNo),
        value: getSuffix(p.woNo),
      }));
    });
    setSelectedProcessesByPart(selected);
  }, [processesByPart]);

  // Handle multi-select change for workorder suffixes of active part
  const handleCustomProcessChange = (newSelected) => {
    if (!activePartItemNo) return;
    const prevSelected = selectedProcessesByPart[activePartItemNo] || [];
    const prevValues = prevSelected.map((p) => p.value);
    const newValues = newSelected?.map((p) => p.value) || [];

    const added = newValues.filter((val) => !prevValues.includes(val));
    const removed = prevValues.filter((val) => !newValues.includes(val));

    const newProcesses = added.map((suffix) => ({
      id: Date.now() + Math.random(),
      woNo: `${activePartItemNo}${suffix}`,
      itemNo: activePartItemNo,
      designer: "",
      opNo: "",
      processName: "",
      length: "",
      width: "",
      height: "",
      remarks: "",
    }));

    setProcessesByPart((prev) => {
      let updatedList = prev[activePartItemNo] || [];
      updatedList = [...updatedList, ...newProcesses];
      updatedList = updatedList.filter((proc) => {
        const suffix = proc.woNo.replace(activePartItemNo, "");
        return !removed.includes(suffix);
      });
      return {
        ...prev,
        [activePartItemNo]: updatedList,
      };
    });

    setSelectedProcessesByPart((prev) => ({
      ...prev,
      [activePartItemNo]: newSelected || [],
    }));
  };

  // Handle project selection dropdown change
  const handleProjectSelect = (projectId) => {
    setSelectedProjectId(projectId);
  };


  const processOptions = [
    { label: "UL", value: "UL" },
    { label: "CF", value: "CF" },
    { label: "LF", value: "LF" },
    { label: "TL", value: "TL" },
  ];

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
          {/* Project Details Section */}
          <h5
            className="mb-3"
            style={{ borderLeft: "4px solid #1a3c8c", paddingLeft: "12px" }}
          >
            Project Details
          </h5>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="projectName">
                <Form.Label>
                  Enter Project Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  value={selectedProjectId}
                  onChange={(e) => {
                    const projectId = e.target.value;
                    setSelectedProjectId(projectId);
                    const selectedProject = projects.find(
                      (p) => p.projectId === projectId
                    );
                    setProjectData((prev) => ({
                      ...prev,
                      projectId: projectId,
                      projectName: selectedProject
                        ? selectedProject.projectName
                        : "",
                    }));
                  }}
                >
                  <option disabled value="">
                    Select Project
                  </option>
                  {projects.map((project) => (
                    <option key={project.projectId} value={project.projectId}>
                      {project.projectName}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="projectTitle">
                <Form.Label>Project Title</Form.Label>
                <Form.Control
                  type="text"
                  value={projectData.projectTitle}
                  onChange={(e) =>
                    setProjectData((prev) => ({
                      ...prev,
                      projectTitle: e.target.value,
                    }))
                  }
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col md={6}>
              <Form.Group controlId="kickOffDate">
                <Form.Label>Kick-Off Date</Form.Label>
                <Form.Control
                  type="date"
                  value={projectData.kickOffDate}
                  onChange={(e) =>
                    setProjectData((prev) => ({
                      ...prev,
                      kickOffDate: e.target.value,
                    }))
                  }
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Label>Delivery Date</Form.Label>
              <Row>
                <Col>
                  <Form.Text className="text-muted">T0 : 8/1/2025</Form.Text>
                  <Form.Control
                    type="date"
                    value={projectData.startDate}
                    onChange={(e) =>
                      setProjectData((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                  />
                </Col>
                <Col>
                  <Form.Text className="text-muted">T1 : 8/1/2025</Form.Text>
                  <Form.Control
                    type="date"
                    value={projectData.endDate}
                    onChange={(e) =>
                      setProjectData((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                  />
                </Col>
              </Row>
            </Col>
          </Row>

          {/* Parts Section */}
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
                        {part.images.map((img, idx) =>
                          typeof img === "string" ? (
                            <div
                              key={idx}
                              style={{
                                position: "relative",
                                width: "100px",
                                height: "100px",
                                border: "1px solid #ddd",
                                borderRadius: "4px",
                              }}
                            >
                              <img
                                src={img}
                                alt={`existing-${idx}`}
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
                          ) : (
                            <div
                              key={idx}
                              style={{
                                position: "relative",
                                width: "100px",
                                height: "100px",
                                border: "1px solid #ddd",
                                borderRadius: "4px",
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
                          )
                        )}

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
                            <div style={{ fontSize: "12px", marginTop: "4px" }}>
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

          <h5
            className="mb-3"
            style={{ borderLeft: "4px solid #1a3c8c", paddingLeft: "12px" }}
          >
            Part Process
          </h5>

          {/* Display part tabs */}
          {Array.isArray(parts) && parts.length > 0 && (
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

              {/* Process table */}
              <Table bordered responsive>
                <thead style={{ backgroundColor: "#002855", color: "white" }}>
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
                            value={proc.designer || ""}
                            onChange={(e) =>
                              updateProcess(proc.id, "designer", e.target.value)
                            }
                          >
                            <option value="">Select Designer</option>
                            {employeeList.map((emp) => (
                              <option
                                key={emp.employeeId}
                                value={emp.employeeId}
                              >
                                {emp.name}
                              </option>
                            ))}
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
                              updateProcess(proc.id, "remarks", e.target.value)
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

              {/* Multi select for workorder suffix */}
              {activePartItemNo && (
                <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
                  <strong className="me-2">Workorder Process</strong>
                  <Select
                    isMulti
                    isClearable
                    options={
                      processOptions
                    } /* <-- uncomment this if you have processOptions defined */
                    value={selectedProcessesByPart[activePartItemNo] || []}
                    onChange={handleCustomProcessChange}
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
        </Card.Body>
      </Accordion.Collapse>
    </Card>
  );
};

export default CompanyUpdateProjectRegistrationKickoffSheet;
