  import React, { useEffect, useRef, useState } from "react";
  import { Modal, Button, Form, Table } from "react-bootstrap";
  import { FaTrash } from "react-icons/fa";
  import Select from "react-select";
  import axiosInstance from "../../BaseComponet/axiosInstance";
  import { toast } from "react-toastify";
import CreatableSelect from "react-select/creatable";

  const processOptions = [
    { value: 'IF', label: 'IF' },
    { value: 'UL', label: 'UL' },
    { value: 'CF', label: 'CF' },
    { value: 'LF', label: 'LF' },
    { value: 'TL', label: 'TL' },
  ];


  const EditWorkOrder = ({ show, onClose, workOrderId, onUpdate }) => {
    const fileInputRef = useRef(null);
    const [images, setImages] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [processes, setProcesses] = useState([]);
    const [selectedProcesses, setSelectedProcesses] = useState([]);
    const [tableData, setTableData] = useState({});
    const nextId = useRef(1);
    const [itemNo, setItemNo]=useState();
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
      partNumber:'',
    });

    const [projectOptions, setProjectOptions] = useState([]);
    const [disabledProcessValues, setDisabledProcessValues] = useState([]);

    useEffect(() => {
      if (workOrderId) {
        fetchWorkOrder();
      }
    }, [workOrderId]);

    useEffect(() => {
      const allProcesses = [...processes];

      const manualProcesses = allProcesses.filter(p => p.type === 'manual');
      const existingSelectIds = new Set(allProcesses.filter(p => p.type === 'select').map(p => p.id));

      const newSelects = selectedProcesses
        .filter(opt => !existingSelectIds.has(opt.value) && !disabledProcessValues.includes(opt.value))
        .map(opt => ({
          id: opt.value,
          type: 'select',
          woNo: `PT-${itemNo}${opt.value}`,
        }));

      // Combine and ensure manual first, then unique selects
      const updatedProcesses = [
        ...manualProcesses,
        ...[...allProcesses.filter(p => p.type === 'select'), ...newSelects]
          .filter((p, index, self) => self.findIndex(x => x.id === p.id) === index),
      ];

      setProcesses(updatedProcesses);
    }, [selectedProcesses]);

  useEffect(() => {
    if (!itemNo) return;
    setProcesses(currentProcesses => 
      currentProcesses.map(p => {
        if (p.type === 'select') {
          const suffix = p.woNo.substring(3).replace(/^\d+/, '')

          return { ...p, woNo: `PT-${itemNo}${suffix}` };
        }
        return p;
      })
    );
  }, [itemNo]); // This effect will now run every time 'itemNo' changes


    const fetchWorkOrder = async () => {
      try {
        const res = await axiosInstance.get(`/work/getWorkOrderById/${workOrderId}`);
        const data = res.data;
        const { workOrder, workImages, workOrderItems } = data;

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
            partNumber:workOrder.partNumber,
        });

        setItemNo(workOrder.itemNo);
        setOriginalItemNo(workOrder.itemNo); 
        setHasUserEditedItemNo(false);
        setIsItemNoUnique(true)
        setSelectedCustomer(workOrder.customerId || '');

        // Pre-fill image blobs
        setExistingImages(workImages || []);

        // Pre-fill processes
        const manualProcs = [];
        const selectProcs = [];
        const usedSelectValues = [];

        const table = {};
        workOrderItems.forEach((item, idx) => {
          const suffix = item.workOrderNo.replace(/^.*?PT-\d+/, '').trim(); 
          const isSelectProcess = processOptions.some(opt => opt.value === suffix);

          const id = isSelectProcess ? `select-${idx}` : `manual-${nextId.current++}`;

          if (isSelectProcess) {
            usedSelectValues.push(suffix);
            selectProcs.push({ id, type: 'select', woNo: item.workOrderNo });
          } else {
            manualProcs.push({ id, type: 'manual' });
          }

          table[id] = {
            cancel: item.cancel,
            scope: item.scope,
            opNo: item.operationNumber,
            process: item.proceess,
            l: item.length,
            w: item.width,
            h: item.height,
            remarks: item.remark,
            itemId:item.itemId,
          };
        });

        setProcesses([...manualProcs, ...selectProcs]);
        setTableData(table);
        setDisabledProcessValues(usedSelectValues);
      } catch (err) {
        console.error("Error loading work order:", err);
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
        const newManual = { id: newId, type: 'manual' };
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

      try {
        if (itemId) {
          const res = await axiosInstance.delete(`/work/deleteWorkOrderItem/${itemId}`);
          if (res.data) toast.success("Item Deleted successfully!");
        }
      } catch (error) {
        console.error("Error deleting work order item:", error);
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

    
    const handleUpdate = async () => {
      const { partName, customer, project, thickness, material,partNumber } = formData;
      
      let hasError = false;
  
      if (!customer || customer === '-- Select a customer --') {
        toast.error("Please select a customer");
        hasError = true;
      }
  
      if (!project) {
        toast.error("Please select a project");
        hasError = true;
      }
  
      if (!partName.trim()) {
        toast.error("Please enter part name");
        hasError = true;
      }
  
      if (!String(thickness).trim()) {
        toast.error("Please enter thickness");
        hasError = true;
      }
  
      if (!material.trim()) {
        toast.error("Please enter material");
        hasError = true;
      }
      
      if(!partNumber.trim()){
        toast.error("Please enter part number");
        hasError = true;
      }

      if (!itemNo) {
        toast.error("Item Number cannot be empty.");
        hasError = true;
      } else if (!isItemNoUnique) {
        toast.error("The entered Item Number is already in use by another work order.");
        hasError = true;
      }
      
      if (hasError) return;
      
      const items = processes.map((p) => {
        const data = tableData[p.id] || {};
        let woNo = "";

        const visibleManuals = processes.filter(proc => proc.type === 'manual' && !tableData[proc.id]?.scope);
        const manualIndex = visibleManuals.findIndex(proc => proc.id === p.id);

        if (data.scope) {
            woNo = "XX";
        } else if (p.type === "select") {
            woNo = p.woNo;
        } else if (manualIndex !== -1) {
            woNo = `PT-${itemNo}${String.fromCharCode(65 + manualIndex)}`;
        }

        return {
            itemNo: itemNo,
            workOrderNo: woNo, // Use the correctly calculated woNo
            cancel: data.cancel || false,
            scope: data.scope || false,
            operationNumber: parseInt(data.opNo || 0),
            proceess: data.process || '',
            length: parseFloat(data.l || 0),
            width: parseFloat(data.w || 0),
            height: parseFloat(data.h || 0),
            remark: data.remarks || '',
            itemId: data.itemId || null,
        };
    });

      const payload = {
        partName: formData.partName,
        customerName: formData.customer,
        customerId: formData.customerId,
        material: formData.material,
        projectName: formData.project,
        projectId: formData.projectId, 
        thickness: parseFloat(formData.thickness),
        partSize: formData.partSize,
        partWeight: formData.partWeight,
        itemNo: itemNo,
        workOrderId,
        partNumber:formData.partNumber,
      };

      const newImagesForm = new FormData();

      newImagesForm.append("workOrderId", workOrderId);
      const newImagesOnly = images.map(img => img.file);
      newImagesOnly.forEach((file) => {
        newImagesForm.append("images", file);
      });

      try {
        const res = await axiosInstance.post("/work/newWorkOrderImages", newImagesForm, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        console.log(res.data);
      } catch (error) {
        console.error("Error uploading images:", error);
      }

      const formDataToSend = new FormData();

      formDataToSend.append("workOrder", JSON.stringify(payload));
      formDataToSend.append("workOrderItems", JSON.stringify(items));

      try {
        const response = await axiosInstance.put("/work/updateWorkOrder", formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        
        if(response.data){
          if(onUpdate){
          onUpdate();
        }
        }
      } catch (error) {
        console.error("❌ Submission failed:", error);
      }
    };

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
                isInvalid={!isItemNoUnique} // Turns the field red if not unique
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
                onChange={(selected) => {
                  setSelectedProcesses(selected || []);
                }}
                placeholder="Select from list..."
                className="flex-grow-1"
                styles={{ container: base => ({ ...base, width: '300px' }) }}
              />

              <Button variant="primary" onClick={handleAddManualProcess}>
                + Add Process
              </Button>
            </div>
          </div>

          <Table bordered responsive>
            <thead>
              <tr>
                <th>Cancel</th>
                <th>Scope</th>
                <th>WO No</th>
                <th>Op No</th>
                <th>Process</th>
                <th colSpan="3">Quoted Die Sizes (mm)</th>
                <th>Remarks</th>
                <th>Action</th>
              </tr>
              <tr>
                <th />
                <th />
                <th />
                <th />
                <th />
                <th style={{ width: "70px" }}>L</th>
                <th style={{ width: "70px" }}>W</th>
                <th style={{ width: "70px" }}>H</th>
                <th />
                <th />
              </tr>
            </thead>
            <tbody>
              {processes.map((p, i) => {
                const data = tableData[p.id] || {};
                const isScoped = tableData[p.id]?.scope || false;

                const visibleManuals = processes.filter(proc => proc.type === 'manual' && !tableData[proc.id]?.scope);

                let generatedWoNo = '';
                if (p.type === 'manual') {
                  const manualIndex = visibleManuals.findIndex(proc => proc.id === p.id);
                  if (manualIndex !== -1) {
                    generatedWoNo = `PT-${itemNo}${String.fromCharCode(65 + manualIndex)}`;
                  }
                }

                const displayWoNo = isScoped ? 'XX' : (p.type === 'select' ? p.woNo : generatedWoNo);


                return (
                  <tr key={p.id}>
                    <td className="align-middle">
                        <Form.Check 
                          type="checkbox" 
                          checked={tableData[p.id]?.cancel || false}
                          disabled={p.type === 'select' || tableData[p.id]?.scope || false}
                          onChange={e => handleTableInputChange(p.id, 'cancel', e.target.checked)}
                        />
                      </td>
                      <td className="align-middle">
                        <Form.Check 
                          type="checkbox" 
                          checked={tableData[p.id]?.scope || false}
                          disabled={p.type === 'select' || tableData[p.id]?.cancel || false}
                          onChange={e => handleTableInputChange(p.id, 'scope', e.target.checked)}
                        />
                    </td>
                    <td className="align-middle">{displayWoNo}</td>
                    <td className="align-middle">
                      {p.type === 'select' ? (
                          'XX'
                      ) : (
                          <select
                          className="form-select modern-dropdown"
                          value={tableData[p.id]?.opNo || ''}
                          onChange={(e) => handleTableInputChange(p.id, 'opNo', e.target.value)}
                          >
                          <option value="">Select</option>
                          {Array.from({ length: 40 }, (_, i) => {
                              const value = String((i + 1) * 5).padStart(2, '0');
                              return (
                              <option key={value} value={value}>
                                  {value}
                              </option>
                              );
                          })}
                          </select>
                      )}
                    </td>
                    <td><Form.Control size="sm" value={data.process || ''} onChange={e => handleTableInputChange(p.id, 'process', e.target.value)} /></td>
                    <td><Form.Control size="sm" type="number" step="any" min="0" value={data.l || ''} onChange={e => handleTableInputChange(p.id, 'l', e.target.value)} /></td>
                    <td><Form.Control size="sm" type="number" step="any" min="0" value={data.w || ''} onChange={e => handleTableInputChange(p.id, 'w', e.target.value)} /></td>
                    <td><Form.Control size="sm" type="number" step="any" min="0" value={data.h || ''} onChange={e => handleTableInputChange(p.id, 'h', e.target.value)} /></td>
                    <td><Form.Control size="sm" value={data.remarks || ''} onChange={e => handleTableInputChange(p.id, 'remarks', e.target.value)} /></td>
                    <td><Button variant="link" onClick={() => handleDeleteRow(p.id,data.itemId)}><FaTrash color="red" /></Button></td>
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
