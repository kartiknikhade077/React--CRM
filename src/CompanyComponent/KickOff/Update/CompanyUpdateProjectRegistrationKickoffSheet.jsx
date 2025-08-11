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
  id,
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


  // Initialize parts from initialPartsData
  // =========================
  useEffect(() => {
    if (!partsInitialized.current &&
      Array.isArray(initialPartsData) &&
      initialPartsData.length > 0) {

      const safeParts = initialPartsData.map((p) => ({
        ...p,
        id: p.partId || Date.now() + Math.random(),
        itemNo: typeof p.itemNo === "string" ? p.itemNo : `PT-${p.itemNo || 0}`,
        images: Array.isArray(p.imageList) ? p.imageList : [],
        partName: p.partName || "",
        material: p.material || "",
        thickness: p.thickness || ""
      }));

      setParts(safeParts);
      setActivePartItemNo(safeParts[0]?.itemNo || null);

      // Determine latest auto-number
      const numbers = safeParts.map((part) => {
        const match = `${part.itemNo}`.match(/PT-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      });
      setLatestItemNumber(numbers.length ? Math.max(...numbers) : 0);

      partsInitialized.current = true;
    }
  }, [initialPartsData]);

  // =========================
  // Initialize processes from initialProcessesData
  // =========================
  useEffect(() => {
    if (!processesInitialized.current &&
      Array.isArray(initialProcessesData) &&
      initialProcessesData.length > 0) {

      const grouped = {};
      initialProcessesData.forEach((proc) => {
        const itemNo =
          typeof proc.itemNo === "string" ? proc.itemNo : `PT-${proc.itemNo || 0}`;
        if (!grouped[itemNo]) grouped[itemNo] = [];

        grouped[itemNo].push({
          ...proc,
          id: proc.partProcessId || Date.now() + Math.random(),
          woNo: proc.workOrderNumber || "",
          designer: proc.employeeId || "",
          designerName: proc.designerName || "",
          opNo: proc.operationNumber || "",
          processName: proc.process || "",
          length: proc.length || "",
          width: proc.width || "",
          height: proc.height || "",
          remarks: proc.remarks || ""
        });
      });

      setProcessesByPart(grouped);
      processesInitialized.current = true;
    }
  }, [initialProcessesData]);



  // =========================
  // Initialize processes
  // =========================


  // =========================
  // Set active part if null
  // =========================
  useEffect(() => {
    if (!activePartItemNo && parts.length > 0) {
      setActivePartItemNo(parts[0].itemNo);
    }
  }, [parts, activePartItemNo]);



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



  // ...existing code from your component above

  // ✅ Save Parts API
  const handleUpdateParts = async () => {
    try {
      for (const p of parts) {
        const payload = {
          itemId: p.partId || p.id, // assuming p.partId exists; if not, send null
          kickOffId: id, // pass via props
          itemNo: typeof p.itemNo === "string" ? parseInt(p.itemNo.replace(/^PT-/, ""), 10) : p.itemNo,
          partName: p.partName,
          material: p.material,
          thickness: p.thickness
        };
        await axiosInstance.put("/kickoff/updateItem", payload);
      }
      alert("Parts updated successfully!");
    } catch (error) {
      console.error("Failed to update parts:", error);
      alert("Failed to update parts");
    }
  };

  // ✅ Save Processes API
  const handleUpdateProcesses = async () => {
    try {
      const allProcesses = Object.values(processesByPart).flat().map((proc) => ({
        partProcessId: proc.partProcessId || proc.id,
        kickOffId: id,
        itemNo: typeof proc.itemNo === "string"
          ? parseInt(proc.itemNo.replace(/^PT-/, ""), 10)
          : proc.itemNo,
        workOrderNumber: proc.woNo,
        designerName: proc.designerName || (employeeList.find(e => e.employeeId === proc.designer)?.name || ""),
        employeeId: proc.designer,
        process: proc.processName,
        length: parseFloat(proc.length) || 0,
        height: parseFloat(proc.height) || 0,
        width: parseFloat(proc.width) || 0,
        remarks: proc.remarks || ""
      }));
      await axiosInstance.put("/kickoff/updateKickOffItemsProccess", allProcesses);
      alert("Processes updated successfully!");
    } catch (error) {
      console.error("Failed to update processes:", error);
      alert("Failed to update processes");
    }
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
            <Button variant="primary" onClick={handleUpdateParts}>
//               Update Parts
//             </Button>
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
                    className={`px-3 py-2 me-2 ${activePartItemNo === part.itemNo
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
                              <option key={emp.employeeId} value={emp.employeeId}>
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
                  <Button variant="success" onClick={handleUpdateProcesses}>
//               Update Processes
//             </Button>
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
