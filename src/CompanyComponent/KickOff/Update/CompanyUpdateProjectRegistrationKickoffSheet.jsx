import React, { useState, useEffect, useRef } from "react";
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
  // =================
  // State definitions
  // =================
  const [projectData, setProjectData] = useState({
    projectId: "",
    projectName: "",
    projectTitle: "",
    kickOffDate: "",
    startDate: "",
    endDate: "",
  });

  const [parts, setParts] = useState([]);
  const [processesByPart, setProcessesByPart] = useState({});
  const [activePartItemNo, setActivePartItemNo] = useState(null);
  const [latestItemNumber, setLatestItemNumber] = useState(0);
  const [employeeList, setEmployeeList] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedProcessesByPart, setSelectedProcessesByPart] = useState({});

  const flattenProcessesByPart = (pbp) => Object.values(pbp).flat();
  const [projectSelectOptions, setProjectSelectOptions] = useState([]);

  // =========================
  // Notify parent on changes
  // =========================
  useEffect(() => {
    onProjectDataChange && onProjectDataChange(projectData);
  }, [projectData, onProjectDataChange]);

  useEffect(() => {
    onPartsChange && onPartsChange(parts);
  }, [parts, onPartsChange]);

  useEffect(() => {
    onProcessesChange &&
      onProcessesChange(flattenProcessesByPart(processesByPart));
  }, [processesByPart, onProcessesChange]);

  // =========================
  // Fetch employees once
  // =========================
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

  // One-time initialization flags
  const projectInitialized = useRef(false);
  const partsInitialized = useRef(false);
  const processesInitialized = useRef(false);

  // =========================
  // Initialize parts (Update mode)
  // =========================
  useEffect(() => {
    if (
      !partsInitialized.current &&
      Array.isArray(initialPartsData) &&
      initialPartsData.length > 0
    ) {
      const safeParts = initialPartsData.map((p) => ({
        ...p,
        id: p.partId || Date.now() + Math.random(),
        itemNo: typeof p.itemNo === "string" ? p.itemNo : `PT-${p.itemNo || 0}`,
        images: Array.isArray(p.images) ? p.images : [],
      }));
      setParts(safeParts);
      setActivePartItemNo(safeParts[0]?.itemNo || null);

      const initialNumbers = safeParts.map((part) => {
        const match = part.itemNo?.match(/PT-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      });
      setLatestItemNumber(
        initialNumbers.length ? Math.max(...initialNumbers) : 0
      );

      partsInitialized.current = true;
    }
  }, [initialPartsData]);

  // =========================
  // Initialize processes
  // =========================
  useEffect(() => {
    if (
      !processesInitialized.current &&
      Array.isArray(initialProcessesData) &&
      initialProcessesData.length > 0
    ) {
      const grouped = {};
      initialProcessesData.forEach((proc) => {
        const itemNo =
          typeof proc.itemNo === "string"
            ? proc.itemNo
            : `PT-${proc.itemNo || 0}`;
        if (!grouped[itemNo]) grouped[itemNo] = [];
        grouped[itemNo].push({
          ...proc,
          id: proc.partProcessId || Date.now() + Math.random(),
        });
      });
      setProcessesByPart(grouped);
      processesInitialized.current = true;
    }
  }, [initialProcessesData]);

  // =========================
  // Set active part if null
  // =========================
  useEffect(() => {
    if (!activePartItemNo && parts.length > 0) {
      setActivePartItemNo(parts[0].itemNo);
    }
  }, [parts, activePartItemNo]);

  // =========================
  // Fetch projects for the selected customer
  // =========================
  const fetchProjectByCust = async () => {
    if (customerId) {
      console.log("customer id --", customerId);
      const response = await axiosInstance.get(
        `/project/getProjectByCustomerId/${customerId}`
      );
      console.log("checking data", response.data);

      const data = response.data;

      const options = data.map((p) => ({
        value: p.projectId,
        label: p.projectName,
        fullData: p,
      }));
      setProjectSelectOptions(options);
    } 
  };

  // =========================
  // Set initial react-select value in update mode
  // =========================
  // Update selectedProject for react-select after projects are fetched
  useEffect(() => {
    if (
      initialProjectData &&
      initialProjectData.projectId &&
      projects.length > 0
    ) {
      // Find the correct option object from your mapped options (not a new object)

      // Also, set projectData
      setProjectData((prev) => ({
        ...prev,
        projectId: initialProjectData.projectId,
        projectName: initialProjectData.projectName,
        projectTitle: initialProjectData.projectTitle || "",
        kickOffDate: initialProjectData.kickOffDate || "",
        startDate: initialProjectData.startDate || "",
        endDate: initialProjectData.endDate || "",
      }));
      
   
    }
       console.log("selected project name-->", initialProjectData);
       const options = {
         value: initialProjectData.projectId || "",
         label: initialProjectData.projectName || " test",
         fullData: {},
       };

       setSelectedProject(options);
    console.log("initial project data", initialProjectData.projectName);
 

    
    // Don't rely on a "one time" ref flag, always update when projects/initialProjectData change
  }, [projects, initialProjectData]);

  // =========================
  // Functions used in render
  // =========================
  const updatePart = (id, field, value) => {
    setParts((prev) =>
      prev.map((part) => (part.id === id ? { ...part, [field]: value } : part))
    );
  };

  const removePart = (id) => {
    setParts((prev) => prev.filter((part) => part.id !== id));
    const part = parts.find((p) => p.id === id);
    if (part && processesByPart[part.itemNo]) {
      setProcessesByPart((prev) => {
        const copy = { ...prev };
        delete copy[part.itemNo];
        return copy;
      });
    }
    if (activePartItemNo === part?.itemNo) {
      const remaining = parts.filter((p) => p.id !== id);
      setActivePartItemNo(remaining.length ? remaining[0].itemNo : null);
    }
  };

  const addPart = () => {
    const existingNumbers = parts.map((part) => {
      const match =
        typeof part.itemNo === "string" && part.itemNo.match(/PT-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    });
    const maxExisting = Math.max(latestItemNumber, ...existingNumbers);
    const nextNumber = maxExisting + 1;
    const newItemNo = `PT-${nextNumber}`;
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
    setLatestItemNumber(nextNumber);
  };

  const updateProcess = (id, field, value) => {
    setProcessesByPart((prev) => ({
      ...prev,
      [activePartItemNo]: prev[activePartItemNo].map((proc) =>
        proc.id === id ? { ...proc, [field]: value } : proc
      ),
    }));
  };

  const removeProcess = (id) => {
    setProcessesByPart((prev) => ({
      ...prev,
      [activePartItemNo]: (prev[activePartItemNo] || []).filter(
        (proc) => proc.id !== id
      ),
    }));
  };

  const getSuffix = (woNo) => woNo?.replace(activePartItemNo, "") || "";
  const suffixOptions = ["UL", "CF", "LF", "TL"];
  const isManualProcess = (suffix) =>
    /^[A-Z]$/.test(suffix) && !suffixOptions.includes(suffix);

  const partProcesses = processesByPart[activePartItemNo] || [];
  const manualProcesses = partProcesses
    .filter((p) => isManualProcess(getSuffix(p.woNo)))
    .sort((a, b) => getSuffix(a.woNo).localeCompare(getSuffix(b.woNo)));
  const workorderProcesses = partProcesses
    .filter((p) => !isManualProcess(getSuffix(p.woNo)))
    .sort((a, b) => getSuffix(a.woNo).localeCompare(getSuffix(b.woNo)));

  const sortedProcesses = [...manualProcesses, ...workorderProcesses];

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
      return { ...prev, [activePartItemNo]: updatedList };
    });

    setSelectedProcessesByPart((prev) => ({
      ...prev,
      [activePartItemNo]: newSelected || [],
    }));
  };

  const processOptions = [
    { label: "UL", value: "UL" },
    { label: "CF", value: "CF" },
    { label: "LF", value: "LF" },
    { label: "TL", value: "TL" },
  ];

  const addProcess = () => {
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
                <Select
                  options={projectSelectOptions}
                  value={selectedProject} // if null, shows placeholder. If set, shows "Project Name"
                  onChange={(option) => {
                    setSelectedProject(option);
                  }}
                  placeholder="Select Project..."
                  isClearable
                  onMenuOpen={fetchProjectByCust}
                />
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

          {/* Part Details */}
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
                  <tr key={part.id || part.partId}>
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
                            }}
                          >
                            <img
                              src={
                                typeof img === "string"
                                  ? img
                                  : URL.createObjectURL(img)
                              }
                              alt={`img-${idx}`}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                            <button
                              type="button"
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
                        {/* Add More Images */}
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

          {/* Part Process */}
          <h5
            className="mb-3"
            style={{ borderLeft: "4px solid #1a3c8c", paddingLeft: "12px" }}
          >
            Part Process
          </h5>

          {parts.length > 0 && (
            <div>
              <div className="d-flex mb-2">
                {parts.map((part) => (
                  <div
                    key={part.itemNo}
                    className={`px-3 py-2 me-2 ${
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

              {/* Processes Table */}
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
                            {[
                              "05",
                              "10",
                              "20",
                              "30",
                              "40",
                              "50",
                              "60",
                              "70",
                              "80",
                              "90",
                              "100",
                              "120",
                              "140",
                              "160",
                              "180",
                              "200",
                              "XX",
                            ].map((val) => (
                              <option key={val} value={val}>
                                {val}
                              </option>
                            ))}
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

              {/* Multi-select for Workorder Process */}
              {activePartItemNo && (
                <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
                  <strong className="me-2">Workorder Process</strong>
                  <Select
                    isMulti
                    isClearable
                    options={processOptions}
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
