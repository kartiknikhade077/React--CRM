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
import { toast } from "react-toastify";

const CompanyUpdateProjectRegistrationKickoffSheet = ({
  eventKey,
  activeKey,
  CustomToggle,
  handleAccordionClick,
  initialProjectData = {},
  initialPartsData = [],
  initialProcessesData = [],
  onProjectDataChange,
  onPartsChange,
  onProcessesChange,
  id,
  selectedProjectId,
  customerId,
  customerName,
  projectId,
  projectName,
}) => {
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

  useEffect(() => {
    if (!selectedProjectId) {
      if (Array.isArray(initialPartsData) && initialPartsData.length > 0) {
        setParts(
          initialPartsData.map((p, idx) => {
            let loadedImages = [];
            if (p.imageListWithId && typeof p.imageListWithId === "object") {
              loadedImages = Object.entries(p.imageListWithId).map(
                ([imageId, imagePath]) => ({
                  imageId,
                  imagePath,
                })
              );
            }

            return {
              ...p,
              id: p.itemId || Date.now() + idx,
              itemId: p.itemId,
              itemNo:
                typeof p.itemNo === "string" ? p.itemNo : `PT-${p.itemNo || 0}`,
              images: loadedImages,
              partName: p.partName || "",
              material: p.material || "",
              thickness: p.thickness || "",
              isNew: false,
              isEditing: false,
            };
          })
        );

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
            isNewForWorkOrder: false,
            isEditing: false,
            parentWorkOrderNo: proc.parentWorkOrderNo || "",
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


        console.log("**********selected project data--", res.data);
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
      let loadedImages = [];
      if (
        partDetail.imageListWithId &&
        typeof partDetail.imageListWithId === "object"
      ) {
        loadedImages = Object.entries(partDetail.imageListWithId).map(
          ([imageId, imagePath]) => ({
            imageId,
            imagePath,
          })
        );
      }
      const part = {
        id: partDetail.partId || Date.now() + index,
        itemId: partDetail.partId,
        itemNo,
        partName: partDetail.partName || "",
        material: partDetail.material || "",
        thickness: partDetail.thickness || "",
        images: loadedImages,
        isNew: false,
      };

      newParts.push(part);

      const processes = (groupedByItem[itemNo] || []).map((proc, idx) => ({
        id: proc.partProcessId || Date.now() + index * 10 + idx,
        partProcessId: proc.partProcessId,
        woNo: proc.workOrderNo || "",
        cancel: proc.cancel,
        scope: proc.scope,
        itemNo,
        designer: proc.employeeId || "",
        designerName: proc.designerName || "",
        opNo: proc.opNo || "",
        processName: proc.proceess || proc.process || "",
        length: proc.length || "",
        width: proc.width || "",
        height: proc.height || "",
        remarks: proc.remark || proc.remarks || "",
        isEditing: false,
      }));
      console.log("process@@@@@@@@@@@ in Update", processes);
      // newProcessesByPart[itemNo] = processes;
      newProcessesByPart[itemNo] = reNumberProcesses(processes, itemNo);

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
    if (id) {
      try {
        const responce = axiosInstance.delete(`/kickoff/deleteItem/${id}`);

        toast.success("Part Deleted successfully");
      } catch (error) {
        console.error("Failed to delete part ", error.response || error);
        toast.error("Failed to delete part");
      }
    }
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
      isNew: true,
      isEditing: true,
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

  // const removeProcess = (id) => {
  //   console.log("process id", id);
  //   if (id) {
  //     try {
  //       axiosInstance.delete(`/kickoff/deleteItemProcess/${id}`);
  //       toast.success("Process Deleted successfully");
  //     } catch (error) {
  //       toast.error("Error while deleting processes");
  //       console.log("Error while deleting processes", error);
  //     }
  //   }
  //   setProcessesByPart((prev) => ({
  //     ...prev,
  //     [activePartItemNo]: (prev[activePartItemNo] || []).filter(
  //       (proc) => proc.id !== id
  //     ),
  //   }));
  // };

  const removeProcess = (id) => {
    if (id) {
      try {
        axiosInstance.delete(`/kickoff/deleteItemProcess/${id}`);
        toast.success("Process Deleted successfully");
      } catch (error) {
        toast.error("Error while deleting process");
      }
    }

    setProcessesByPart((prev) => {
      const filtered = (prev[activePartItemNo] || []).filter(
        (proc) => proc.id !== id
      );
      return {
        ...prev,
        [activePartItemNo]: reNumberProcesses(filtered, activePartItemNo),
      };
    });
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
    const activePart = parts.find((p) => p.itemNo === activePartItemNo);
    if (!activePart) return;
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
      isNewForWorkOrder: activePart.isNew,
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
    const activePart = parts.find((p) => p.itemNo === activePartItemNo);
    if (!activePart) return;

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
      isNewForWorkOrder: activePart.isNew,
      isEditing: true,
    };

    // setProcessesByPart((prev) => ({
    //   ...prev,
    //   [activePartItemNo]: [...(prev[activePartItemNo] || []), newProc],
    // }));

    setProcessesByPart((prev) => {
      const updated = [...(prev[activePartItemNo] || []), newProc];
      return {
        ...prev,
        [activePartItemNo]: reNumberProcesses(updated, activePartItemNo),
      };
    });

  };

  // ✅ Convert only File/Blob to base64 string, pass strings as-is
  const filesToBase64 = (files) =>
    Promise.all(
      files.map((file) => {
        if (
          typeof file === "object" &&
          file.imagePath &&
          !(file instanceof File)
        ) {
          return file.imagePath;
        }
        if (typeof file === "string" && file.startsWith("data:")) {
          return file.split(",")[1];
        }
        if (file instanceof File || file instanceof Blob) {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result.split(",")[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        }
        return null;
      })
    ).then((results) => results.filter(Boolean));



  // ======================================
  // Utility: reassigns WO NOs for parents A,B,C... and their children A1,A2...
 function reNumberProcesses(processes, activePartItemNo) {
  if (!Array.isArray(processes)) return [];

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const parents = processes.filter((p) => !p.parentWorkOrderNo);
  const special = processes.filter(
    (p) =>
      p.parentWorkOrderNo &&
      !/^\d+$/.test(p.woNo.replace(p.parentWorkOrderNo, ""))
  );

  let renamed = [];

  parents.forEach((parent, i) => {
    const newParentWoNo = `${activePartItemNo}${letters[i]}`;
    const newParent = { ...parent, woNo: newParentWoNo };

    const children = processes
      .filter((p) => p.parentWorkOrderNo === parent.woNo || p.parentWorkOrderNo === newParentWoNo)
      .sort((a, b) => {
        const anum = parseInt(a.woNo.replace(parent.woNo, ""), 10) || 0;
        const bnum = parseInt(b.woNo.replace(parent.woNo, ""), 10) || 0;
        return anum - bnum;
      });

    const newChildren = children.map((child, idx) => ({
      ...child,
      parentWorkOrderNo: newParentWoNo,
      woNo: `${newParentWoNo}${idx + 1}`,
    }));

    renamed.push(newParent, ...newChildren);
  });

  return [...renamed, ...special];
}




const addChildProcess = (parentWoNo) => {
  setProcessesByPart((prev) => {
    const processes = prev[activePartItemNo] || [];

    // figure out the children for this parent
    const children = processes.filter((p) => p.parentWorkOrderNo === parentWoNo);
    const numbers = children
      .map((c) => c.woNo.replace(parentWoNo, ""))
      .filter((s) => /^\d+$/.test(s))
      .map(Number);

    const nextChildNum = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;

    const newProcess = {
      id: Date.now(),
      woNo: `${parentWoNo}${nextChildNum}`, // ex PT-91A1
      itemNo: activePartItemNo,
      parentWorkOrderNo: parentWoNo,
      designer: "",
      opNo: "",
      processName: "",
      length: "",
      width: "",
      height: "",
      remarks: "",
      isNewForWorkOrder: true,
      isEditing: true,
    };

    // Only push child → no splice
    const updated = [...processes, newProcess];

    // 🔑 Important: Now renumber the WHOLE thing once
    return {
      ...prev,
      [activePartItemNo]: reNumberProcesses(updated, activePartItemNo),
    };
  });
};











  // ================================================
  const handleSaveOrUpdatePart = async (partToSave) => {
    const imageListForKickoff = await filesToBase64(partToSave.images);

    if (partToSave.isNew || !partToSave.itemId) {
      try {
        const workOrderPayload = {
          itemNo: parseInt(partToSave.itemNo.replace(/^PT-/, ""), 10),
          partName: partToSave.partName,
          material: partToSave.material,
          thickness: partToSave.thickness,
          projectId: projectId,
          projectName: projectName,
          customerId: customerId,
          customerName: customerName,
        };

        const formData = new FormData();
        formData.append("workOrder", JSON.stringify(workOrderPayload));

        const imageFiles = partToSave.images.filter(
          (img) => img instanceof File
        );
        if (imageFiles.length > 0) {
          imageFiles.forEach((file) => {
            formData.append("images", file);
          });
        }

        const workOrderResponse = await axiosInstance.post(
          "/work/createWorkOrderPart",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        const savedWorkOrder = workOrderResponse.data;
        const newPartId = savedWorkOrder.workOrderId;
        const kickoffItemPayload = {
          kickOffId: id,
          itemId: null,
          itemNo: parseInt(partToSave.itemNo.replace(/^PT-/, ""), 10),
          partName: partToSave.partName,
          material: partToSave.material,
          thickness: partToSave.thickness,
          imageList: imageListForKickoff,
        };

        await axiosInstance.put("/kickoff/updateItem", kickoffItemPayload);
        setParts((prevParts) =>
          prevParts.map((p) =>
            p.id === partToSave.id
              ? {
                ...p,
                id: newPartId,
                woId: newPartId,
                itemId: newPartId,
                isNew: true,
              }
              : p
          )
        );
        toast.success("Part saved successfully!");
      } catch (error) {
        console.error("Failed to save new part:", error.response || error);
        alert(
          "Error: Could not save the new part. Please check the data and try again."
        );
      }
    } else {
      try {
        const kickoffUpdatePayload = {
          itemId: partToSave.itemId,
          kickOffId: id,
          itemNo: parseInt(partToSave.itemNo.replace(/^PT-/, ""), 10),
          partName: partToSave.partName,
          material: partToSave.material,
          thickness: partToSave.thickness,
          imageList: imageListForKickoff,
        };

        console.log(
          "Updating existing part with payload:",
          kickoffUpdatePayload
        );
        await axiosInstance.put("/kickoff/updateItem", kickoffUpdatePayload);

        alert("Part updated successfully!");
      } catch (error) {
        console.error("Failed to update part:", error.response || error);
        alert("Failed to update part.");
      }
    }
  };

  const handleUpdateProcesses = async () => {
    try {
      const partsWithNewProcesses = parts.filter((part) =>
        (processesByPart[part.itemNo] || []).some(
          (proc) => proc.isNewForWorkOrder
        )
      );

      const workOrderPromises = partsWithNewProcesses.map((part) => {
        const newProcesses = (processesByPart[part.itemNo] || []).filter(
          (proc) => proc.isNewForWorkOrder
        );

        console.log("new processes", newProcesses);
        if (newProcesses.length > 0) {
          const workOrderItemsPayload = newProcesses.map((proc) => ({
            workOrderNo: proc.woNo,
            employeeId: proc.designer || null,
            operationNumber: proc.opNo,
            proceess: proc.processName,
            length: parseFloat(proc.length) || 0,
            width: parseFloat(proc.width) || 0,
            height: parseFloat(proc.height) || 0,
            remark: proc.remarks || "",
          }));
          console.log("workOrderId::::::::::::::::::", part.itemId);
          console.log(
            "workOrderItems:::::::::::::::::",
            JSON.stringify(workOrderItemsPayload)
          );

          const processFormData = new FormData();
          processFormData.append("workOrderId", part.itemId); // Use the saved workOrderId
          processFormData.append(
            "workOrderItems",
            JSON.stringify(workOrderItemsPayload)
          );

          return axiosInstance.post(
            "/work/createWorkOrderItems",
            processFormData
          );
        }
        return Promise.resolve(); // Return a resolved promise if no new processes
      });

      await Promise.all(workOrderPromises);
      if (partsWithNewProcesses.length > 0) {
        toast.success("New processes saved to work order successfully.");

        // Update state to mark processes as no longer new
        setProcessesByPart((prev) => {
          const newState = { ...prev };
          partsWithNewProcesses.forEach((part) => {
            newState[part.itemNo] = newState[part.itemNo].map((proc) => ({
              ...proc,
              isNewForWorkOrder: false,
            }));
          });
          return newState;
        });
      }
    } catch (error) {
      console.error(
        "Failed to save new processes to work order:",
        error.response || error
      );
      toast.error("Failed to save new processes to work order.");
      return;
    }

    try {
      const allProcessesForKickoff = Object.values(processesByPart)
        .flat()
        .map((proc) => ({
          partProcessId: proc.partProcessId || null,
          kickOffId: id,
          itemNo:
            typeof proc.itemNo === "string"
              ? parseInt(proc.itemNo.replace(/^PT-/, ""), 10)
              : proc.itemNo,
          workOrderNumber: proc.woNo,
          designerName:
            employeeList.find((e) => e.employeeId === proc.designer)?.name ||
            "",
          employeeId: proc.designer,
          process: proc.processName,
          length: parseFloat(proc.length) || 0,
          height: parseFloat(proc.height) || 0,
          width: parseFloat(proc.width) || 0,
          remarks: proc.remarks || "",
        }));
      console.log(
        "kick off itemsssssssssssssssssssssss",
        allProcessesForKickoff
      );
      if (allProcessesForKickoff.length > 0) {
        await axiosInstance.put(
          "/kickoff/updateKickOffItemsProccess",
          allProcessesForKickoff
        );
        toast.success("All processes updated in Kickoff Sheet successfully!");
      }
    } catch (error) {
      console.error(
        "Failed to update kickoff processes:",
        error.response || error
      );
      toast.error("Failed to update kickoff processes");
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
                        disabled={!part.isEditing}
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
                        disabled={!part.isEditing}
                      />
                    </td>
                    <td>
                      <Form.Control
                        placeholder="Select thickness..."
                        value={part.thickness}
                        onChange={(e) =>
                          updatePart(part.id, "thickness", e.target.value)
                        }
                        disabled={!part.isEditing}
                      />
                    </td>
                    <td>
                      <div
                        style={{
                          pointerEvents: part.isEditing ? "auto" : "none",
                          opacity: part.isEditing ? 1 : 0.5,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          {/* ======================= CHANGED SECTION START ======================= */}
                          {part.images.map((img, idx) => {
                            // Determine the image source whether it's a new File or an existing image object
                            let imgSrc = "";
                            if (img instanceof File) {
                              imgSrc = URL.createObjectURL(img); // For newly added images
                            } else if (img && img.imagePath) {
                              // For existing images from the backend
                              const path = img.imagePath;
                              imgSrc = path.startsWith("data:")
                                ? path
                                : `data:image/jpeg;base64,${path}`;
                            }

                            return (
                              <div
                                key={img.imageId || idx} // Use imageId as key if available
                                style={{
                                  position: "relative",
                                  width: "100px",
                                  height: "100px",
                                  border: "1px solid #ddd",
                                  borderRadius: "4px",
                                }}
                              >
                                <img
                                  src={imgSrc}
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
                                    // This is now an async function to handle the API call
                                    try {
                                      const imageToDelete = part.images[idx];

                                      // If image has an ID, it's from the DB. Delete it via API.
                                      if (
                                        imageToDelete &&
                                        imageToDelete.imageId
                                      ) {
                                        await axiosInstance.delete(
                                          `/kickoff/deleteItemImage/${imageToDelete.imageId}`
                                        );
                                        console.log(
                                          `Image ${imageToDelete.imageId} deleted from DB`
                                        );
                                        toast.success(
                                          "Image deleted succesfully"
                                        );
                                      }

                                      // After successful API deletion (or if it's a new file), remove from local state
                                      const updatedImages = [...part.images];
                                      updatedImages.splice(idx, 1);
                                      updatePart(
                                        part.id,
                                        "images",
                                        updatedImages
                                      );
                                    } catch (err) {
                                      console.error(
                                        "Failed to delete image:",
                                        err
                                      );
                                      alert(
                                        "Failed to delete image from server"
                                      );
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
                            );
                          })}
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
                              <div
                                style={{ fontSize: "12px", marginTop: "4px" }}
                              >
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
                              const validFiles = selectedFiles.filter(
                                (file) => {
                                  if (file.size > 1024 * 1024) {
                                    // 1MB
                                    alert(
                                      `${file.name} is larger than 1 MB and will be skipped.`
                                    );
                                    return false;
                                  }
                                  return true;
                                }
                              );

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
                      </div>
                    </td>
                    {/* <td className="text-center">
                      <Button
                        variant="link"
                        onClick={() => removePart(part.id)}
                        className="text-danger"
                        disabled={part.isEditing}
                      >
                        <FaTrash />
                      </Button>

                      <Button
                        variant="primary"
                        onClick={() => handleSaveOrUpdatePart(part)}
                      >
                        {part.isNew ? "Save" : "Update"}
                      </Button>
                    </td> */}

                    <td className="text-center ">
                      {/* Delete always allowed */}

                      {/* Toggle between Edit and Save */}
                      <div className="d-flex justify-content-center">
                        {part.isEditing ? (
                          <Button
                            variant="d-block btn btn-outline-success btn-sm"
                            className="d-block"
                            onClick={() => {
                              handleSaveOrUpdatePart(part);
                              updatePart(part.id, "isEditing", false);
                            }}
                          >
                            Save
                          </Button>
                        ) : (
                          <Button
                            variant="d-block btn btn-outline-dark btn-sm "
                            className="d-block"
                            onClick={() =>
                              updatePart(part.id, "isEditing", true)
                            }
                          >
                            Edit
                          </Button>
                        )}
                      </div>
                      <Button
                        onClick={() => removePart(part.id)}
                        variant="btn btn-outline-danger btn-sm mt-2"
                        disabled={part.isEditing} // Prevent delete while editing
                      >
                        delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          <div className="d-flex justify-content-end mt-3 gap-2  mb-5">
            <Button onClick={addPart} variant="btn btn-outline-primary btn-sm">
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
                            disabled={!proc.isEditing}
                          />
                        </td>
                        <td className="KickoffPrtProcessInpt-TD">
                          <Form.Select
                            value={proc.designer || ""}
                            onChange={(e) =>
                              updateProcess(proc.id, "designer", e.target.value)
                            }
                            className="KickoffPrtProcessInpt"
                            disabled={!proc.isEditing}
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
                            value={proc.opNo}
                            onChange={(e) =>
                              updateProcess(proc.id, "opNo", e.target.value)
                            }
                            className="KickoffPrtProcessInpt"
                            disabled={!proc.isEditing}
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
                        <td className="KickoffPrtProcessInpt-TD">
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
                            disabled={!proc.isEditing}
                          />
                        </td>
                        <td className="KickoffPrtProcessInpt-TD">
                          <Form.Control
                            value={proc.length}
                            onChange={(e) =>
                              updateProcess(proc.id, "length", e.target.value)
                            }
                            className="KickoffPrtProcessInpt"
                            disabled={!proc.isEditing}
                          />
                        </td>
                        <td className="KickoffPrtProcessInpt-TD">
                          <Form.Control
                            value={proc.width}
                            onChange={(e) =>
                              updateProcess(proc.id, "width", e.target.value)
                            }
                            className="KickoffPrtProcessInpt"
                            disabled={!proc.isEditing}
                          />
                        </td>
                        <td className="KickoffPrtProcessInpt-TD">
                          <Form.Control
                            value={proc.height}
                            onChange={(e) =>
                              updateProcess(proc.id, "height", e.target.value)
                            }
                            className="KickoffPrtProcessInpt"
                            disabled={!proc.isEditing}
                          />
                        </td>
                        <td className="KickoffPrtProcessInpt-TD">
                          <Form.Control
                            value={proc.remarks}
                            onChange={(e) =>
                              updateProcess(proc.id, "remarks", e.target.value)
                            }
                            className="KickoffPrtProcessInpt"
                            disabled={!proc.isEditing}
                          />
                        </td>

                        {/* <td className="text-center KickoffPrtProcessInpt-TD">
                          <div className="d-flex justify-content-center">
                            {proc.isEditing ? (
                              <Button
                                variant="btn btn-outline-success btn-sm "
                                onClick={() => {
                                  handleUpdateProcesses(); // or row-specific save
                                  setProcessesByPart((prev) => ({
                                    ...prev,
                                    [activePartItemNo]: prev[
                                      activePartItemNo
                                    ].map((p) =>
                                      p.id === proc.id
                                        ? { ...p, isEditing: false }
                                        : p
                                    ),
                                  }));
                                }}
                              >
                                Save
                              </Button>
                            ) : (
                              <Button
                                variant="d-block btn btn-outline-dark btn-sm "
                                className="d-block"
                                onClick={() =>
                                  setProcessesByPart((prev) => ({
                                    ...prev,
                                    [activePartItemNo]: prev[
                                      activePartItemNo
                                    ].map((p) =>
                                      p.id === proc.id
                                        ? { ...p, isEditing: true }
                                        : p
                                    ),
                                  }))
                                }
                              >
                                Edit
                              </Button>
                            )}
                          </div>
                          <Button
                            variant="btn btn-outline-danger btn-sm mt-2"
                            onClick={() => removeProcess(proc.id)}
                            className=""
                            disabled={proc.isEditing} // Don’t allow delete while editing
                          >
                            delete
                          </Button>
                        </td> */}


                        <td className="text-center KickoffPrtProcessInpt-TD">
                          <div className="d-flex flex-column align-items-center">
                            {/* ➕ Show only for parent rows */}
                            {!proc.parentWorkOrderNo && (
                              <Button
                                variant="link"
                                className="text-success mb-2"
                                onClick={() => addChildProcess(proc.woNo)}
                              >
                                <FaPlusCircle />
                              </Button>
                            )}

                            {/* Toggle between Save/Edit */}
                            {proc.isEditing ? (
                              <Button
                                variant="btn btn-outline-success btn-sm mb-2"
                                onClick={() => {
                                  handleUpdateProcesses(); // persist to backend
                                  setProcessesByPart((prev) => ({
                                    ...prev,
                                    [activePartItemNo]: prev[activePartItemNo].map((p) =>
                                      p.id === proc.id ? { ...p, isEditing: false } : p
                                    ),
                                  }));
                                }}
                              >
                                Save
                              </Button>
                            ) : (
                              <Button
                                variant="btn btn-outline-dark btn-sm mb-2"
                                onClick={() =>
                                  setProcessesByPart((prev) => ({
                                    ...prev,
                                    [activePartItemNo]: prev[activePartItemNo].map((p) =>
                                      p.id === proc.id ? { ...p, isEditing: true } : p
                                    ),
                                  }))
                                }
                              >
                                Edit
                              </Button>
                            )}

                            {/* Delete always enabled unless editing */}
                            <Button
                              variant="btn btn-outline-danger btn-sm"
                              onClick={() => removeProcess(proc.id)}
                              disabled={proc.isEditing}
                            >
                              <FaTrash />
                            </Button>
                          </div>
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

export default CompanyUpdateProjectRegistrationKickoffSheet;
