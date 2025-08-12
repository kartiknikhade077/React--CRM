import React, { useEffect, useState } from "react";
import axiosInstance from "../../BaseComponet/axiosInstance";
import Select from "react-select";
import {
  Accordion,
  Card,
  Form,
  Row,
  Col,
  Button,
  Table,
  Dropdown,
} from "react-bootstrap";
import { FaTrash, FaPlusCircle, FaSave } from "react-icons/fa";
import { toast } from "react-toastify";

const ProjectRegistrationKickoffSheet = ({
  eventKey,
  activeKey,
  CustomToggle,
  handleAccordionClick,
  customerId,
  onProjectDataChange,
  onPartsChange,
  onProcessesChange,

}) => {
  const [projectData, setProjectData] = useState({
    projectId: "",
    projectName: "",
    projectTitle: "",
    kickOffDate: "",
    startDate: "",
  });
  // ---------------- State for Part Details ----------------

  const [latestItemNumber, setLatestItemNumber] = useState(1540);
  const [activePartItemNo, setActivePartItemNo] = useState("PT-1");
  // const [activePartItemNo, setActivePartItemNo] = useState(null);
  const [processesByPart, setProcessesByPart] = useState({});

  const [parts, setParts] = useState([]);

  const suffixOptions = ["UL", "CF", "LF", "TL"];

  const partProcesses = processesByPart[activePartItemNo] || [];
  const getSuffix = (woNo) => woNo?.replace(activePartItemNo, "") || "";

  const isManualProcess = (suffix) =>
    /^[A-Z]$/.test(suffix) && !suffixOptions.includes(suffix);

  const manualProcesses = partProcesses
    .filter((p) => isManualProcess(getSuffix(p.woNo)))
    .sort((a, b) => getSuffix(a.woNo).localeCompare(getSuffix(b.woNo)));

  const workorderProcesses = partProcesses
    .filter((p) => !isManualProcess(getSuffix(p.woNo)))
    .sort((a, b) => getSuffix(a.woNo).localeCompare(getSuffix(b.woNo)));

  const sortedProcesses = [...manualProcesses, ...workorderProcesses];


  const filteredProcesses = sortedProcesses.filter(
    (proc) => proc.itemNo === activePartItemNo
  );

  const addPart = () => {
    // Extract numeric itemNos from existing parts
    const existingNumbers = parts.map((part) => {
      const match = part.itemNo.match(/PT-(\d+)/);
      return match ? parseInt(match[1]) : 0;
    });

    // Get max between fetched parts and API result
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
      isNew: true,
    };

    const updatedParts = [...parts, newPart];

    setParts(updatedParts);
    setActivePartItemNo(newPart.itemNo);
    setProcessesByPart((prev) => ({
      ...prev,
      [newPart.itemNo]: [],
    }));
    setLatestItemNumber(nextItemNumber);
  };

  const removePart = (id) => {
    setParts(parts.filter((part) => part.id !== id));
  };

  const updatePart = (id, field, value) => {
    setParts(
      parts.map((part) => (part.id === id ? { ...part, [field]: value } : part))
    );
  };

  useEffect(() => {
    onPartsChange && onPartsChange(parts);
  }, [parts]);
  // ---------------- State for Part Process ----------------

  const addProcess = () => {
    if (!activePartItemNo) return;

    const existingProcesses = processesByPart[activePartItemNo] || [];

    // Collect manual suffixes only (A, B, C...)
    const manualSuffixes = existingProcesses
      .map((p) => getSuffix(p.woNo))
      .filter((suf) => isManualProcess(suf));

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
      [activePartItemNo]: [...existingProcesses, newProc],
    }));
  };

  const removeProcess = (id) => {
    // Find the process being deleted
    const procList = processesByPart[activePartItemNo] || [];
    const deletedProc = procList.find((p) => p.id === id);

    const suffix = deletedProc
      ? deletedProc.woNo.replace(activePartItemNo, "")
      : null;

    setProcessesByPart((prev) => ({
      ...prev,
      [activePartItemNo]: prev[activePartItemNo].filter((p) => p.id !== id),
    }));

    if (suffix && suffixOptions.includes(suffix)) {
      setSelectedProcessesByPart((prev) => {
        const old = prev[activePartItemNo] || [];
        return {
          ...prev,
          [activePartItemNo]: old.filter((opt) => opt.value !== suffix),
        };
      });
    }
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

  const processOptions = [
    { label: "UL", value: "UL" },
    { label: "CF", value: "CF" },
    { label: "LF", value: "LF" },
    { label: "TL", value: "TL" },
  ];

  const [selectedProcessesByPart, setSelectedProcessesByPart] = useState({});

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");

  useEffect(() => {
    

    if (customerId) {
      
      axiosInstance
        .get(`/project/getProjectByCustomerId/${customerId}`)
        .then((res) => {
          setProjects(res.data);
        })
        .catch((err) => {
          console.error("Error fetching projects:", err);
        });
    }
  }, [customerId]);

  useEffect(() => {
    if (!selectedProjectId) return;

    setParts([]);
    setProcessesByPart({});
    setActivePartItemNo(null);

    axiosInstance
      .get(`/work/getWorkOrderItemsByProjectId/${selectedProjectId}`)
      .then((res) => {
        const data = res.data;
        populatePartsAndProcesses(data);
      })
      .catch((err) => {
        console.error("Error fetching part/process data:", err);
      });
  }, [selectedProjectId]);



  // const populatePartsAndProcesses = (data) => {
  //   const { partProcess, partDetails } = data;

  //   const groupedByItem = {};

  //   // Group processes by itemNo
  //   partProcess.forEach((item) => {
  //     const key = `PT-${item.itemNo}`;
  //     if (!groupedByItem[key]) groupedByItem[key] = [];
  //     groupedByItem[key].push(item);
  //   });

  //   const newParts = [];
  //   const newProcessesByPart = {};

  //   partDetails.forEach((partDetail, index) => {
  //     const itemNo = `PT-${partDetail.itemNo}`;
  //     const part = {
  //       id: Date.now() + index,
  //       itemNo: itemNo,
  //       partName: partDetail.partName || "",
  //       material: partDetail.material || "",
  //       thickness: partDetail.thickness || "",
  //       images: [],
  //     };

  //     newParts.push(part);

  //     const processes = (groupedByItem[itemNo] || []).map((proc, idx) => ({
  //       id: Date.now() + index * 10 + idx,
  //       woNo: proc.workOrderNo,
  //       itemNo: itemNo,
  //       designer: "", // still hardcoded
  //       opNo: proc.opNo || "",
  //       processName: proc.proceess || "",
  //       length: proc.length || "",
  //       width: proc.width || "",
  //       height: proc.height || "",
  //       remarks: proc.remark || "",
  //     }));

  //     newProcessesByPart[itemNo] = processes;
  //   });

  //   setParts(newParts);
  //   setProcessesByPart(newProcessesByPart);

  //   if (newParts.length > 0) {
  //     setActivePartItemNo(newParts[0].itemNo);
  //   }
  // };

  const populatePartsAndProcesses = (data) => {
    const { partProcess, partDetails } = data;

    const groupedByItem = {};

    // Group processes by itemNo
    partProcess.forEach((item) => {
      const key = `PT-${item.itemNo}`;
      if (!groupedByItem[key]) groupedByItem[key] = [];
      groupedByItem[key].push(item);
    });

    const newParts = [];
    const newProcessesByPart = {};

    partDetails.forEach((partDetail, index) => {
      const itemNo = `PT-${partDetail.itemNo}`;

      let apiImages = [];
      if (partDetail.imageList) {
        if (Array.isArray(partDetail.imageList)) {
          // Map base64 strings to proper data URLs
          apiImages = partDetail.imageList.map((base64Str) => ({
            type: "api",
            url: `data:image/jpeg;base64,${base64Str}`,
          }));
        } else if (typeof partDetail.imageList === "string") {
          apiImages = [
            {
              type: "api",
              url: `data:image/jpeg;base64,${partDetail.images}`,
            },
          ];
        }
      }

      const part = {
        id: Date.now() + index,
        itemNo,
        partName: partDetail.partName || "",
        material: partDetail.material || "",
        thickness: partDetail.thickness || "",
        images: apiImages,
        isNew: false,
      };

      newParts.push(part);

      const processes = (groupedByItem[itemNo] || []).map((proc, idx) => ({
        id: Date.now() + index * 10 + idx,
        woNo: proc.workOrderNo,
        itemNo,
        designer: "",
        opNo: proc.opNo || "",
        processName: proc.proceess || "",
        length: proc.length || "",
        width: proc.width || "",
        height: proc.height || "",
        remarks: proc.remark || "",
      }));

      newProcessesByPart[itemNo] = processes;
    });

    setParts(newParts);
    setProcessesByPart(newProcessesByPart);

    if (newParts.length > 0) {
      setActivePartItemNo(newParts[0].itemNo);
    }
  };

  const fetchMaxItemNumber = async () => {
    try {
      console.log("Fetching max item number...");
      const response = await axiosInstance.get("/work/getMaxItemNumber");

      console.log("API response:", response.data);

      if (response.data) {
        const numericPart = parseInt(
          response.data.toString().replace(/\D/g, ""),
          10
        );
        console.log("Parsed max number is == ", numericPart);
        setLatestItemNumber(numericPart); // CORRECT setter
      }
    } catch (error) {
      console.error("Failed to fetch max item number:", error);
    }
  };

  useEffect(() => {
    fetchMaxItemNumber();
  }, []);

  useEffect(() => {
    onProjectDataChange(projectData);
  }, [projectData, onProjectDataChange]);

  useEffect(() => {
    const selectedProject = projects.find(
      (p) => p.projectId === selectedProjectId
    );
    setProjectData((prev) => ({
      ...prev,
      projectId: selectedProjectId || "",
      projectName: selectedProject ? selectedProject.projectName : "",
    }));
  }, [selectedProjectId, projects]);

  // Handler to update other project fields
  const handleProjectFieldChange = (field, value) => {
    setProjectData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    onProcessesChange &&
      onProcessesChange(flattenProcessesByPart(processesByPart));
  }, [processesByPart, onProcessesChange]);

  const flattenProcessesByPart = (processesByPart) => {
    return Object.values(processesByPart).flat();
  };

  // For Dropdown employelist table
  const [employeeList, setEmployeeList] = useState([]);

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

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="projectName">
                <Form.Label>
                  Enter Project Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  value={selectedProjectId}
                  // onChange={(e) => setSelectedProjectId(e.target.value)}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedProjectId(id);
                    setProjectData((prev) => ({
                      ...prev,
                      projectName: e.target.value,
                    }));
                    console.log("Selected Project ID:", id); // Add this log to confirm
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
                        {part.images.map((img, idx) => {
                          const src =
                            img.type === "api"
                              ? img.url // already has data:image/jpeg;base64,...
                              : URL.createObjectURL(img); // for uploaded files

                          return (
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
                                src={src}
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
                          );
                        })}

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
                          // onChange={(e) => {
                          //   const newImages = Array.from(e.target.files);
                          //   updatePart(part.id, "images", [
                          //     ...part.images,
                          //     ...newImages,
                          //   ]);
                          // }}

                          onChange={(e) => {
                            const selectedFiles = Array.from(e.target.files);

                            // Only allow files <= 1 MB
                            const validFiles = selectedFiles.filter((file) => {
                              if (file.size > 1024 * 1024) {
                                // 1MB = 1024 * 1024 bytes
                                alert(
                                  `${file.name} is larger than 1 MB and will be skipped.`
                                );
                                return false;
                              }
                              return true;
                            });

                            if (validFiles.length > 0) {
                              updatePart(part.id, "images", [
                                ...part.images,
                                ...validFiles,
                              ]);
                            }

                            // Reset the input so user can re-select the same file if needed
                            e.target.value = "";
                          }}
                        />
                      </div>
                    </td>

                    <td className="text-center">
                      <Button variant="link" onClick={() => removePart(part.id)} className="text-danger">
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
                  {filteredProcesses.length > 0 ? (
                    filteredProcesses.map((proc) => (
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
        </Card.Body>
      </Accordion.Collapse>
    </Card>
  );
};

export default ProjectRegistrationKickoffSheet;
