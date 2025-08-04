import React, { useEffect, useRef, useState } from "react";
import { Modal, Button, Form, Table } from "react-bootstrap";
import { FaTrash } from "react-icons/fa";
import Select from "react-select";
import axiosInstance from "../../BaseComponet/axiosInstance";

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

  const [formData, setFormData] = useState({
    partName: '',
    customer: '',
    project: '',
    thickness: '',
    material: '',
    partSize: '',
    partWeight: '',
  });

  const [projectOptions, setProjectOptions] = useState([]);

  useEffect(() => {
    if (workOrderId) {
      fetchWorkOrder();
      fetchProjects();
    }
  }, [workOrderId]);

  useEffect(() => {
      const manualProcesses = processes.filter(p => p.type === 'manual');
      const alreadyAdded = new Set(processes.filter(p => p.type === 'select').map(p => p.id));

      // New select options only
      const newProcesses = selectedProcesses
        .filter(opt => !alreadyAdded.has(opt.value))
        .map(opt => ({
          id: opt.value,
          type: 'select',
          woNo: `PT-${itemNo}${opt.value}`,
        }));

      setProcesses([...manualProcesses, ...processes.filter(p => p.type === 'select'), ...newProcesses]);
    }, [selectedProcesses]);



  const fetchWorkOrder = async () => {
    try {
      const res = await axiosInstance.get(`/work/getWorkOrderById/${workOrderId}`);
      const data = res.data;
      const { workOrder, workImages, workOrderItems } = data;

      setFormData({
        partName: workOrder.partName,
        customer: workOrder.customerName,
        project: workOrder.projectName,
        thickness: workOrder.thickness,
        material: workOrder.material,
        partSize: workOrder.partSize,
        partWeight: workOrder.partWeight,
      });

      setItemNo(workOrder.itemNo);

      // Pre-fill image blobs
      setExistingImages(workImages || []);

      // Pre-fill processes
      const manualProcs = [];
      const selectProcs = [];

      const table = {};
      workOrderItems.forEach((item, idx) => {
        const suffix = item.workOrderNo.replace(/^.*?PT-\d+/, '').trim(); 
        const isSelectProcess = processOptions.some(opt => opt.value === suffix);

        const id = isSelectProcess ? `select-${idx}` : `manual-${nextId.current++}`;
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

        if (isSelectProcess) {
          selectProcs.push({ id, type: 'select', woNo: item.workOrderNo });
        } else {
          manualProcs.push({ id, type: 'manual' });
        }
      });

      setProcesses([...manualProcs, ...selectProcs]);
      setTableData(table);
    } catch (err) {
      console.error("Error loading work order:", err);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await axiosInstance.get(`/project/getByAllProjectNames`);
      setProjectOptions(res.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
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

  const handleDeleteImage = (idx, isExisting) => {
    if (isExisting) {
      setExistingImages(prev => prev.filter((_, i) => i !== idx));
    } else {
      setImages(prev => prev.filter((_, i) => i !== idx));
    }
  };

  const handleTableInputChange = (id, field, value) => {
    setTableData(prev => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [field]: value }
    }));
  };

  const handleAddManualProcess = () => {
    const newId = `manual-${nextId.current++}`;
    setProcesses(prev => [...prev, { id: newId, type: 'manual' }]);
  };

  const handleDeleteRow = (id) => {
    setProcesses(prev => prev.filter(p => p.id !== id));
  };

  
  const handleUpdate = async () => {
    const items = processes.map((p, idx) => {
      const data = tableData[p.id] || {};
      return {
        itemNo: itemNo,
        workOrderNo: p.type === 'select' ? p.woNo : `PT-${itemNo}${String.fromCharCode(65 + idx)}`,
        cancel: data.cancel || false,
        scope: data.scope || false,
        operationNumber: parseInt(data.opNo || 0),
        proceess: data.process || '',
        length: parseFloat(data.l || 0),
        width: parseFloat(data.w || 0),
        height: parseFloat(data.h || 0),
        remark: data.remarks || '',
        itemId:data.itemId||null,
      };
    });

    const payload = {
      partName: formData.partName,
      customerName: formData.customer,
      material: formData.material,
      projectName: formData.project,
      thickness: parseFloat(formData.thickness),
      partSize: formData.partSize,
      partWeight: formData.partWeight,
      itemNo: itemNo,
      workOrderId,
    };

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
              <Form.Label>Part Name</Form.Label>
              <Form.Control type="text" name="partName" value={formData.partName} onChange={handleFormChange} required />
            </Form.Group>
            <Form.Group className="col-md-4 mb-3">
              <Form.Label>Customer</Form.Label>
              <Form.Control as="select" name="customer" value={formData.customer} onChange={handleFormChange} required>
                <option>Customer Name</option>
                <option>Customer A</option>
                <option>Customer B</option>
                <option>Customer C</option>
                <option>Customer D</option>
                <option>Customer E</option>
              </Form.Control>
            </Form.Group>
            <Form.Group className="col-md-4 mb-3">
              <Form.Label>Project</Form.Label>
              <Form.Control as="select" name="project" value={formData.project} onChange={handleFormChange} required>
                <option value="" disabled={formData.project !== ''}>
                  -- Select a project --
                </option>
                {projectOptions.map((project, index) => (
                  <option key={index} value={project}>
                    {project}
                  </option>
                ))}
              </Form.Control>

            </Form.Group>
            <Form.Group className="col-md-4 mb-3">
              <Form.Label>Thickness</Form.Label>
              <Form.Control type="text" name="thickness" value={formData.thickness} onChange={handleFormChange} required />
            </Form.Group>
            <Form.Group className="col-md-4 mb-3">
              <Form.Label>Material</Form.Label>
              <Form.Control type="text" name="material" value={formData.material} onChange={handleFormChange} required />
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
          <strong>Item No.: {itemNo}</strong>
          <div className="d-flex align-items-center gap-2">
            <strong className="me-2">Workorder Process</strong>
            <Select
              isMulti
              isClearable
              options={processOptions}
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
              const manualIndex = processes.filter(proc => proc.type === 'manual').findIndex(proc => proc.id === p.id);
              const woNo = p.type === 'select' ? p.woNo : `PT-${itemNo}${String.fromCharCode(65 + manualIndex)}`;
              return (
                <tr key={p.id}>
                  <td className="align-middle">
                      <Form.Check 
                        type="checkbox" 
                        checked={tableData[p.id]?.cancel || false}
                        onChange={e => handleTableInputChange(p.id, 'cancel', e.target.checked)}
                      />
                    </td>
                    <td className="align-middle">
                      <Form.Check 
                        type="checkbox" 
                        checked={tableData[p.id]?.scope || false}
                        onChange={e => handleTableInputChange(p.id, 'scope', e.target.checked)}
                      />
                  </td>
                  <td className="align-middle">{woNo}</td>
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
                  <td><Form.Control size="sm" value={data.l || ''} onChange={e => handleTableInputChange(p.id, 'l', e.target.value)} /></td>
                  <td><Form.Control size="sm" value={data.w || ''} onChange={e => handleTableInputChange(p.id, 'w', e.target.value)} /></td>
                  <td><Form.Control size="sm" value={data.h || ''} onChange={e => handleTableInputChange(p.id, 'h', e.target.value)} /></td>
                  <td><Form.Control size="sm" value={data.remarks || ''} onChange={e => handleTableInputChange(p.id, 'remarks', e.target.value)} /></td>
                  <td><Button variant="link" onClick={() => handleDeleteRow(p.id)}><FaTrash color="red" /></Button></td>
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
