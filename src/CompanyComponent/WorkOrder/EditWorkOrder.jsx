import React, { useEffect, useRef, useState } from "react";
import { Modal, Button, Form, Table } from "react-bootstrap";
// Make sure to import FaPlus
import { FaPlus, FaTrash } from "react-icons/fa";
import Select from "react-select";
import axiosInstance from "../../BaseComponet/axiosInstance";
import { toast } from "react-toastify";
import CreatableSelect from "react-select/creatable";

const EditWorkOrder = ({ show, onClose, workOrderId, onUpdate }) => {
    const fileInputRef = useRef(null);
    const [images, setImages] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [processes, setProcesses] = useState([]);
    const [selectedProcesses, setSelectedProcesses] = useState([]);
    const [tableData, setTableData] = useState({});
    const nextId = useRef(1);
    const [itemNo, setItemNo] = useState();
    const [loadingPart, setLoadingPart] = useState(false);
    const [loadingThickness, setLoadingThickness] = useState(false);
    const [loadingMaterial, setLoadingMaterial] = useState(false);
    const [partOptions, setPartOptions] = useState([]);
    const [materialOptions, setMaterialOptions] = useState([]);
    const [thicknessOptions, setThicknessOptions] = useState([]);
    const [projectLoading, setProjectLoading] = useState(false);
    const [isCustomerLoading, setIsCustomerLoading] = useState(false);
    const [customerOptions, setCustomerOptions] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [isItemNoUnique, setIsItemNoUnique] = useState(true);
    const [isCheckingItemNo, setIsCheckingItemNo] = useState(false);
    const [originalItemNo, setOriginalItemNo] = useState(null);
    const [hasUserEditedItemNo, setHasUserEditedItemNo] = useState(false);
    const [processOptions, setProcessOptions] = useState([]);
    const [processLoading, setProcessLoading] = useState();
    const [processesSuggestionsOptions, setProcessesSuggestionsOptions] = useState([]);
    const [processesSuggestionsLoading, setProcessesSuggestionsLoading] = useState();
    const [itemsToDelete, setItemsToDelete] = useState([]);

    const [formData, setFormData] = useState({
        partName: '',
        customer: '',
        customerId: '',
        project: '',
        projectId: '',
        thickness: '',
        material: '',
        partSize: '',
        partWeight: '',
        partNumber: '',
    });

    const [projectOptions, setProjectOptions] = useState([]);
    const [disabledProcessValues, setDisabledProcessValues] = useState([]);

    useEffect(() => {
        const loadInitialData = async () => {
            const fetchedProcessOpts = await fetchProcesses();
            await fetchProcessesSuggestions();
            if (fetchedProcessOpts && workOrderId) {
                await fetchWorkOrder(fetchedProcessOpts);
            }
        };

        if (show && workOrderId) {
            loadInitialData();
        }
        return () => {
            setProcesses([]);
            setTableData({});
            setExistingImages([]);
            setImages([]);
            setSelectedProcesses([]);
            setDisabledProcessValues([]);
            setItemsToDelete([]);
        };
    }, [workOrderId, show]);

    useEffect(() => {
        setProcesses(currentProcesses => {
            const manualProcesses = currentProcesses.filter(p => p.type === 'manual');
            const newSelectProcesses = selectedProcesses.map(option => {
                return {
                    id: option.value,
                    type: 'select',
                    woNo: `PT-${itemNo || ''}${option.value}`,
                };
            });
            return [...manualProcesses, ...newSelectProcesses];
        });
        setTableData(currentTableData => {
            const newTableData = { ...currentTableData };
            const selectedIds = new Set(selectedProcesses.map(opt => opt.value));
            for (const processId in newTableData) {
                if (!processId.startsWith('manual-')) {
                    if (!selectedIds.has(processId)) {
                        delete newTableData[processId];
                    }
                }
            }
            return newTableData;
        });

    }, [selectedProcesses, itemNo]);

    const handleAddSubProcess = (parentId) => {
        const newId = `manual-${nextId.current++}`;
        const newSubProcess = {
            id: newId,
            type: 'manual',
            sub: true,
            parentId: parentId,
        };

        setProcesses(prev => {
            const parentIndex = prev.findIndex(p => p.id === parentId);
            if (parentIndex === -1) return prev;
            let lastChildIndex = parentIndex;
            for (let i = prev.length - 1; i > parentIndex; i--) {
                if (prev[i].parentId === parentId) {
                    lastChildIndex = i;
                    break;
                }
            }
            const newProcesses = [...prev];
            newProcesses.splice(lastChildIndex + 1, 0, newSubProcess);
            return newProcesses;
        });
    };

    const fetchWorkOrder = async (pOptions) => {
        try {
            const res = await axiosInstance.get(`/work/getWorkOrderById/${workOrderId}`);
            const data = res.data;
            const { workOrder, workImages, workOrderItems } = data;
            workOrderItems.sort((a, b) => a.srNo - b.srNo);
            // Set form data for the top section
            setFormData({
                partName: workOrder.partName,
                customer: workOrder.customerName,
                customerId: workOrder.customerId,
                project: workOrder.projectName,
                projectId: workOrder.projectId,
                thickness: workOrder.thickness,
                material: workOrder.material,
                partSize: workOrder.partSize,
                partWeight: workOrder.partWeight,
                partNumber: workOrder.partNumber,
            });

            setItemNo(workOrder.itemNo);
            setOriginalItemNo(workOrder.itemNo);
            setHasUserEditedItemNo(false);
            setIsItemNoUnique(true);
            setSelectedCustomer(workOrder.customerId || '');
            setExistingImages(workImages || []);
            
            const finalProcesses = [];
            const finalTableData = {};
            const selectedFromDropdown = [];
            const usedSelectValues = new Set();
            const woNoToIdMap = {};

            workOrderItems.forEach(item => {
                const isSelectType = item.operationNumber === 0;
                const id = isSelectType ? item.workOrderNo.replace(/^.*?PT-\d+/, '').trim() : `manual-${nextId.current++}`;
                
                woNoToIdMap[item.workOrderNo] = id;
                
                let parentId = null;
                if (item.parentWorkOrderNo && item.parentWorkOrderNo !== 'XX') {
                    parentId = woNoToIdMap[item.parentWorkOrderNo];
                }

                finalProcesses.push({
                    id: id,
                    type: isSelectType ? 'select' : 'manual',
                    sub: !!parentId,
                    parentId: parentId,
                    isOrphan: item.parentWorkOrderNo === 'XX',
                    woNo: item.workOrderNo,
                });

                finalTableData[id] = {
                    cancel: item.cancel,
                    scope: item.scope,
                    opNo: item.operationNumber === -1 ? '' : item.operationNumber,
                    process: item.proceess,
                    l: item.length,
                    w: item.width,
                    h: item.height,
                    remarks: item.remark,
                    itemId: item.itemId,
                };

                if (isSelectType) {
                    const suffix = item.workOrderNo.replace(/^.*?PT-\d+/, '').trim();
                    usedSelectValues.add(suffix);
                    const option = pOptions.find(opt => opt.value === suffix) || { value: suffix, label: `${suffix} (Archived)` };
                    selectedFromDropdown.push(option);
                }
            });

            const combinedProcessOptions = [...pOptions];
            Array.from(usedSelectValues).forEach(val => {
                if (!pOptions.some(opt => opt.value === val)) {
                    combinedProcessOptions.push({ value: val, label: `${val} (Archived)` });
                }
            });

            setProcessOptions(combinedProcessOptions);
            setSelectedProcesses(selectedFromDropdown);
            setProcesses(finalProcesses);
            setTableData(finalTableData);
            setDisabledProcessValues([]);

        } catch (err) {
            console.error("Error loading work order:", err);
            toast.error("Failed to load work order details.");
        }
    };

    const handleUpdate = async () => {
        const { partName, customer, project, thickness, material,partNumber } = formData;
        
        let hasError = false;

        if (!customer || customer === '-- Select a customer --') { toast.error("Please select a customer"); hasError = true; }
        if (!project) { toast.error("Please select a project"); hasError = true; }
        if (!partName.trim()) { toast.error("Please enter part name"); hasError = true; }
        if (!String(thickness).trim()) { toast.error("Please enter thickness"); hasError = true; }
        if (!material.trim()) { toast.error("Please enter material"); hasError = true; }
        if(!partNumber.trim()){ toast.error("Please enter part number"); hasError = true; }
        if (!itemNo) { toast.error("Item Number cannot be empty."); hasError = true; } 
        else if (!isItemNoUnique) { toast.error("The entered Item Number is already in use by another work order."); hasError = true; }
        
        if (hasError) return;

        if (itemsToDelete.length > 0) {
            try {
                await axiosInstance.delete("/work/deleteWorkOrderItems", { 
                    data: itemsToDelete 
                });
                console.log("Successfully deleted staged items:", itemsToDelete);

            } catch (error) {
                console.error("❌ Failed to delete processes:", error);
                toast.error("Could not delete the removed processes. Please try again.");
                return; 
            }
        }

        const processDetails = [];
        const visibleManualParents = processes.filter(p => p.type === 'manual' && !p.sub && !tableData[p.id]?.scope);

        processes.forEach((p, index) => {
        const rowData = tableData[p.id] || {};

        
        if (p.isOrphan) {
            processDetails.push({
                sequence: index + 1,
                workOrderNo: 'XX',
                parentWorkOrderNo: 'XX',
                itemNo: itemNo,
                cancel: rowData.cancel || false,
                scope: rowData.scope || false,
                operationNumber: rowData.opNo && rowData.opNo !== '' ? parseInt(rowData.opNo, 10) : -1,
                proceess: rowData.process || '',
                length: parseFloat(rowData.l || '0'),
                width: parseFloat(rowData.w || '0'),
                height: parseFloat(rowData.h || '0'),
                remark: rowData.remarks || '',
                itemId: rowData.itemId || null,
            });
            return;
        }
        
       
        const parentExists = p.sub && processes.some(parent => parent.id === p.parentId);
        if (p.sub && !parentExists) {
            processDetails.push({
                sequence: index + 1,
                workOrderNo: 'XX',
                parentWorkOrderNo: 'XX',
                itemNo: itemNo,
                cancel: rowData.cancel || false,
                scope: rowData.scope || false,
                operationNumber: rowData.opNo && rowData.opNo !== '' ? parseInt(rowData.opNo, 10) : -1,
                proceess: rowData.process || '',
                length: parseFloat(rowData.l || '0'),
                width: parseFloat(rowData.w || '0'),
                height: parseFloat(rowData.h || '0'),
                remark: rowData.remarks || '',
                itemId: rowData.itemId || null,
            });
            return; 
        }
        
        let woNo = "";
        let isScoped = rowData.scope || false;
        let parentWorkOrderNoForPayload = null;

        if (p.sub) {

            const parentIndex = visibleManualParents.findIndex(parent => parent.id === p.parentId);
            if (parentIndex >= 0) {
                const parentWoNo = `PT-${itemNo}${String.fromCharCode(65 + parentIndex)}`;
                parentWorkOrderNoForPayload = parentWoNo;
            }
        }

        if (isScoped) {
            woNo = "XX";
        } else if (p.type === "select") {
            woNo = p.woNo;
        } else if (p.sub) {
            if (parentWorkOrderNoForPayload) {
                const visibleSiblings = processes.filter(s => s.parentId === p.parentId && !tableData[s.id]?.scope);
                const subIndex = visibleSiblings.findIndex(s => s.id === p.id);
                woNo = (subIndex >= 0) ? `${parentWorkOrderNoForPayload}${subIndex + 1}` : 'XX';
            } else {
                woNo = "XX";
                parentWorkOrderNoForPayload = "XX"; 
            }
        } else {
            const manualIndex = visibleManualParents.findIndex(proc => proc.id === p.id);
            woNo = `PT-${itemNo}${String.fromCharCode(65 + manualIndex)}`;
        }
        
        let operationNumberValue;
        if (p.type === 'select') {
            operationNumberValue = 0;
        } else {
            operationNumberValue = rowData.opNo && rowData.opNo !== '' ? parseInt(rowData.opNo, 10) : -1;
        }

        processDetails.push({
            sequence: index + 1,
            itemNo: itemNo,
            workOrderNo: woNo,
            cancel: rowData.cancel || false,
            scope: rowData.scope || false,
            operationNumber: operationNumberValue,
            proceess: rowData.process || '',
            length: parseFloat(rowData.l || '0'),
            width: parseFloat(rowData.w || '0'),
            height: parseFloat(rowData.h || '0'),
            remark: rowData.remarks || '',
            parentWorkOrderNo: parentWorkOrderNoForPayload,
            itemId: rowData.itemId || null,
        });
    });

        const payload = {
            partName: formData.partName,
            customerName: formData.customer,
            customerId: formData.customerId,
            material: formData.material,
            projectName: formData.project,
            projectId: formData.projectId,
            thickness: formData.thickness,
            partSize: formData.partSize,
            partWeight: formData.partWeight,
            itemNo: itemNo,
            workOrderId,
            partNumber: formData.partNumber,
        };

        const newImagesForm = new FormData();
        newImagesForm.append("workOrderId", workOrderId);
        images.forEach((img) => {
            newImagesForm.append("images", img.file);
        });

        if (images.length > 0) {
            try {
                await axiosInstance.post("/work/newWorkOrderImages", newImagesForm, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            } catch (error) {
                console.error("Error uploading new images:", error);
                toast.error("Failed to upload new images.");
            }
        }

        const formDataToSend = new FormData();
        formDataToSend.append("workOrder", JSON.stringify(payload));
        formDataToSend.append("workOrderItems", JSON.stringify(processDetails));

        try {
            const response = await axiosInstance.put("/work/updateWorkOrder", formDataToSend, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            if (response.data) {
                toast.success("Work Order updated successfully!");
                if (onUpdate) {
                    onUpdate();
                }
                onClose();
            }
        } catch (error) {
            console.error("❌ Submission failed:", error);
            toast.error(error.response?.data?.message || "Update failed!");
        }
    };

    const fetchProcesses = async () => {
    setProcessLoading(true);
    try {
      const res = await axiosInstance.get("/work/getAllWorkOrderProcesses");
      const data = res.data;

      const options = data.map((process) => ({
        value: process.processName,
        label: process.processName
      }));

      setProcessOptions(options);
      return options;
    } catch (error) {
      toast.error("Failed to load processes");
      console.error(error);
      return null;
    } finally {
      setProcessLoading(false);
    }
  };

  const fetchProcessesSuggestions = async () => {
      setProcessesSuggestionsLoading(true);
      try {
        const res = await axiosInstance.get("/work/getAllProcesses");
        const data = res.data;
  
        const option = data.map((process)=>({
          value:process.processName,
          label:process.processName
        }))
  
        setProcessesSuggestionsOptions(option);
        return option;
      } catch (error) {
        toast.error("Failed to load processes");
        console.error(error);
        return null;
      } finally {
        setProcessesSuggestionsLoading(false);
      }
    };

    const handleFormChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUploadClick = () => fileInputRef.current?.click();

    const handleFileChange = (e) => {
      const files = Array.from(e.target.files);
      const newImages = files.map(file => ({ file, url: URL.createObjectURL(file) }));
      setImages(prev => [...prev, ...newImages]);
    };

    const handleDeleteImage = async (idx, isExisting,imgId) => {
      if (isExisting) {
        const res = await axiosInstance.delete(`/work/deleteWorkOrderImage/${imgId}`);
        if(res.data){
          toast.success("Image deleted successfully!")
        }else{
          toast.error("Something wents wrong while deleting the image...")

        }
        setExistingImages(prev => prev.filter((_, i) => i !== idx));
      } else {
        setImages(prev => prev.filter((_, i) => i !== idx));
      }
    };

    const handleTableInputChange = (id, field, value) => {
      setTableData(prevData => {
        const currentRow = prevData[id] || {};
        const updated = { ...currentRow, [field]: value };

        if (field === 'cancel' && value === true) {
          updated.scope = false;
        }

        if (field === 'scope' && value === true) {
          updated.cancel = false;
        }

        return {
          ...prevData,
          [id]: updated
        };
      });
    };


    const handleAddManualProcess = () => {
      const newId = `manual-${nextId.current++}`;
      setProcesses(prev => {
        const newManual = { id: newId, type: 'manual', sub: false, parentId: null };
        const manual = [...prev.filter(p => p.type === 'manual'), newManual];
        const select = prev.filter(p => p.type === 'select');
        return [...manual, ...select];
      });

    };

    const handleDeleteRow = async (id, itemId) => {
      const deletedProcess = processes.find(p => p.id === id);
      setProcesses(prev => prev.filter(p => p.id !== id));
      
      setTableData(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });

      if (deletedProcess?.type === 'select') {
        const suffix = deletedProcess.woNo.replace(/^.*?PT-\d+/, '').trim();
        setSelectedProcesses(prev => prev.filter(p => p.value !== suffix));
        setDisabledProcessValues(prev => prev.filter(val => val !== suffix));
      }
      if (itemId) {
        setItemsToDelete(prev => [...prev, itemId]);
    }
      
    };


    const handleItemNoChange = (e) => {
      const value = e.target.value;
      if (/^\d*$/.test(value)) {
        setItemNo(value);
        setHasUserEditedItemNo(true);
      }
    };

    const checkItemNoUniqueness = async (number) => {
      if (!number) {
          setIsItemNoUnique(true);
          return;
      }
      setIsCheckingItemNo(true);
      setIsItemNoUnique(true);
      try {
          const response = await axiosInstance.get(`/work/checkItemNo/${number}`);
          console.log(response);
          setIsItemNoUnique(response.data.isUnique);
  
      } catch (error) {
          toast.error("Could not verify Item Number. Please try again.");
          setIsItemNoUnique(false); 
          console.error("Error checking item number uniqueness:", error);
      } finally {
          setIsCheckingItemNo(false);
      }
    };

    useEffect(() => {
        if (!hasUserEditedItemNo) {
            return;
        }
        if (String(itemNo) === String(originalItemNo)) {
            setIsItemNoUnique(true);
            return;
        }

      const handler = setTimeout(() => {
          if (itemNo) {
              checkItemNoUniqueness(itemNo);
          } else {
              setIsItemNoUnique(true);
          }
      }, 500); 
      return () => {
          clearTimeout(handler);
      };
    }, [itemNo, originalItemNo, hasUserEditedItemNo]); 

      const fetchProjects = async () => {
        if (!selectedCustomer) {
          toast.error("Please select a customer first");
          return;
        }
        try {
          setProjectLoading(true); 
    
          const response = await axiosInstance.get(`/project/getProjectByCustomerId/${selectedCustomer}`);
          const options = response.data.map(project => ({
            label: project.projectName,
            value: project.projectName,
            id:project.projectId
          }));
          setProjectOptions(options);
        } catch (error) {
          console.error("Error fetching projects:", error);
          toast.error("Failed to load projects");
        } finally {
          setProjectLoading(false);
        }
      };

      const fetchParts = async () => {
          try {
            setLoadingPart(true);
      
            const res = await axiosInstance.get("/work/getAllParts");
            const options = res.data.map(p => ({
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
      
      
        const handlePartsSelect = (selectedOption) => {
          if (!selectedOption) {
            setFormData(prev => ({ ...prev, partName: "" }));
          } else {
            setFormData(prev => ({ ...prev, partName: selectedOption.label }));
          }
        };
      
        const handlePartsCreateOption = async (inputValue) => {
          setLoadingPart(true);
          try {
            const res = await axiosInstance.post(`/work/addPart/${inputValue}`);
            const newOption = {
              label: res.data.partName,
              value: res.data.partId,
            };
            setPartOptions(prev => [...prev, newOption]);
            setFormData(prev => ({ ...prev, partName: newOption.label }));
            toast.success(`Added "${newOption.label}"`);
          } catch (err) {
            toast.error("Failed to add part");
          } finally {
            setLoadingPart(false);
          }
        };
      
        const fetchMaterial = async () => {
          try {
            setLoadingMaterial(true);
      
            const res = await axiosInstance.get("/work/getAllMaterials");
            const options = res.data.map(p => ({
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
      
      
        const handleMaterialSelect = (selectedOption) => {
          if (!selectedOption) {
            setFormData(prev => ({ ...prev, material: "" }));
          } else {
            setFormData(prev => ({ ...prev, material: selectedOption.label }));
          }
        };
      
        const handleMaterialCreateOption = async (inputValue) => {
          setLoadingMaterial(true);
          try {
            const res = await axiosInstance.post(`/work/addMaterial/${inputValue}`);
            const newOption = {
              label: res.data.materialName,
              value: res.data.materialId,
            };
            setPartOptions(prev => [...prev, newOption]);
            setFormData(prev => ({ ...prev, material: newOption.label }));
            toast.success(`Added "${newOption.label}"`);
          } catch (err) {
            toast.error("Failed to add part");
          } finally {
            setLoadingMaterial(false);
          }
        };
      
        const fetchThickness = async () => {
          try {
            setLoadingThickness(true); 
      
            const res = await axiosInstance.get("/work/getAllThicknesses");
            const options = res.data.map(p => ({
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
      
      
        const handleThicknessSelect = (selectedOption) => {
          if (!selectedOption) {
            setFormData(prev => ({ ...prev, thickness: "" }));
          } else {
            setFormData(prev => ({ ...prev, thickness: selectedOption.label }));
          }
        };
      
        const handleThicknessCreateOption = async (inputValue) => {
          setLoadingThickness(true);
          try {
            const res = await axiosInstance.post(`/work/addThickness/${inputValue}`);
            const newOption = {
              label: res.data.thicknessName,
              value: res.data.thicknessId,
            };
            setThicknessOptions(prev => [...prev, newOption]);
            setFormData(prev => ({ ...prev, thickness: newOption.label }));
            toast.success(`Added "${newOption.label}"`);
          } catch (err) {
            toast.error("Failed to add part");
          } finally {
            setLoadingThickness(false);
          }
        };

        const fetchCustomers = async () => {
          if (customerOptions.length > 0) {
            return;
          }
          
          try {
            const response = await axiosInstance.get("/customer/getCustomerList");  
            const formattedOptions = response.data.map(customer => ({
              value: customer.companyName,
              label: customer.companyName,
              id: customer.id
            }));
            setCustomerOptions(formattedOptions);
          } catch (error) {
            console.error("Failed to fetch customers:", error);
          } finally {
            setIsCustomerLoading(false);
          }
        };
    
  const handleProcessSelectionChange = async (newlySelectedOptions) => {
      const newSelection = newlySelectedOptions || [];
      const newSelectedIds = new Set(newSelection.map(opt => opt.value));
      const removedProcess = selectedProcesses.find(oldOpt => !newSelectedIds.has(oldOpt.value));

      if (removedProcess) {
          const processIdToRemove = removedProcess.value;
          const itemData = tableData[processIdToRemove];
        
            if (itemData && itemData.itemId) {
                setItemsToDelete(prev => [...prev, itemData.itemId]);
            }
      }
      setSelectedProcesses(newSelection);
  };


    return (
        <Modal show={show} onHide={onClose} size="xl">
            <Modal.Header closeButton>
                <Modal.Title>Edit Work Order</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                  <div className="mb-4">
                    <Form.Label>Part Image</Form.Label>
                      <div className="d-flex flex-wrap gap-2">
                        <div className="upload-box text-center d-flex flex-column align-items-center justify-content-center" 
                          onClick={handleUploadClick}
                        >
                          <div className="plus_sysmbol" style={{ fontSize: "2rem" }}>+</div>
                          <strong>Click to upload</strong>
                          <small>PNG, JPG, GIF</small>
                        </div>
                      {[...existingImages.map((img,index) => (
                        <div key={index} style={{ height: "200px", width: "200px", border: "1px solid #ccc", borderRadius: "8px", overflow: "hidden", position: "relative"}}>
                            <img src={`data:image/jpeg;base64,${img.image}`} alt={`Preview ${index}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            <Button 
                              variant="danger"
                              size="sm"
                              onClick={() => handleDeleteImage(index,true,img.workOrderImageId)}
                              style={{
                                position: 'absolute',
                                top: '5px',
                                right: '5px',
                                borderRadius: '50%',
                                width: '24px',
                                height: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 0,
                                lineHeight: 1,
                              }}
                            >
                              &times;
                            </Button>
                          </div>
                      )),
                      ...images.map((img, index) => (
                        <div key={index} style={{ height: "200px", width: "200px", border: "1px solid #ccc", borderRadius: "8px", overflow: "hidden", position: "relative"}}>
                            <img src={img.url} alt={`Preview ${index}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            <Button 
                              variant="danger"
                              size="sm"
                              onClick={() => handleDeleteImage(index)}
                              style={{
                                position: 'absolute',
                                top: '5px',
                                right: '5px',
                                borderRadius: '50%',
                                width: '24px',
                                height: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 0,
                                lineHeight: 1,
                              }}
                            >
                              &times;
                            </Button>
                          </div>
                      ))]}
                      <Form.Control type="file" ref={fileInputRef} onChange={handleFileChange} multiple style={{ display: "none" }} />
                    </div>
                  </div>

                  <div className="row">
                    
                    <Form.Group className="col-md-4 mb-3">
                      <Form.Label>Customer <span className="text-danger">*</span></Form.Label>
                      <Select
                        options={customerOptions}
                        value={customerOptions.find(opt => opt.value === formData.customer) || { label: formData.customer, value: formData.customer }}
                        onChange={selected =>{
                          setSelectedCustomer(selected ? selected.id : '');  
                          setFormData(prev => ({
                              ...prev,
                              customer: selected ? selected.value : '',
                              customerId: selected ? selected.id : ''
                            }))
                          }
                        }
                        placeholder="Select a customer..."
                        isClearable
                        onMenuOpen={fetchCustomers}
                        isLoading={isCustomerLoading}
                      />
                    </Form.Group>

                    <Form.Group className="col-md-4 mb-3">
                      <Form.Label>Project <span className="text-danger">*</span></Form.Label>
                      <Select
                        options={projectOptions}
                        value={projectOptions.find(opt => opt.value === formData.project) || { label: formData.project, value: formData.project }}
                        onChange={(selected) =>
                          setFormData(prev => ({
                            ...prev,
                            project: selected ? selected.value : "",
                            projectId: selected ? selected.id : ''
                          }))
                        }
                        onMenuOpen={fetchProjects}
                        placeholder="-- Select a project --"
                        isClearable
                        isLoading={projectLoading}
                      />


                    </Form.Group>
                      
                    <Form.Group className="col-md-4 mb-3">
                      <Form.Label>Part Number <span className="text-danger">*</span></Form.Label>
                        <Form.Control type="text" name="partNumber" value={formData.partNumber} onChange={handleFormChange} />
                    </Form.Group>

                    <Form.Group className="col-md-4 mb-3">
                      <Form.Label>Part Name <span className="text-danger">*</span></Form.Label>
                      <div style={{ width: "100%" }}>
                        <CreatableSelect
                          styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                          isClearable
                          onMenuOpen={fetchParts}
                          onChange={handlePartsSelect}
                          onCreateOption={handlePartsCreateOption}
                          options={partOptions}
                          isLoading={loadingPart}
                          placeholder="Search or create part..."
                          value={
                            formData.partName
                              ? { label: formData.partName, value: formData.partName }
                              : null
                          }
                        />
                      </div>
                    </Form.Group>

                    <Form.Group className="col-md-4 mb-3">
                      <Form.Label>Material <span className="text-danger">*</span></Form.Label>
                      <div style={{ width: "100%" }}>
                        <CreatableSelect
                          styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                          isClearable
                          onMenuOpen={fetchMaterial}
                          onChange={handleMaterialSelect}
                          onCreateOption={handleMaterialCreateOption}
                          options={materialOptions}
                          placeholder="Search or create material..."
                          isLoading={loadingMaterial}
                          value={
                            formData.material
                              ? { label: formData.material, value: formData.material }
                              : null
                          }
                        />
                      </div>
                    </Form.Group>

                    <Form.Group className="col-md-4 mb-3">
                      <Form.Label>Thickness<span className="text-danger">*</span></Form.Label>
                      <div style={{ width: "100%" }}>
                        <CreatableSelect
                          styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                          isClearable
                          onMenuOpen={fetchThickness}
                          onChange={handleThicknessSelect}
                          onCreateOption={handleThicknessCreateOption}
                          options={thicknessOptions}
                          isLoading={loadingThickness}
                          placeholder="Search or create thickness..."
                          value={
                            formData.thickness
                              ? { label: formData.thickness, value: formData.thickness }
                              : null
                          }
                        />
                      </div>
                    </Form.Group>

                    <Form.Group className="col-md-4 mb-3">
                      <Form.Label>Part Size</Form.Label>
                      <Form.Control type="text" name="partSize" value={formData.partSize} onChange={handleFormChange} />
                    </Form.Group>
                    <Form.Group className="col-md-4 mb-3">
                      <Form.Label>Part Weight</Form.Label>
                      <Form.Control type="text" name="partWeight" value={formData.partWeight} onChange={handleFormChange} />
                    </Form.Group>
                    </div>
                </Form>
                <hr />
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <Form.Group style={{ maxWidth: '200px' }}>
                        <Form.Label><strong>Item No.</strong></Form.Label>
                        <Form.Control
                            type="text"
                            value={itemNo}
                            onChange={handleItemNoChange}
                            isInvalid={!isItemNoUnique}
                        />
                        {isCheckingItemNo && <Form.Text className="text-muted">Checking...</Form.Text>}
                        <Form.Control.Feedback type="invalid">
                            Item number is already in use.
                        </Form.Control.Feedback>
                    </Form.Group>
                    <div className="d-flex align-items-center gap-2">
                        <strong className="me-2">Workorder Process</strong>
                        <Select
                            isMulti
                            isClearable
                            options={processOptions.filter(opt => !disabledProcessValues.includes(opt.value))}
                            value={selectedProcesses}
                            onChange={handleProcessSelectionChange}
                            placeholder="Select from list..."
                            className="flex-grow-1"
                            isLoading={processLoading}
                            styles={{ container: base => ({ ...base, width: '300px' }) }}
                        />
                        <Button variant="primary" onClick={handleAddManualProcess}>
                            + Add Process
                        </Button>
                    </div>
                </div>

                <Table bordered hover responsive>
                    <thead className="table-light text-center">
                        <tr>
                            <th>Cancel</th>
                            <th>Scope</th>
                            <th style={{ width: "10%" }}>WO No</th>
                            <th style={{ width: "8%" }}>Op No</th>
                            <th>Process</th>
                            <th colSpan="3" style={{ width: "23%" }}>Quoted Die Sizes (mm)</th>
                            <th style={{ width: "15%" }}>Remarks</th>
                            <th>Actions</th>
                        </tr>
                        <tr>
                            <th /><th /><th /><th /><th />
                            <th style={{ width: "70px" }}>L</th>
                            <th style={{ width: "70px" }}>W</th>
                            <th style={{ width: "70px" }}>H</th>
                            <th /><th />
                        </tr>
                    </thead>
                    <tbody className="text-center">
                        {processes.map((p) => {
                            const data = tableData[p.id] || {};
                            const isScoped = data.scope || false;

                            let displayWoNo = '';

                            if (p.isOrphan) {
                                displayWoNo = 'XX';
                            } else if (isScoped) {
                                displayWoNo = 'XX';
                            } else if (p.type === 'select') {
                                displayWoNo = `PT-${itemNo || ''}${p.id}`;
                            } else if (p.sub) {
                                const parentExists = processes.some(parent => parent.id === p.parentId);
                                if (!parentExists) {
                                    displayWoNo = 'XX';
                                } else {
                                    const visibleManualParents = processes.filter(proc => proc.type === 'manual' && !proc.sub && !proc.isOrphan && !tableData[proc.id]?.scope);
                                    const parentIndex = visibleManualParents.findIndex(parent => parent.id === p.parentId);
                                    if (parentIndex >= 0) {
                                        const parentWoNo = `PT-${itemNo}${String.fromCharCode(65 + parentIndex)}`;
                                        const visibleSiblings = processes.filter(s => s.parentId === p.parentId && !tableData[s.id]?.scope);
                                        const subIndex = visibleSiblings.findIndex(s => s.id === p.id);
                                        displayWoNo = subIndex >= 0 ? `${parentWoNo}${subIndex + 1}` : 'XX';
                                    } else {
                                        displayWoNo = 'XX';
                                    }
                                }
                            } else {
                                const visibleManualParents = processes.filter(proc => proc.type === 'manual' && !proc.sub && !proc.isOrphan && !tableData[proc.id]?.scope);
                                const manualIndex = visibleManualParents.findIndex(proc => proc.id === p.id);
                                displayWoNo = manualIndex >= 0 ? `PT-${itemNo}${String.fromCharCode(65 + manualIndex)}` : 'XX';
                            }
                            p.woNo = displayWoNo;

                            return (
                                <tr key={p.id} className={(p.sub || p.isOrphan) ? 'sub-process-row' : ''}>
                                    <td className="align-middle">
                                        <Form.Check
                                            type="checkbox"
                                            checked={data.cancel || false}
                                            disabled={p.type === 'select' || isScoped}
                                            onChange={e => handleTableInputChange(p.id, 'cancel', e.target.checked)}
                                        />
                                    </td>
                                    <td className="align-middle">
                                        <Form.Check
                                            type="checkbox"
                                            checked={isScoped}
                                            disabled={p.type === 'select' || data.cancel}
                                            onChange={e => handleTableInputChange(p.id, 'scope', e.target.checked)}
                                        />
                                    </td>
                                    <td className="align-middle">{displayWoNo}</td>
                                    <td className="align-middle">
                                        {p.type === 'select' ? ('XX') : (
                                            <select
                                                className="form-select modern-dropdown"
                                                value={data.opNo || ''}
                                                onChange={(e) => handleTableInputChange(p.id, 'opNo', e.target.value)}
                                            >
                                                <option value="">Select</option>
                                                {Array.from({ length: 21 }, (_, i) => {
                                                    const value = (i === 0) ? 5 : i * 10;
                                                    const displayValue = String(value).padStart(2, '0');
                                                    return (<option key={value} value={value}>{displayValue}</option>);
                                                })}
                                            </select>
                                        )}
                                    </td>
                                    <td className="align-middle">
                                        {p.type === 'select' ? (
                                            <Select
                                                options={processesSuggestionsOptions}
                                                isLoading={processesSuggestionsLoading}
                                                value={processesSuggestionsOptions.find(option => option.value === data.process)}
                                                onChange={(selectedOption) => handleTableInputChange(p.id, "process", selectedOption ? selectedOption.value : "")}
                                                placeholder="Select Process..."
                                                menuPosition="fixed"
                                                styles={{
                                                    control: base => ({ ...base, minHeight: '31px', height: '31px' }),
                                                    indicatorsContainer: base => ({ ...base, height: '31px' }),
                                                    valueContainer: base => ({ ...base, top: '-2px' }),
                                                    singleValue: base => ({ ...base, top: '-2px' })
                                                }}
                                                isClearable={true}
                                            />
                                        ) : (
                                            <Form.Control
                                                size="sm"
                                                type="text"
                                                value={data.process || ''}
                                                onChange={e => handleTableInputChange(p.id, 'process', e.target.value)}
                                                placeholder="Enter Manual Process"
                                            />
                                        )}
                                    </td>
                                    <td><Form.Control size="sm" type="number" step="any" min="0" value={data.l || ''} onChange={e => handleTableInputChange(p.id, 'l', e.target.value)} /></td>
                                    <td><Form.Control size="sm" type="number" step="any" min="0" value={data.w || ''} onChange={e => handleTableInputChange(p.id, 'w', e.target.value)} /></td>
                                    <td><Form.Control size="sm" type="number" step="any" min="0" value={data.h || ''} onChange={e => handleTableInputChange(p.id, 'h', e.target.value)} /></td>
                                    <td><Form.Control size="sm" value={data.remarks || ''} onChange={e => handleTableInputChange(p.id, 'remarks', e.target.value)} /></td>
                                    <td className="align-middle">
                                        <Button variant="link" className="text-danger p-0" onClick={() => handleDeleteRow(p.id, data.itemId)}>
                                            <FaTrash />
                                        </Button>
                                        {p.type === 'manual' && !p.sub && !p.isOrphan &&(
                                            <Button variant="link" className="text-success p-0 ms-2" onClick={() => handleAddSubProcess(p.id)} title="Add Sub-Process">
                                                <FaPlus />
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={onClose}>Close</Button>
                <Button variant="primary" onClick={handleUpdate}>Update</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EditWorkOrder;