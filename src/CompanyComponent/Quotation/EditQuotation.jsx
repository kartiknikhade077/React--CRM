import React, { useRef, useState, useEffect } from "react";
import { Button, Container, Row, Col, Form, Card, Spinner } from "react-bootstrap";
import { FaPlusCircle, FaTrash } from "react-icons/fa";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { toast } from "react-toastify";
import axiosInstance from "../../BaseComponet/axiosInstance";

// --- Dummy Data for Select Dropdowns ---
const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'declined', label: 'Declined' }
];
const assignedOptions = [
  { value: 'Alice', label: 'Alice' },
  { value: 'Bob', label: 'Bob' },
  { value: 'Charlie', label: 'Charlie' }
];
const currencyOptions = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'INR', label: 'INR - Indian Rupee' },
  { value: 'EUR', label: 'EUR - Euro' }
];

const EditQuotation = ({ quotationId, onCancel, onSave }) => {
  // --- State for Loading ---
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // --- State for top-level form fields ---
  const [companyName, setCompanyName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [quotationNo, setQuotationNo] = useState("");
  const [supplierCode, setSupplierCode] = useState("");
  const [quotationDate, setQuotationDate] = useState(new Date().toISOString().split('T')[0]);
  const [openTill, setOpenTill] = useState("");
  const [currency, setCurrency] = useState(null);
  const [status, setStatus] = useState(null);
  const [assigned, setAssigned] = useState(null);
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState(null);
  const [state, setState] = useState(null);
  const [city, setCity] = useState(null);
  const [zip, setZip] = useState("");
  const [reference, setReference] = useState("");

  // --- State for Creatable Dropdowns ---
  const [partNameOptions, setPartNameOptions] = useState([]);
  const [loadingPartName, setLoadingPartName] = useState(false);
  const [materialOptions, setMaterialOptions] = useState([]);
  const [loadingMaterial, setLoadingMaterial] = useState(false);
  const [thicknessOptions, setThicknessOptions] = useState([]);
  const [loadingThickness, setLoadingThickness] = useState(false);

  // --- State for multiple parts and their processes ---
  const [partsData, setPartsData] = useState([]);
  const [considerations, setConsiderations] = useState([]);

  const [deletedPartIds, setDeletedPartIds] = useState([]);
  const [deletedProcessIds, setDeletedProcessIds] = useState([]);
  const [deletedImageIds, setDeletedImageIds] = useState([]);
  const [deletedConsiderationIds, setDeletedConsiderationIds] = useState([]);

  // --- Fetch existing quotation data ---
  useEffect(() => {
    const fetchQuotationData = async () => {
      if (!quotationId) {
        toast.error("No Quotation ID provided.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/sales/getQuoatation/${quotationId}`);
        const data = response.data;

        // --- Populate top-level form fields ---
        const info = data.quotationInfo;
        setCompanyName(info.companyName || "");
        setProjectName(info.projectName || "");
        setContactPerson(info.contactPersonName || "");
        setQuotationNo(info.quotationNumber || "");
        setSupplierCode(info.supplierCode || "");
        setQuotationDate(info.quotationDate ? info.quotationDate.split('T')[0] : "");
        setOpenTill(info.validDate ? info.validDate.split('T')[0] : "");
        setAddress(info.address || "");
        setReference(info.refrence || "");
        setEmail(info.email || "");
        setPhone(info.phone || "");
        setCountry(info.country || "");
        setState(info.state || "");
        setCity(info.city || "");
        setZip(info.zip || "");
        setStatus(statusOptions.find(opt => opt.value === info.status) || null);
        setCurrency(currencyOptions.find(opt => opt.value === info.currency) || null);
        setAssigned(assignedOptions.find(opt => opt.value === info.assigned) || null);


        // --- Transform and populate parts data ---
        const transformedParts = data.partsAndProcess.map(apiPart => ({
          id: apiPart.quotationPartId,
          quotationPartId: apiPart.quotationPartId,
          quotationId: apiPart.quotationId,
          partName: { label: apiPart.partName, value: apiPart.partName },
          partNumber: apiPart.partNo,
          material: { label: apiPart.material, value: apiPart.material },
          thickness: { label: apiPart.thickness, value: apiPart.thickness },
          partSize: apiPart.partSize,
          partWeight: apiPart.partWeight || '',
          images: apiPart.partImagesWithId.map(img => ({
            id: img.id,
            url: `data:image/jpeg;base64,${img.base64Image}`,
            file: null // This is an existing image, no file object
          })),
          fileInputRef: React.createRef(),
          processes: apiPart.partProcess.map(apiProcess => ({
            id: apiProcess.partProcessId,
            partProcessId: apiProcess.partProcessId,
            quotationPartId: apiProcess.quotationPartId,
            toolConstruction: apiProcess.toolConstruction,
            opNo: apiProcess.oprationNumber,
            description: apiProcess.description,
            l: apiProcess.length,
            w: apiProcess.width,
            h: apiProcess.height,
            factor: apiProcess.factor,
            rate: apiProcess.rate,
            toolCost: apiProcess.totalCost
          }))
        }));
        setPartsData(transformedParts);

        // --- Transform and populate considerations data ---
        const transformedConsiderations = data.consideration.map(apiConsideration => ({
          id: apiConsideration.id,
          title: apiConsideration.titel,
          description: apiConsideration.description,
          quotationId: apiConsideration.quotationId,
        }));
        setConsiderations(transformedConsiderations);

      } catch (error) {
        console.error("Failed to fetch quotation data:", error);
        toast.error("Failed to load quotation data.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuotationData();
  }, [quotationId]);

  // --- Handlers for Parts (Sections) and Processes (Entries) ---
  const handlePartDataChange = (partIndex, field, value) => {
    const updatedPartsData = [...partsData];
    updatedPartsData[partIndex][field] = value;
    setPartsData(updatedPartsData);
  };

  const handlePartSelectChange = (partIndex, selectedOption, actionMeta) => {
    const updatedPartsData = [...partsData];
    updatedPartsData[partIndex][actionMeta.name] = selectedOption;
    setPartsData(updatedPartsData);
  };

  const handleImageUploadClick = (partIndex) => {
    partsData[partIndex].fileInputRef.current.click();
  };

  const handleFileChange = (partIndex, e) => {
    const files = Array.from(e.target.files);
    // New images have a file object and a local URL for preview
    const newImages = files.map((file) => ({ id: null, file, url: URL.createObjectURL(file) }));
    const updatedPartsData = [...partsData];
    updatedPartsData[partIndex].images = [...updatedPartsData[partIndex].images, ...newImages];
    setPartsData(updatedPartsData);
  };

  const handleDeleteImage = (partIndex, imageIndex) => {
    const imageToDelete = partsData[partIndex].images[imageIndex];
      if (imageToDelete.id) {
          setDeletedImageIds(prev => [...prev, imageToDelete.id]);
      }
    const updatedPartsData = [...partsData];
    updatedPartsData[partIndex].images = updatedPartsData[partIndex].images.filter((_, idx) => idx !== imageIndex);
    setPartsData(updatedPartsData);
  };

  const handleProcessChange = (partIndex, processIndex, e) => {
    const { name, value } = e.target;
    const updatedPartsData = [...partsData];
    updatedPartsData[partIndex].processes[processIndex][name] = value;
    setPartsData(updatedPartsData);
  };

  const addProcess = (partIndex) => {
    const updatedPartsData = [...partsData];
    const newProcessId = Date.now(); // Temporary unique ID for React key
    updatedPartsData[partIndex].processes.push({ id: newProcessId, partProcessId: null, toolConstruction: '', opNo: '', description: '', l: '', w: '', h: '', factor: '', rate: '', toolCost: '', quotationPartId: null });
    setPartsData(updatedPartsData);
  };

  const removeProcess = (partIndex, processIndex) => {
      if (partsData[partIndex].processes.length <= 1) return;
      const processToDelete = partsData[partIndex].processes[processIndex];
      if (processToDelete.partProcessId) {
          setDeletedProcessIds(prev => [...prev, processToDelete.partProcessId]);
      }
      const updatedPartsData = [...partsData];
      updatedPartsData[partIndex].processes.splice(processIndex, 1);
      setPartsData(updatedPartsData);
  };

  const addPart = () => {
    const newPartId = Date.now(); // Temporary unique ID for React key
    setPartsData([
      ...partsData,
      {
        id: newPartId,
        quotationPartId: null,
        quotationId: null,
        partName: null,
        partNumber: '',
        material: null,
        thickness: null,
        partSize: '',
        partWeight: '',
        images: [],
        fileInputRef: React.createRef(),
        processes: [{ id: Date.now(), partProcessId: null, toolConstruction: '', opNo: '', description: '', l: '', w: '', h: '', factor: '', rate: '', toolCost: '', quotationPartId: null }]
      }
    ]);
  };

  const removePart = (partIndex) => {
      if (partsData.length <= 1) return;
      const partToDelete = partsData[partIndex];
      if (partToDelete.quotationPartId) {
          setDeletedPartIds(prev => [...prev, partToDelete.quotationPartId]);
      }
      setPartsData(partsData.filter((_, idx) => idx !== partIndex));
  };

  const handleConsiderationChange = (index, e) => {
    const { name, value } = e.target;
    const newConsiderations = [...considerations];
    newConsiderations[index][name] = value;
    setConsiderations(newConsiderations);
  };

  const addConsideration = () => {
    setConsiderations([...considerations, { id: null, title: '', description: '', quotationId: null }]);
  };

  const removeConsideration = (index) => {
      if (considerations.length <= 1) return;
      const considerationToDelete = considerations[index];
      if (considerationToDelete.id) {
          setDeletedConsiderationIds(prev => [...prev, considerationToDelete.id]);
      }
      setConsiderations(considerations.filter((_, i) => i !== index));
  };


  // --- API Handlers for Creatable Selects (Identical to Create form) ---
  const fetchParts = async () => {
    setLoadingPartName(true);
    try {
      const res = await axiosInstance.get("/work/getAllParts");
      const options = res.data.map(p => ({ label: p.partName, value: p.partId }));
      setPartNameOptions(options);
    } catch (err) {
      toast.error("Failed to load parts");
    } finally {
      setLoadingPartName(false);
    }
  };

  const handlePartNameCreate = async (inputValue) => {
    setLoadingPartName(true);
    try {
      const res = await axiosInstance.post(`/work/addPart/${inputValue}`);
      const newOption = { label: res.data.partName, value: res.data.partId };
      setPartNameOptions(prev => [...prev, newOption]);
      toast.success(`Added "${newOption.label}"`);
    } catch (err) {
      toast.error("Failed to add part");
    } finally {
      setLoadingPartName(false);
    }
  };

  const fetchMaterials = async () => {
    setLoadingMaterial(true);
    try {
      const res = await axiosInstance.get("/work/getAllMaterials");
      const options = res.data.map(m => ({ label: m.materialName, value: m.materialId }));
      setMaterialOptions(options);
    } catch (err) {
      toast.error("Failed to load materials");
    } finally {
      setLoadingMaterial(false);
    }
  };

  const handleMaterialCreate = async (inputValue) => {
    setLoadingMaterial(true);
    try {
      const res = await axiosInstance.post(`/work/addMaterial/${inputValue}`);
      const newOption = { label: res.data.materialName, value: res.data.materialId };
      setMaterialOptions(prev => [...prev, newOption]);
      toast.success(`Added "${newOption.label}"`);
    } catch (err) {
      toast.error("Failed to add material");
    } finally {
      setLoadingMaterial(false);
    }
  };

  const fetchThicknesses = async () => {
    setLoadingThickness(true);
    try {
      const res = await axiosInstance.get("/work/getAllThicknesses");
      const options = res.data.map(t => ({ label: t.thicknessName, value: t.thicknessId }));
      setThicknessOptions(options);
    } catch (err) {
      toast.error("Failed to load thicknesses");
    } finally {
      setLoadingThickness(false);
    }
  };

  const handleThicknessCreate = async (inputValue) => {
    setLoadingThickness(true);
    try {
      const res = await axiosInstance.post(`/work/addThickness/${inputValue}`);
      const newOption = { label: res.data.thicknessName, value: res.data.thicknessId };
      setThicknessOptions(prev => [...prev, newOption]);
      toast.success(`Added "${newOption.label}"`);
    } catch (err) {
      toast.error("Failed to add thickness");
    } finally {
      setLoadingThickness(false);
    }
  };


  // --- Calculation for Final Summary ---
  const grandSubtotal = partsData.reduce((acc, part) => {
    const partSubtotal = part.processes.reduce((pAcc, process) => {
      return pAcc + (parseFloat(process.toolCost) || 0);
    }, 0);
    return acc + partSubtotal;
  }, 0);

  const cgst = grandSubtotal * 0.09;
  const sgst = grandSubtotal * 0.09;
  const total = grandSubtotal + cgst + sgst;

  // --- Payload Generation and Update Handler ---
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      // If it's a new file, read it.
      if (file instanceof Blob) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          const base64String = reader.result.split(",")[1];
          resolve(base64String);
        };
        reader.onerror = (error) => reject(error);
      } else {
        // If it's an existing image URL (data:image/...), extract the base64 part.
        if (typeof file === 'string' && file.startsWith('data:')) {
          resolve(file.split(",")[1]);
        } else {
          resolve(null); // Or handle as an error
        }
      }
    });

  const handleUpdate = async () => {
      setIsUpdating(true);
      try {
          if (deletedPartIds.length > 0) {
              await axiosInstance.delete(`/sales/deleteQuotationPart`, { data: deletedPartIds });
          }
          if (deletedProcessIds.length > 0) {
              await axiosInstance.delete(`/sales/deleteQuotationPartProcess`, { data: deletedProcessIds });
          }
          if (deletedImageIds.length > 0) {
              await axiosInstance.delete(`/sales/deleteQuotationPartImages`, { data: deletedImageIds });
          }
          if (deletedConsiderationIds.length > 0) {
              await axiosInstance.delete(`/sales/deleteQuotationConsideration`, { data: deletedConsiderationIds });
          }
          // 1. Update Quotation Info
          const quotationInfoPayload = {
              quotationId,
              companyName, 
              contactPersonName: contactPerson, 
              address, 
              refrence: reference, 
              quotationDate,
              validDate: openTill, 
              quotationNumber: quotationNo, 
              supplierCode, 
              projectName, 
              email, 
              phone, 
              country, 
              state, 
              city, 
              zip,
              currency: currency ? currency.value : null, 
              status: status ? status.value : null, 
              assigned: assigned ? assigned.value : null,
          };
          await axiosInstance.put(`/sales/updateQuotationInfo`, quotationInfoPayload);

          // 2. Update Considerations
          const considerationsPayload = considerations.map(c => ({
              id: c.id, 
              titel: c.title, 
              description: c.description, 
              quotationId: c.quotationId || quotationId
          }));
          await axiosInstance.put(`/sales/updateQuotationConsideration`, considerationsPayload);

          // 3. Update Parts (including images)
          const partsPayload = await Promise.all(partsData.map(async (part) => ({
              quotationPartId: part.quotationPartId,
              quotationId: part.quotationId || quotationId,
              partName: part.partName ? part.partName.label : "",
              partNo: part.partNumber,
              material: part.material ? part.material.label : "",
              thickness: part.thickness ? part.thickness.label : "",
              partSize: part.partSize,
              partWeight: part.partWeight,
              partImagesWithId: await Promise.all(part.images.map(async (image) => ({
                  id: image.id,
                  base64Image: image.file ? await fileToBase64(image.file) : null
              })))
          })));
          const partsUpdateResponse = await axiosInstance.put(`/sales/updateQuotationParts`, partsPayload);
          const updatedPartsFromServer = partsUpdateResponse.data; 

          const partsDataWithNewIds = partsData.map((localPart, index) => {
              const serverPart = updatedPartsFromServer[index];
              if (serverPart && localPart.quotationPartId === null) {
                  return { ...localPart, quotationPartId: serverPart.quotationPartId };
              }
              return localPart;
          });

          // 4. Update Processes USING the new IDs
          const processesPayload = partsDataWithNewIds.flatMap((part) =>
              part.processes.map((proc) => ({
                  partProcessId: proc.partProcessId,
                  quotationPartId: proc.quotationPartId || part.quotationPartId, // This will now have the correct ID for new parts
                  toolConstruction: proc.toolConstruction, oprationNumber: proc.opNo, description: proc.description,
                  length: parseFloat(proc.l) || 0, width: parseFloat(proc.w) || 0, height: parseFloat(proc.h) || 0,
                  factor: parseFloat(proc.factor) || 0, rate: parseFloat(proc.rate) || 0, totalCost: parseFloat(proc.toolCost) || 0,
              }))
          ).filter(p => p.quotationPartId);
          
          if (processesPayload.length > 0) {
              await axiosInstance.put(`/sales/updateQuotationPartProcess`, processesPayload);
          }

          toast.success("Quotation updated successfully.");
          if (onSave) onSave();

      } catch (error) {
          console.error("Error updating quotation:", error.response ? error.response.data : error.message);
          toast.error("Failed to update quotation. See console for details.");
      } finally {
          setIsUpdating(false);
      }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <h4 className="ms-3">Loading Quotation...</h4>
      </div>
    );
  }

  return (
    <Card>
      <Card.Header className="quotation-header">
        <Card.Title>Edit Quotation</Card.Title>
      </Card.Header>
      <Card.Body className="quotation-body">
        <Container fluid>
          {/* Top Level Form Details */}
          <Row className="mb-3">
            <Col md={4}><Form.Group><Form.Label>Company Name <span className="text-danger">*</span></Form.Label><Form.Control type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} /></Form.Group></Col>
            <Col md={4}><Form.Group><Form.Label>Project Name <span className="text-danger">*</span></Form.Label><Form.Control type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} /></Form.Group></Col>
            <Col md={4}><Form.Group><Form.Label>Contact Person <span className="text-danger">*</span></Form.Label><Form.Control type="text" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} /></Form.Group></Col>
          </Row>
          <Row className="mb-3">
            <Col md={3}><Form.Group><Form.Label>Quotation No <span className="text-danger">*</span></Form.Label><Form.Control type="text" value={quotationNo} onChange={(e) => setQuotationNo(e.target.value)} /></Form.Group></Col>
            <Col md={3}><Form.Group><Form.Label>Supplier Code</Form.Label><Form.Control type="text" value={supplierCode} onChange={(e) => setSupplierCode(e.target.value)} /></Form.Group></Col>
            <Col md={3}><Form.Group><Form.Label>Quotation Date <span className="text-danger">*</span></Form.Label><Form.Control type="date" value={quotationDate} onChange={(e) => setQuotationDate(e.target.value)} /></Form.Group></Col>
            <Col md={3}><Form.Group><Form.Label>Open Till</Form.Label><Form.Control type="date" value={openTill} onChange={(e) => setOpenTill(e.target.value)} /></Form.Group></Col>
          </Row>
          <Row className="mb-3">
            <Col md={4}><Form.Group><Form.Label>Currency</Form.Label><Select options={currencyOptions} value={currency} onChange={setCurrency} placeholder="Select Currency" /></Form.Group></Col>
            <Col md={4}><Form.Group><Form.Label>Status <span className="text-danger">*</span></Form.Label><Select options={statusOptions} value={status} onChange={setStatus} placeholder="Select Status" /></Form.Group></Col>
            <Col md={4}><Form.Group><Form.Label>Assigned <span className="text-danger">*</span></Form.Label><Select options={assignedOptions} value={assigned} onChange={setAssigned} placeholder="Select Assigned" /></Form.Group></Col>
          </Row>
          <Row className="mb-3">
            <Col md={6}><Form.Group><Form.Label>Address <span className="text-danger">*</span></Form.Label><Form.Control as="textarea" rows={1} value={address} onChange={(e) => setAddress(e.target.value)} /></Form.Group></Col>
            <Col md={3}><Form.Group><Form.Label>Email <span className="text-danger">*</span></Form.Label><Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Form.Group></Col>
            <Col md={3}><Form.Group><Form.Label>Phone <span className="text-danger">*</span></Form.Label><Form.Control type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} /></Form.Group></Col>
          </Row>
          <Row className="mb-3">
            <Col md={3}><Form.Group><Form.Label>Country <span className="text-danger">*</span></Form.Label><Form.Control type="text" value={country} onChange={(e) => setCountry(e.target.value)} /></Form.Group></Col>
            <Col md={3}><Form.Group><Form.Label>State <span className="text-danger">*</span></Form.Label><Form.Control type="text" value={state} onChange={(e) => setState(e.target.value)} /></Form.Group></Col>
            <Col md={3}><Form.Group><Form.Label>City <span className="text-danger">*</span></Form.Label><Form.Control type="text" value={city} onChange={(e) => setCity(e.target.value)} /></Form.Group></Col>
            <Col md={3}><Form.Group><Form.Label>Zip <span className="text-danger">*</span></Form.Label><Form.Control type="text" value={zip} onChange={(e) => setZip(e.target.value)} /></Form.Group></Col>
          </Row>
          <Row className="mb-3">
            <Col md={12}><Form.Group><Form.Label>Reference</Form.Label><Form.Control as="textarea" rows={1} value={reference} onChange={(e) => setReference(e.target.value)} /></Form.Group></Col>
          </Row>
        </Container>
        <hr />

        {partsData.map((part, partIndex) => (
          <Card key={part.id} className="mb-4 section-card-shadow">
            <Card.Header className="d-flex justify-content-between align-items-center section-cart-header">
              <Button variant="danger" onClick={() => removePart(partIndex)} disabled={partsData.length <= 1} className="ms-auto">
                <FaTrash />
              </Button>
            </Card.Header>
            <Card.Body>
              <Container fluid>
                <Row className="mb-3 align-items-center">
                  <Col md={4}><Form.Group><Form.Label className="fw-bold">Part Number</Form.Label><Form.Control type="text" name="partNumber" value={part.partNumber} onChange={(e) => handlePartDataChange(partIndex, 'partNumber', e.target.value)} /></Form.Group></Col>
                  <Col md={4}><Form.Group><Form.Label className="fw-bold">Part Name</Form.Label><CreatableSelect name="partName" isClearable onMenuOpen={fetchParts} onChange={(s, a) => handlePartSelectChange(partIndex, s, a)} onCreateOption={handlePartNameCreate} options={partNameOptions} isLoading={loadingPartName} placeholder="Search or create..." value={part.partName} /></Form.Group></Col>
                  <Col md={4}><Form.Group><Form.Label className="fw-bold">Material</Form.Label><CreatableSelect name="material" isClearable onMenuOpen={fetchMaterials} onChange={(s, a) => handlePartSelectChange(partIndex, s, a)} onCreateOption={handleMaterialCreate} options={materialOptions} isLoading={loadingMaterial} placeholder="Search or create..." value={part.material} /></Form.Group></Col>
                </Row>

                <Row className="mb-3 align-items-center">
                  <Col md={4}><Form.Group><Form.Label className="fw-bold">Thickness</Form.Label><CreatableSelect name="thickness" isClearable onMenuOpen={fetchThicknesses} onChange={(s, a) => handlePartSelectChange(partIndex, s, a)} onCreateOption={handleThicknessCreate} options={thicknessOptions} isLoading={loadingThickness} placeholder="Search or create..." value={part.thickness} /></Form.Group></Col>
                  <Col md={4}><Form.Group><Form.Label className="fw-bold">Part Size</Form.Label><Form.Control type="text" name="partSize" value={part.partSize} onChange={(e) => handlePartDataChange(partIndex, 'partSize', e.target.value)} /></Form.Group></Col>
                  <Col md={4}><Form.Group><Form.Label className="fw-bold">Part Weight</Form.Label><Form.Control type="text" name="partWeight" value={part.partWeight} onChange={(e) => handlePartDataChange(partIndex, 'partWeight', e.target.value)} /></Form.Group></Col>
                </Row>
                <Row className="mb-3">
                  <Col>
                    <Form.Group>
                      <Form.Label className="fw-bold">Part View</Form.Label>
                      <div className="d-flex flex-wrap gap-3">
                        <div className="upload-box-qut" onClick={() => handleImageUploadClick(partIndex)}>
                          <div className="plus_symbol">+</div>
                          <p>Click to upload</p>
                        </div>
                        {part.images.map((img, imgIndex) => (
                          <div key={img.id || imgIndex} style={{ height: "120px", width: "120px", border: "1px solid #ccc", borderRadius: "8px", overflow: "hidden", position: "relative" }}>
                            <img src={img.url} alt={`Preview ${imgIndex}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            <Button variant="danger" size="sm" onClick={() => handleDeleteImage(partIndex, imgIndex)} style={{ position: 'absolute', top: '5px', right: '5px', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                              &times;
                            </Button>
                          </div>
                        ))}
                        <Form.Control type="file" ref={part.fileInputRef} onChange={(e) => handleFileChange(partIndex, e)} multiple style={{ display: "none" }} accept="image/*" />
                      </div>
                    </Form.Group>
                  </Col>
                </Row>
              </Container>
              <Container fluid>
                <Row className="mb-2 d-none d-md-flex text-center fw-bold fs-6">
                  <Col md={2}>Tool Construction</Col>
                  <Col md={1}>OP No</Col>
                  <Col md={2}>Description</Col>
                  <Col md={1}>L</Col>
                  <Col md={1}>W</Col>
                  <Col md={1}>H</Col>
                  <Col md={1}>Factor</Col>
                  <Col md={1}>Rate</Col>
                  <Col md={1}>Tool Cost</Col>
                  <Col md={1}>Action</Col>
                </Row>

                {part.processes.map((process, processIndex) => (
                  <Card key={process.id} className="mb-1">
                    <Card.Body className="p-3">
                      <Row className="align-items-center">
                        <Col xs={6} md={2}><Form.Group><Form.Label className="d-md-none fw-bold">Tool Construction</Form.Label><Form.Control type="text" name="toolConstruction" value={process.toolConstruction} onChange={(e) => handleProcessChange(partIndex, processIndex, e)} /></Form.Group></Col>
                        <Col xs={6} md={1}><Form.Group><Form.Label className="d-md-none fw-bold">OP No</Form.Label><Form.Control type="text" name="opNo" value={process.opNo} onChange={(e) => handleProcessChange(partIndex, processIndex, e)} /></Form.Group></Col>
                        <Col xs={12} md={2}><Form.Group><Form.Label className="d-md-none fw-bold">Description</Form.Label><Form.Control as="textarea" rows={1} name="description" value={process.description} onChange={(e) => handleProcessChange(partIndex, processIndex, e)} /></Form.Group></Col>
                        <Col xs={6} md={1}><Form.Group><Form.Label className="d-md-none fw-bold">L</Form.Label><Form.Control type="number" name="l" value={process.l} onChange={(e) => handleProcessChange(partIndex, processIndex, e)} /></Form.Group></Col>
                        <Col xs={6} md={1}><Form.Group><Form.Label className="d-md-none fw-bold">W</Form.Label><Form.Control type="number" name="w" value={process.w} onChange={(e) => handleProcessChange(partIndex, processIndex, e)} /></Form.Group></Col>
                        <Col xs={6} md={1}><Form.Group><Form.Label className="d-md-none fw-bold">H</Form.Label><Form.Control type="number" name="h" value={process.h} onChange={(e) => handleProcessChange(partIndex, processIndex, e)} /></Form.Group></Col>
                        <Col xs={6} md={1}><Form.Group><Form.Label className="d-md-none fw-bold">Factor</Form.Label><Form.Control type="number" name="factor" value={process.factor} onChange={(e) => handleProcessChange(partIndex, processIndex, e)} /></Form.Group></Col>
                        <Col xs={6} md={1}><Form.Group><Form.Label className="d-md-none fw-bold">Rate</Form.Label><Form.Control type="number" name="rate" value={process.rate} onChange={(e) => handleProcessChange(partIndex, processIndex, e)} /></Form.Group></Col>
                        <Col xs={6} md={1}><Form.Group><Form.Label className="d-md-none fw-bold">Tool Cost</Form.Label><Form.Control type="number" name="toolCost" value={process.toolCost} onChange={(e) => handleProcessChange(partIndex, processIndex, e)} /></Form.Group></Col>
                        <Col className="text-center">
                          <Button variant="outline-danger" size="sm" onClick={() => removeProcess(partIndex, processIndex)} disabled={part.processes.length <= 1}>
                            <FaTrash />
                          </Button>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                ))}
                <Row className="align-items-center">
                  {/* Spacer columns to push content to the right */}
                  <Col md={9} style={{ paddingLeft: '55px' }} className="text-end">
                    <strong style={{ fontSize: '1.1rem' }}>Sub Total:</strong>
                  </Col>
                  <Col md={3}>
                    <Form.Control
                      readOnly
                      disabled
                      className="fw-bold"
                      value={
                        part.processes.reduce((total, currentProcess) => {
                          return total + (parseFloat(currentProcess.toolCost) || 0);
                        }, 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
                      }
                    />
                  </Col>
                </Row>
                <Row>
                  <Col className="text-end mt-2">
                    <Button variant="success" size="sm" onClick={() => addProcess(partIndex)}>
                      <FaPlusCircle /> Add Process
                    </Button>
                  </Col>
                </Row>
              </Container>
            </Card.Body>
          </Card>
        ))}

        <Container fluid className="text-end">
          <Button variant="success" size="sm" onClick={addPart}>
            <FaPlusCircle /> Add Part
          </Button>
        </Container>

        <Container fluid className="mt-4">
          <Row className="justify-content-end ">
            <Col md={4}>
              <div className="p-3" style={{ border: '1px solid #dee2e6', borderRadius: '.25rem' }}>
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal</span>
                  <span className='fw-bold'>{grandSubtotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>CGST - 9.00%</span>
                  <span>{cgst.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>SGST - 9.00%</span>
                  <span>{sgst.toFixed(2)}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between fw-bold h5">
                  <span>Total</span>
                  <span>{total.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                </div>
              </div>
            </Col>
          </Row>
        </Container>

        <Container fluid className="mt-4">
          <Card>
            <Card.Header>
              <Card.Title as="h5">Quotation Considerations</Card.Title>
            </Card.Header>
            <Card.Body>
              {considerations.map((item, index) => (
                <Row key={item.id} className="mb-3 align-items-center">
                  <Col xs="auto" className="fw-bold">{index + 1}.</Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="d-md-none">Title</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Consideration title"
                        name="title"
                        value={item.title}
                        onChange={(e) => handleConsiderationChange(index, e)}
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group>
                      <Form.Label className="d-md-none">Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={1}
                        placeholder="Description"
                        name="description"
                        value={item.description}
                        onChange={(e) => handleConsiderationChange(index, e)}
                      />
                    </Form.Group>
                  </Col>
                  <Col xs="auto">
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => removeConsideration(index)}
                      disabled={considerations.length <= 1}
                    >
                      <FaTrash />
                    </Button>
                  </Col>
                </Row>
              ))}
              <div className="d-flex justify-content-end">
                <Button variant="success" size="sm" onClick={addConsideration}>
                  <FaPlusCircle className="me-2" /> Add More
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Container>

      </Card.Body>
      <Card.Footer className="text-end quotation-footer">
        <Button variant="outline-secondary" onClick={onCancel} className="me-2">Cancel</Button>
        <Button variant="primary" onClick={handleUpdate} disabled={isUpdating}>
            {isUpdating ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Updating...</> : 'Update Quotation'}
        </Button>
      </Card.Footer>
    </Card>
  );
};

export default EditQuotation;