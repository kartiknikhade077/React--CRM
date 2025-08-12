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
  selectedProjectId,
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
  const [selectedProcessesByPart, setSelectedProcessesByPart] = useState({});

  const flattenProcessesByPart = (pbp) => Object.values(pbp).flat();

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

  // =========================
  // Fetch new parts/processes whenever selectedProjectId changes
  // =========================
  useEffect(() => {
    // CASE 1: initial load from parent kickoff data (no project switch yet)
    if (!selectedProjectId) {
      if (Array.isArray(initialPartsData) && initialPartsData.length > 0) {
        setParts(
          initialPartsData.map((p, idx) => ({
            ...p,
            id: p.itemId || Date.now() + idx,
            itemNo:
              typeof p.itemNo === "string" ? p.itemNo : `PT-${p.itemNo || 0}`,
            images: Array.isArray(p.imageList) ? p.imageList : [],
            partName: p.partName || "",
            material: p.material || "",
            thickness: p.thickness || "",
          }))
        );

        // processes
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
            woNo: proc.workOrderNumber || "",
            designer: proc.employeeId || "",
            designerName: proc.designerName || "",
            opNo: proc.operationNumber || "",
            processName: proc.process || "",
            length: proc.length || "",
            width: proc.width || "",
            height: proc.height || "",
            remarks: proc.remarks || "",
          });
        });
        setProcessesByPart(grouped);

        if (initialPartsData.length > 0) {
          setActivePartItemNo(
            typeof initialPartsData[0].itemNo === "string"
              ? initialPartsData[0].itemNo
              : `PT-${initialPartsData[0].itemNo || 0}`
          );
        }

        // compute latest number
        const numbers = initialPartsData.map((part) => {
          const match = `${part.itemNo}`.match(/PT-(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        });
        setLatestItemNumber(numbers.length ? Math.max(...numbers) : 0);
      }
      return;
    }

    // CASE 2: project changed → fetch from project API
    setParts([]);
    setProcessesByPart({});
    setActivePartItemNo(null);
    setLatestItemNumber(0);

    axiosInstance
      .get(`/work/getWorkOrderItemsByProjectId/${selectedProjectId}`)
      .then((res) => {
        if (res.data) {
          populatePartsAndProcesses(res.data);
        }
      })
      .catch((err) => {
        console.error("Error fetching part/process data:", err);
      });

    fetchMaxItemNumber(); // optional per project
  }, [selectedProjectId, initialPartsData, initialProcessesData]);

  // Function to populate Parts & Processes from API data
  const populatePartsAndProcesses = (data) => {
    const { partProcess, partDetails } = data;

    const groupedByItem = {};
    partProcess.forEach((item) => {
      const key = `PT-${item.itemNo}`;
      if (!groupedByItem[key]) groupedByItem[key] = [];
      groupedByItem[key].push(item);
    });

    const newParts = [];
    const newProcessesByPart = {};

    partDetails.forEach((partDetail, index) => {
      const itemNo = `PT-${partDetail.itemNo}`;
      const part = {
        id: partDetail.partId || Date.now() + index,
        itemNo,
        partName: partDetail.partName || "",
        material: partDetail.material || "",
        thickness: partDetail.thickness || "",
        images: [],
      };

      newParts.push(part);

      const processes = (groupedByItem[itemNo] || []).map((proc, idx) => ({
        id: proc.partProcessId || Date.now() + index * 10 + idx,
        woNo: proc.workOrderNo || "",
        itemNo,
        designer: proc.employeeId || "",
        designerName: proc.designerName || "",
        opNo: proc.opNo || "",
        processName: proc.proceess || proc.process || "",
        length: proc.length || "",
        width: proc.width || "",
        height: proc.height || "",
        remarks: proc.remark || proc.remarks || "",
      }));

      newProcessesByPart[itemNo] = processes;
    });

    setParts(newParts);
    setProcessesByPart(newProcessesByPart);
    if (newParts.length > 0) {
      setActivePartItemNo(newParts[0].itemNo);
    }

    // Set latest item number
    const numbers = newParts.map((p) => {
      const match = `${p.itemNo}`.match(/PT-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    });
    setLatestItemNumber(numbers.length ? Math.max(...numbers) : 0);
  };

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

  // ✅ Convert only File/Blob to base64 string, pass strings as-is
  const filesToBase64 = (files) =>
    Promise.all(
      files.map((file) => {
        // Already a string (from backend) → return cleaned base64
        if (typeof file === "string") {
          return file.startsWith("data:")
            ? file.split(",")[1] // remove prefix like data:image/jpeg;base64,
            : file; // already pure base64
        }

        // Is a File or Blob → convert to base64 string
        if (file instanceof File || file instanceof Blob) {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result.split(",")[1]); // only the base64 part
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        }

        // Unexpected type → skip
        return null;
      })
    ).then((results) => results.filter(Boolean)); // remove nulls

  // ✅ Save Parts API
  const handleUpdateParts = async () => {
    try {
      for (const p of parts) {
        const imageList = await filesToBase64(p.images);
        const payload = {
          itemId: p.itemId, // ensure this is the backend ID string
          kickOffId: id,
          itemNo:
            typeof p.itemNo === "string"
              ? parseInt(p.itemNo.replace(/^PT-/, ""), 10)
              : p.itemNo,
          partName: p.partName,
          material: p.material,
          thickness: p.thickness,
          imageList,
        };
        console.log("itemNo-->", p.itemId);
        console.log("Updating part with payload:", payload); // Debug log
        await axiosInstance.put("/kickoff/updateItem", payload);
      }
      alert("Parts updated successfully!");
    } catch (error) {
      console.error("Failed to update parts:", error.response || error);
      alert("Failed to update parts");
    }
  };

  // ✅ Save Processes API
  const handleUpdateProcesses = async () => {
    try {
      const allProcesses = Object.values(processesByPart)
        .flat()
        .map((proc) => ({
          partProcessId: proc.partProcessId ? proc.partProcessId : null, // null for new
          kickOffId: id,
          itemNo:
            typeof proc.itemNo === "string"
              ? parseInt(proc.itemNo.replace(/^PT-/, ""), 10)
              : proc.itemNo,
          workOrderNumber: proc.woNo,
          designerName:
            proc.designerName ||
            employeeList.find((e) => e.employeeId === proc.designer)?.name ||
            "",
          employeeId: proc.designer,
          process: proc.processName,
          length: parseFloat(proc.length) || 0,
          height: parseFloat(proc.height) || 0,
          width: parseFloat(proc.width) || 0,
          remarks: proc.remarks || "",
        }));

      console.log("Sending processes payload:", allProcesses);

      await axiosInstance.put(
        "/kickoff/updateKickOffItemsProccess",
        allProcesses
      );

      alert("Processes updated successfully!");
    } catch (error) {
      console.error("Failed to update processes:", error.response || error);
      alert("Failed to update processes");
    }
  };

  // Function to fetch the maximum item number from server
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
        setLatestItemNumber(numericPart); // Correct setter
      }
    } catch (error) {
      console.error("Failed to fetch max item number:", error);
    }
  };

  // Fetch max item number once on initial mount
  useEffect(() => {
    fetchMaxItemNumber();
  }, []);

  return (
    <Card className="mb-3 shadow-sm border-0">
      <CustomToggle
        eventKey={eventKey}
        activeKey={activeKey}
        handleAccordionClick={() => handleAccordionClick(eventKey)}
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
                                  ? img.startsWith("data:")
                                    ? img
                                    : `data:image/jpeg;base64,${img}` // or image/png depending on your format
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
                              onClick={async () => {
                                try {
                                  const image = part.images[idx];

                                  // If backend image (has an ID), delete from DB
                                  if (image && image.imageId) {
                                    await axiosInstance.delete(
                                      `/kickoff/deleteItemImage/${image.imageId}`
                                    );
                                    console.log(
                                      `Image ${image.imageId} deleted from DB`
                                    );
                                  }

                                  // Remove from local state
                                  const updatedImages = [...part.images];
                                  updatedImages.splice(idx, 1);
                                  updatePart(part.id, "images", updatedImages);
                                } catch (err) {
                                  console.error("Failed to delete image:", err);
                                  alert("Failed to delete image from server");
                                }
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
                            const selectedFiles = Array.from(e.target.files);

                            // Filter to allow only files <= 1 MB
                            const validFiles = selectedFiles.filter((file) => {
                              if (file.size > 1024 * 1024) {
                                // 1MB
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

                            // Reset file input so the same file can be re-selected
                            e.target.value = "";
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

                      <Button variant="primary" onClick={handleUpdateParts}>
                        Update{" "}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          <div className="d-flex justify-content-end mt-3 gap-2  mb-5">
            <Button onClick={addPart} variant="primary">
              <FaPlusCircle className="me-2 ms-2" /> Add Part
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

                          <Button
                            variant="success"
                            onClick={handleUpdateProcesses}
                          >
                            Update{" "}
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
