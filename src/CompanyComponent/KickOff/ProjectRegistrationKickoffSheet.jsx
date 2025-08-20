import React, { useEffect, useState } from "react";
import axiosInstance from "../../BaseComponet/axiosInstance";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";

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

  // const [loadingPart,setLoadingPart] = useEffect(false);
  // const [partOptions, setPartOptions] = useEffect([])

  const [loadingPart, setLoadingPart] = useState(false);
  const [partOptions, setPartOptions] = useState([]);

  const [materialOptions, setMaterialOptions] = useState([]);
  const [loadingMaterial, setLoadingMaterial] = useState(false);

  const [thicknessOptions, setThicknessOptions] = useState([]);
  const [loadingThickness, setLoadingThickness] = useState(false);

  const [processLoading, setProcessLoading] = useState(false);
  const [processOptions, setProcessOptions] = useState([]);

  const [processesSuggestionsOptions, setProcessesSuggestionsOptions] =
    useState([]);
  const [processesSuggestionsLoading, setProcessesSuggestionsLoading] =
    useState(false);

    const [suffixOptions, setSuffixOptions] = useState([]);


  // ---------------- State for Part Details ----------------

  const [latestItemNumber, setLatestItemNumber] = useState(1540);
  const [activePartItemNo, setActivePartItemNo] = useState("PT-1");
  // const [activePartItemNo, setActivePartItemNo] = useState(null);
  const [processesByPart, setProcessesByPart] = useState({});

  const [parts, setParts] = useState([]);


  const partProcesses = processesByPart[activePartItemNo] || [];
  const getSuffix = (woNo) => woNo?.replace(activePartItemNo, "") || "";

  const isManualProcess = (suffix) =>
    /^[A-Z]$/.test(suffix) && !suffixOptions.includes(suffix);

  // const manualProcesses = partProcesses
  //   .filter((p) => isManualProcess(getSuffix(p.woNo)))
  //   .sort((a, b) => getSuffix(a.woNo).localeCompare(getSuffix(b.woNo)));

  // const workorderProcesses = partProcesses
  //   .filter((p) => !isManualProcess(getSuffix(p.woNo)))
  //   .sort((a, b) => getSuffix(a.woNo).localeCompare(getSuffix(b.woNo)));

  // const sortedProcesses = [...manualProcesses, ...workorderProcesses];

  // const filteredProcesses = sortedProcesses.filter(
  //   (proc) => proc.itemNo === activePartItemNo
  // );

  const filteredProcesses = (processesByPart[activePartItemNo] || []).filter(
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

  // **********************dropdown from workOrder
  const handlePartsCreateOption = async (inputValue, partId) => {
    setLoadingPart(true);
    try {
      const res = await axiosInstance.post(`/work/addPart/${inputValue}`);
      const newOption = {
        label: res.data.partName,
        value: res.data.partId,
      };
      setPartOptions((prev) => [...prev, newOption]);
      // Immediately update the partName of the relevant part so dropdown shows selected
      updatePart(partId, "partName", newOption.label);
      toast.success(`Added "${newOption.label}"`);
    } catch (err) {
      toast.error("Failed to add part");
    } finally {
      setLoadingPart(false);
    }
  };

  const fetchParts = async () => {
    try {
      setLoadingPart(true);

      const res = await axiosInstance.get("/work/getAllParts");
      const options = res.data.map((p) => ({
        label: p.partName,
        value: p.partId,
      }));
      setPartOptions(options);
    } catch (err) {
      toast.error("Failed to load parts");
    } finally {
      setLoadingPart(false);
    }
  };

  const handlePartsSelect = (selectedOption, actionMeta, partId) => {
    if (selectedOption) {
      // If an option is selected, set both id and display label
      updatePart(partId, "partName", selectedOption.label);
      // Optionally, store the partId (backend id) in your part object as well, if needed:
      // updatePart(partId, "partMasterId", selectedOption.value);
    } else {
      // Cleared selection
      updatePart(partId, "partName", "");
      // updatePart(partId, "partMasterId", null);
    }
  };

  const fetchMaterial = async () => {
    try {
      setLoadingMaterial(true);
      const res = await axiosInstance.get("/work/getAllMaterials");
      const options = res.data.map((p) => ({
        label: p.materialName,
        value: p.materialId,
      }));
      setMaterialOptions(options);
    } catch (err) {
      toast.error("Failed to load materials");
    } finally {
      setLoadingMaterial(false);
    }
  };

  const handleMaterialCreateOption = async (inputValue, partId) => {
    setLoadingMaterial(true);
    try {
      const res = await axiosInstance.post(`/work/addMaterial/${inputValue}`);
      const newOption = {
        label: res.data.materialName,
        value: res.data.materialId,
      };
      setMaterialOptions((prev) => [...prev, newOption]);
      updatePart(partId, "material", newOption.label); // Select the newly created option immediately
      toast.success(`Added "${newOption.label}"`);
    } catch (err) {
      toast.error("Failed to add material");
    } finally {
      setLoadingMaterial(false);
    }
  };

  const handleMaterialSelect = (selectedOption, actionMeta, partId) => {
    if (selectedOption) {
      updatePart(partId, "material", selectedOption.label);
    } else {
      updatePart(partId, "material", "");
    }
  };

  const fetchThickness = async () => {
    try {
      setLoadingThickness(true);
      const res = await axiosInstance.get("/work/getAllThicknesses");
      const options = res.data.map((p) => ({
        label: p.thicknessName,
        value: p.thicknessId,
      }));
      setThicknessOptions(options);
    } catch (err) {
      toast.error("Failed to load thicknesses");
    } finally {
      setLoadingThickness(false);
    }
  };

  const handleThicknessCreateOption = async (inputValue, partId) => {
    setLoadingThickness(true);
    try {
      const res = await axiosInstance.post(`/work/addThickness/${inputValue}`);
      const newOption = {
        label: res.data.thicknessName,
        value: res.data.thicknessId,
      };
      setThicknessOptions((prev) => [...prev, newOption]);
      updatePart(partId, "thickness", newOption.label); // Select new thickness immediately
      toast.success(`Added "${newOption.label}"`);
    } catch (err) {
      toast.error("Failed to add thickness");
    } finally {
      setLoadingThickness(false);
    }
  };

  const handleThicknessSelect = (selectedOption, actionMeta, partId) => {
    if (selectedOption) {
      updatePart(partId, "thickness", selectedOption.label);
    } else {
      updatePart(partId, "thickness", "");
    }
  };

  const fetchProcessesSuggestions = async () => {
    setProcessesSuggestionsLoading(true);
    try {
      const res = await axiosInstance.get("/work/getAllProcesses");
      const data = res.data;
      const options = data.map((process) => ({
        value: process.processName,
        label: process.processName,
      }));
      setProcessesSuggestionsOptions(options);
    } catch (error) {
      toast.error("Failed to load processes");
      console.error(error);
    } finally {
      setProcessesSuggestionsLoading(false);
    }
  };
  useEffect(() => {
    fetchProcessesSuggestions();
  }, []);

  // ******************

  // ---------------- State for Part Process ----------------

const addProcess = () => {
  if (!activePartItemNo) return;

  const existingProcesses = processesByPart[activePartItemNo] || [];

  // Collect manual suffixes only (A, B, C...) from parent manual rows
  const manualParents = existingProcesses.filter(
    (p) =>
      isManualProcess(getSuffix(p.woNo)) &&
      !p.parentWorkOrderNo &&
      !p.isFromPartProcess &&
      p.woNo !== "XX"
  );

  const manualSuffixes = manualParents.map((p) => getSuffix(p.woNo));
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

  // Find index of last manual parent process
  let insertIdx = -1;
  if (manualParents.length > 0) {
    const lastManualParent = manualParents[manualParents.length - 1];
    insertIdx = existingProcesses.findIndex(
      (p) => p.id === lastManualParent.id
    );
  }

  // Insert after last manual parent (or at start if none)
  const updatedProcesses = [...existingProcesses];
  if (insertIdx === -1) {
    updatedProcesses.unshift(newProc);
  } else {
    updatedProcesses.splice(insertIdx + 1, 0, newProc);
  }

  setProcessesByPart((prev) => ({
    ...prev,
    [activePartItemNo]: updatedProcesses,
  }));
};




const removeProcess = (id) => {
  const procList = processesByPart[activePartItemNo] || [];
  const deletedProc = procList.find((p) => p.id === id);
  if (!deletedProc) return;

  // Detect dropdown type strictly by isFromPartProcess flag
  const suffix = deletedProc.woNo?.replace(activePartItemNo, "");
  const isDropdown = deletedProc.isFromPartProcess;

  setProcessesByPart((prev) => {
    let updatedList = prev[activePartItemNo].filter((p) => p.id !== id);

    // Orphan child rows from deleted parent
    if (!deletedProc.parentWorkOrderNo) {
      updatedList = updatedList.map((proc) => {
        if (proc.parentWorkOrderNo === deletedProc.woNo) {
          return {
            ...proc,
            woNo: "XX",
            parentWorkOrderNo: "",
          };
        }
        return proc;
      });
    }

    // Keep orphan children after renaming
    if (!isDropdown) {
      updatedList = reNumberProcesses(updatedList, activePartItemNo);
    }

    return {
      ...prev,
      [activePartItemNo]: updatedList,
    };
  });

  // Remove from dropdown selected options if was a dropdown type
  if (isDropdown) {
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
    let finalValue = value;

    if (field === "opNo") {
      if (value === "XX") {
        finalValue = "0"; // store XX as 0 internally
      } else if (value === "") {
        finalValue = "-1"; // store empty selection as -1
      }
    }

    setProcessesByPart((prev) => ({
      ...prev,
      [activePartItemNo]: prev[activePartItemNo].map((proc) =>
        proc.id === id ? { ...proc, [field]: finalValue } : proc
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
      opNo: "0",
      processName: "",
      length: "",
      width: "",
      height: "",
      remarks: "",
      isFromPartProcess: true,
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

  // Child process

  // Insert a new process below a given parent WO NO (like "PT-1A")
  const addChildProcess = (parentWoNo) => {
    const processes = processesByPart[activePartItemNo] || [];

    // Get child rows for this parent (like PT-90B1, PT-90B2…)
    const childSuffixes = processes
      .filter((p) => p.parentWorkOrderNo === parentWoNo)
      .map((p) => p.woNo.replace(parentWoNo, ""))
      .filter((suf) => /^\d+$/.test(suf));

    const nextChildNum =
      childSuffixes.length > 0 ? Math.max(...childSuffixes.map(Number)) + 1 : 1;

    const newProcess = {
      id: Date.now(),
      woNo: `${parentWoNo}${nextChildNum}`, // PT-90B1, PT-90B2
      itemNo: activePartItemNo,
      parentWorkOrderNo: parentWoNo, // ⭐ link to parent
      designer: "",
      opNo: "",
      processName: "",
      length: "",
      width: "",
      height: "",
      remarks: "",
    };

    // Insert below parent
    const parentIndex = processes.findIndex((p) => p.woNo === parentWoNo);
    const updatedProcesses = [...processes];
    updatedProcesses.splice(parentIndex + 1, 0, newProcess);

    setProcessesByPart((prev) => {
      const renamed = reNumberProcesses(updatedProcesses, activePartItemNo);
      return {
        ...prev,
        [activePartItemNo]: renamed,
      };
    });
  };

  /** Recursively renames parent and child processes with correct ascending letters/numbers */
  function reNumberProcesses(processes, activePartItemNo) {
    // Split out orphan children BEFORE renaming: woNo === "XX", parentWorkOrderNo === ""
    const orphanChildren = processes.filter(
      (p) => p.woNo === "XX" && !p.parentWorkOrderNo
    );

    // Rest: manual rows (excluding orphans, not isFromPartProcess), and dropdown rows
    const manualProcesses = processes.filter(
      (p) => !p.isFromPartProcess && !(p.woNo === "XX" && !p.parentWorkOrderNo)
    );
    const dropdownProcesses = processes.filter((p) => p.isFromPartProcess);

    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    let renamedProcesses = [];

    const parents = manualProcesses.filter((p) => !p.parentWorkOrderNo);
    parents.forEach((parent, i) => {
      const newLetter = letters[i];
      const newParentWoNo = `${activePartItemNo}${newLetter}`;

      // Find children for this parent
      const children = manualProcesses
        .filter((p) => p.parentWorkOrderNo === parent.woNo)
        .sort((a, b) => {
          const anum = parseInt(a.woNo.replace(parent.woNo, ""), 10) || 0;
          const bnum = parseInt(b.woNo.replace(parent.woNo, ""), 10) || 0;
          return anum - bnum;
        });

      let childProcesses = children.map((child, idx) => ({
        ...child,
        parentWorkOrderNo: newParentWoNo,
        woNo: `${newParentWoNo}${idx + 1}`,
      }));

      renamedProcesses.push({
        ...parent,
        woNo: newParentWoNo,
      });
      renamedProcesses = renamedProcesses.concat(childProcesses);
    });

    // Final list: renamed + orphans + dropdowns
    return [...renamedProcesses, ...orphanChildren, ...dropdownProcesses];
  }

const fetchProcesses = async () => {
  setProcessLoading(true);
  try {
    const res = await axiosInstance.get("/work/getAllWorkOrderProcesses");
    const data = res.data;

    // build process name options as before
    const option = data.map((process) => ({
      value: process.processName,
      label: process.processName,
    }));
    setProcessOptions(option);

    // build suffix options from processSuffix (or whatever key your API provides)
    const dynamicSuffixes = Array.from(
      new Set(data.map((proc) => proc.suffix).filter(Boolean))
    );
    setSuffixOptions(dynamicSuffixes);
  } catch (error) {
    toast.error("Failed to load processes");
    console.error(error);
  } finally {
    setProcessLoading(false);
  }
};


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
        console.log("get wrork order --", data);
        populatePartsAndProcesses(data);
      })
      .catch((err) => {
        console.error("Error fetching part/process data:", err);
      });
  }, [selectedProjectId]);

 

  const populatePartsAndProcesses = (data) => {
    const { partProcess, partDetails } = data;
    console.log("part process::::::::", partProcess);

    const groupedByItem = {};

    // Group processes by itemNo
    partProcess.forEach((item) => {
      const key = `PT-${item.itemNo}`;
      if (!groupedByItem[key]) groupedByItem[key] = [];
      groupedByItem[key].push(item);
    });

    const newParts = [];
    const newProcessesByPart = {};
    const newSelectedByPart = {};

    partDetails.forEach((partDetail, index) => {
      const itemNo = `PT-${partDetail.itemNo}`;

      let apiImages = [];
      if (partDetail.imageList) {
        if (Array.isArray(partDetail.imageList)) {
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
        cancel: proc.cancel,
        scope: proc.scope,
        itemNo,
        designer: "",
        opNo: proc.operationNumber?.toString() || "",
        processName: proc.proceess || proc.processName || "",
        length: proc.length || "",
        width: proc.width || "",
        height: proc.height || "",
        remarks: proc.remark || "",
        parentWorkOrderNo: proc.parentWorkOrderNo || "",
        isFromPartProcess: proc.operationNumber === 0, // Mark those dropdown-selected
      }));

      // For dropdown, select process with opNo '0' and map to existing options or mark as archived
      const selectedForPart = processes
        .filter((p) => p.opNo === "0")
        .map((p) => {
          // Extract suffix from woNo
          const suffix = p.woNo.replace(itemNo, "");

          // Find if dropdown options has this suffix
          const matchedOption = processOptions.find(
            (opt) => opt.value === suffix
          );

          // Return actual dropdown option if found, else fallback to archived
          return matchedOption
            ? matchedOption
            : { value: suffix, label: suffix || "Archived" };
        });

      newSelectedByPart[itemNo] = selectedForPart;

      // newProcessesByPart[itemNo] = reNumberProcesses(processes, itemNo);
      newProcessesByPart[itemNo] = processes; 
    });

    setParts(newParts);
    setProcessesByPart(newProcessesByPart);
    setSelectedProcessesByPart(newSelectedByPart); // set pre-selected dropdown options

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
                      <CreatableSelect
                        styles={{
                          container: (base) => ({ ...base, width: "100%" }),
                        }}
                        menuPosition="fixed"
                        isClearable
                        onMenuOpen={fetchParts}
                        onChange={(selectedOption, actionMeta) =>
                          handlePartsSelect(selectedOption, actionMeta, part.id)
                        }
                        onCreateOption={(inputValue) =>
                          handlePartsCreateOption(inputValue, part.id)
                        }
                        options={partOptions}
                        isLoading={loadingPart}
                        placeholder="Search or create part..."
                        value={
                          part.partName
                            ? partOptions.find(
                                (option) => option.label === part.partName
                              ) || {
                                label: part.partName,
                                value: part.partName,
                              }
                            : null
                        }
                      />
                    </td>
                    <td>
                      <CreatableSelect
                        styles={{
                          container: (base) => ({ ...base, width: "100%" }),
                        }}
                        menuPosition="fixed"
                        isClearable
                        onMenuOpen={fetchMaterial}
                        onChange={(selectedOption, actionMeta) =>
                          handleMaterialSelect(
                            selectedOption,
                            actionMeta,
                            part.id
                          )
                        }
                        onCreateOption={(inputValue) =>
                          handleMaterialCreateOption(inputValue, part.id)
                        }
                        options={materialOptions}
                        placeholder="Search or create material..."
                        isLoading={loadingMaterial}
                        value={
                          part.material
                            ? materialOptions.find(
                                (option) => option.label === part.material
                              ) || {
                                label: part.material,
                                value: part.material,
                              }
                            : null
                        }
                      />
                    </td>

                    <td>
                      <CreatableSelect
                        styles={{
                          container: (base) => ({ ...base, width: "100%" }),
                        }}
                        menuPosition="fixed"
                        isClearable
                        onMenuOpen={fetchThickness}
                        onChange={(selectedOption, actionMeta) =>
                          handleThicknessSelect(
                            selectedOption,
                            actionMeta,
                            part.id
                          )
                        }
                        onCreateOption={(inputValue) =>
                          handleThicknessCreateOption(inputValue, part.id)
                        }
                        options={thicknessOptions}
                        isLoading={loadingThickness}
                        placeholder="Search or create thickness..."
                        value={
                          part.thickness
                            ? thicknessOptions.find(
                                (option) => option.label === part.thickness
                              ) || {
                                label: part.thickness,
                                value: part.thickness,
                              }
                            : null
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
            <Button onClick={addPart} variant="btn btn-outline-primary btn-sm">
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
                      <tr
                        key={proc.id}
                        style={{
                          backgroundColor: proc.cancel
                            ? "#ff5b5b"
                            : proc.scope
                            ? "#ffff6e"
                            : proc.parentWorkOrderNo
                            ? "#3bff6f"
                            : "transparent",
                        }}
                      >
                        <td className="KickoffPrtProcessInpt-TD">
                          <Form.Control
                            value={proc.woNo}
                            onChange={(e) =>
                              updateProcess(proc.id, "woNo", e.target.value)
                            }
                            className="KickoffPrtProcessInpt"
                          />
                        </td>
                        <td className="KickoffPrtProcessInpt-TD">
                          <Form.Select
                            value={proc.designer || ""}
                            onChange={(e) =>
                              updateProcess(proc.id, "designer", e.target.value)
                            }
                            className="KickoffPrtProcessInpt"
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
                        <td className="KickoffPrtProcessInpt-TD">
                          <Form.Select
                            value={
                              proc.opNo === "0"
                                ? "XX"
                                : proc.opNo === "-1"
                                ? ""
                                : proc.opNo
                            }
                            onChange={(e) =>
                              updateProcess(proc.id, "opNo", e.target.value)
                            }
                            className="KickoffPrtProcessInpt"
                            disabled={proc.opNo === "0"} // Disable whole dropdown when XX shown
                          >
                            <option value="">Select</option>
                            <option value="XX" disabled>
                              XX
                            </option>
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
                            <option value="110">110</option>
                            <option value="120">120</option>
                            <option value="130">130</option>
                            <option value="140">140</option>
                            <option value="150">150</option>
                            <option value="160">160</option>
                            <option value="170">170</option>
                            <option value="180">180</option>
                            <option value="190">190</option>
                            <option value="200">200</option>
                          </Form.Select>
                        </td>

                        <td className="KickoffPrtProcessInpt-TD">
                          {proc.isFromPartProcess ? (
                            <Select
                              options={processesSuggestionsOptions}
                              isLoading={processesSuggestionsLoading}
                              value={
                                processesSuggestionsOptions.find(
                                  (option) => option.value === proc.processName
                                ) || null
                              }
                              onChange={(selectedOption) =>
                                updateProcess(
                                  proc.id,
                                  "processName",
                                  selectedOption ? selectedOption.value : ""
                                )
                              }
                              placeholder="Select Process..."
                              isClearable={true}
                              menuPosition="fixed"
                              styles={{
                                control: (base) => ({
                                  ...base,
                                  minHeight: "31px",
                                  height: "31px",
                                }),
                                indicatorsContainer: (base) => ({
                                  ...base,
                                  height: "31px",
                                }),
                                valueContainer: (base) => ({
                                  ...base,
                                  top: "-2px",
                                }),
                                singleValue: (base) => ({
                                  ...base,
                                  top: "-2px",
                                }),
                              }}
                            />
                          ) : (
                            <Form.Control
                              value={proc.processName}
                              onChange={(e) =>
                                updateProcess(
                                  proc.id,
                                  "processName",
                                  e.target.value
                                )
                              }
                              className="KickoffPrtProcessInpt"
                            />
                          )}
                        </td>

                        <td className="KickoffPrtProcessInpt-TD">
                          <Form.Control
                            value={proc.length}
                            onChange={(e) =>
                              updateProcess(proc.id, "length", e.target.value)
                            }
                            className="KickoffPrtProcessInpt"
                          />
                        </td>
                        <td className="KickoffPrtProcessInpt-TD">
                          <Form.Control
                            value={proc.width}
                            onChange={(e) =>
                              updateProcess(proc.id, "width", e.target.value)
                            }
                            className="KickoffPrtProcessInpt"
                          />
                        </td>
                        <td className="KickoffPrtProcessInpt-TD">
                          <Form.Control
                            value={proc.height}
                            onChange={(e) =>
                              updateProcess(proc.id, "height", e.target.value)
                            }
                            className="KickoffPrtProcessInpt"
                          />
                        </td>
                        <td className="KickoffPrtProcessInpt-TD">
                          <Form.Control
                            value={proc.remarks}
                            onChange={(e) =>
                              updateProcess(proc.id, "remarks", e.target.value)
                            }
                            className="KickoffPrtProcessInpt"
                          />
                        </td>

                        <td className="text-center KickoffPrtProcessInpt-TD">
                          {/* Show + only for root/parent processes */}
                          {!proc.parentWorkOrderNo &&
                            !proc.isFromPartProcess &&
                            proc.woNo !== "XX" && (
                              <Button
                                variant="link"
                                onClick={() => addChildProcess(proc.woNo)}
                                className="text-success me-2"
                              >
                                <FaPlusCircle />
                              </Button>
                            )}
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
                    onMenuOpen={fetchProcesses}
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
                  <Button
                    onClick={addProcess}
                    variant="btn btn-outline-primary btn-sm"
                  >
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
