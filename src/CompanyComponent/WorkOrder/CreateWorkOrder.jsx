import React, { useRef, useState, useEffect } from "react";
import { Modal, Button, Form, Table } from "react-bootstrap";
import { FaTrash } from "react-icons/fa";
import Select from "react-select";

// The master list of predefined processes for the dropdown
const processOptions = [
  { value: 'IF', label: 'IF' },
  { value: 'UL', label: 'UL' },
  { value: 'CF', label: 'CF' },
  { value: 'LF', label: 'LF' },
  { value: 'TL', label: 'TL' },
];


const CreateWorkOrder = ({ show, onClose, onSave }) => {
  const fileInputRef = useRef(null);
  const [images, setImages] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [selectedProcesses, setSelectedProcesses] = useState([]);
  const [tableData, setTableData] = useState({});
  const nextId = useRef(1);

  // State for the main form fields
  const [formData, setFormData] = useState({
    partName: '',
    customer: 'Customer Name',
    project: 'Project Name',
    thickness: '',
    material: '',
    partSize: '',
    partWeight: '',
  });

  // --- Syncing Dropdown with Main Process Table ---
  useEffect(() => {
    const manualProcesses = processes.filter(p => p.type === 'manual');
    const selectedFromDropdown = selectedProcesses.map(option => ({
      id: option.value,
      type: 'select',
      woNo: `PT-1541${option.value}`,
      opNo: 'XX',
    }));
    setProcesses([...manualProcesses, ...selectedFromDropdown]);
  }, [selectedProcesses]);

  // --- Handlers ---

  const handleUploadClick = () => { fileInputRef.current.click(); };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDeleteImage = (indexToDelete) => {
    setImages(prevImages => prevImages.filter((_, index) => index !== indexToDelete));
  };

  const handleAddManualProcess = () => {
    const newId = `manual-${nextId.current}`;
    setProcesses(prev => [
      ...prev,
      { id: newId, type: 'manual' }
    ]);
    nextId.current += 1;
  };

  const handleDeleteRow = (id, type) => {
    if (type === 'select') {
      setSelectedProcesses(prev => prev.filter(p => p.value !== id));
    } else {
      setProcesses(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleTableInputChange = (id, field, value) => {
    setTableData(prevData => ({
      ...prevData,
      [id]: { ...(prevData[id] || {}), [field]: value }
    }));
  };

  const handleSaveClick = () => {
    const processDetails = processes.map(p => {
      const manualIndex = processes.filter(proc => proc.type === 'manual').findIndex(proc => proc.id === p.id);
      const woNo = p.type === 'select' ? p.woNo : `PT-1541${String.fromCharCode(65 + manualIndex)}`;
      const rowData = tableData[p.id] || {};

      return {
        cancel: rowData.cancel || false,
        scope: rowData.scope || false,
        woNo: woNo,
        opNo: p.type === 'select' ? 'XX' : rowData.opNo || '',
        process: rowData.process || '',
        quotedDieSizes: {
          l: rowData.l || '',
          w: rowData.w || '',
          h: rowData.h || '',
        },
        remarks: rowData.remarks || '',
        type: p.type,
      };
    });

    const finalPayload = {
      itemNo: '1541',
      ...formData,
      images: images.map(img => ({ name: img.file.name, size: img.file.size, type: img.file.type })),
      workorderProcesses: processDetails,
    };

    console.log("---- WORK ORDER PAYLOAD ----");
    console.log(JSON.stringify(finalPayload, null, 2));

    if (onSave) {
      onSave(finalPayload);
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>Add Work Order</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {/* Part Image Upload Section */}
          <div className="mb-4">
            <Form.Group>
              <Form.Label>Part Image</Form.Label>
              <div className="d-flex flex-wrap gap-2">
                <div 
                  className="upload-box text-center d-flex flex-column align-items-center justify-content-center" 
                  onClick={handleUploadClick}
                >
                  <div className="plus_sysmbol" style={{ fontSize: "2rem" }}>+</div>
                  <strong>Click to upload</strong>
                  <small>PNG, JPG, GIF</small>
                </div>
                {images.map((img, index) => (
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
                ))}
                <Form.Control type="file" ref={fileInputRef} onChange={handleFileChange} multiple style={{ display: "none" }} accept="image/png, image/jpeg, image/gif" />
              </div>
            </Form.Group>
          </div>
          
          {/* Work Order Details Section */}
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
              </Form.Control>
            </Form.Group>
            <Form.Group className="col-md-4 mb-3">
              <Form.Label>Project</Form.Label>
              <Form.Control as="select" name="project" value={formData.project} onChange={handleFormChange} required>
                <option>Project Name</option>
                <option>Project X</option>
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

        {/* Workorder Process Section */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <strong>Item No.: 1541</strong>
          <div className="d-flex align-items-center gap-2">
            <strong className="me-2">Workorder Process</strong>
            <Select
              isMulti
              isClearable
              options={processOptions}
              value={selectedProcesses}
              onChange={setSelectedProcesses}
              placeholder="Select from list..."
              className="flex-grow-1"
              styles={{ container: base => ({ ...base, width: '300px' }) }}
            />
            <Button variant="primary" onClick={handleAddManualProcess}>
              + Add Process
            </Button>
          </div>
        </div>

        {/* Workorder Process Table */}
        <Table bordered hover responsive>
          <thead className="table-light text-center">
            <tr>
              <th>Cancel</th>
              <th>Scope</th>
              <th style={{ width: "160px" }}>WO No</th>
              <th>OP No</th>
              <th>Process</th>
              <th colSpan="3">Quoted Die Sizes (mm)</th>
              <th>Remarks</th>
              <th>Actions</th>
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
          <tbody className="text-center">
            {processes.map((p) => {
              const manualIndex = processes.filter(proc => proc.type === 'manual').findIndex(proc => proc.id === p.id);
              const woNo = p.type === 'select' ? p.woNo : `PT-1541${String.fromCharCode(65 + manualIndex)}`;

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

                  <td className="align-middle">
                    <Form.Control size="sm" type="text" value={tableData[p.id]?.process || ''} onChange={e => handleTableInputChange(p.id, 'process', e.target.value)} />
                  </td>
                  <td className="align-middle">
                    <Form.Control size="sm" type="text" value={tableData[p.id]?.l || ''} onChange={e => handleTableInputChange(p.id, 'l', e.target.value)}/>
                  </td>
                  <td className="align-middle">
                    <Form.Control size="sm" type="text" value={tableData[p.id]?.w || ''} onChange={e => handleTableInputChange(p.id, 'w', e.target.value)}/>
                  </td>
                  <td className="align-middle">
                    <Form.Control size="sm" type="text" value={tableData[p.id]?.h || ''} onChange={e => handleTableInputChange(p.id, 'h', e.target.value)}/>
                  </td>
                  <td className="align-middle">
                    <Form.Control size="sm" type="text" value={tableData[p.id]?.remarks || ''} onChange={e => handleTableInputChange(p.id, 'remarks', e.target.value)}/>
                  </td>
                  <td className="align-middle">
                    <Button variant="link" className="text-danger" onClick={() => handleDeleteRow(p.id, p.type)}>
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Close</Button>
        <Button variant="primary" onClick={handleSaveClick}>Save</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateWorkOrder;
