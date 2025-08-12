import React, { useEffect, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import Select from "react-select";
import axiosInstance from "../../BaseComponet/axiosInstance";
import { toast } from "react-toastify";
import CreatableSelect from "react-select/creatable";

const CreateMom = ({ onClose, onSave }) => {

    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]); // Default to today's date
    const [customerOptions, setCustomerOptions] = useState([]);
    const [isCustomerLoading, setIsCustomerLoading] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [projectOptions, setProjectOptions] = useState([]);
    const [isProjectLoading, setIsProjectLoading] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [contactPerson, setContactPerson] = useState([]);
    const [contactPersonOptions, setContactPersonOptions] = useState([]);
    const [isContactPersonLoading, setIsContactPersonLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isItemLoading, setIsItemLoading] = useState(false);
    const [itemOptions, setItemOptions] = useState([]);
    const [emplyeeOptions, setEmployeeOptions] = useState([]);
    const [isEmployeeLoading, setIsEmployeeLoading] = useState(false);
    const [emplyees, setEmplyees] = useState([]);
    const [venue, setVenue] = useState("");
    const [introduction, setIntroduction] = useState("");
    const [thirdCompany, setThirdCompany] = useState("");
    const [thirdCompanyPerson, setThirdCompanyPerson] = useState([]);
    const [workOrderNumberOptions, setWorkOrderNumberOptions] = useState([]);
    const [isWorkOrderLoading, setIsWorkOrderLoading] = useState(false);
    const [remark, setRemark] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const [nextSectionId, setNextSectionId] = useState(2); // Next section will be 's2'
    const [nextEntryId, setNextEntryId] = useState(2);     // Next entry will be 'e2'

    // This helper function still just takes an ID, which will now be a string.
    const createNewEntry = (id) => ({
        id,
        observation: '',
        actionPlan: '',
        illustrations: [],
        correctedImages: [],
        correctedPoints: '',
        responsibleTarget: '',
    });

    const createNewSection = (sectionId, firstEntryId) => ({
        id: sectionId,
        workOrderNumber: null,
        toolName: '',
        entries: [createNewEntry(firstEntryId)],
    });

    const [momSections, setMomSections] = useState([
        {
            id: 's1',
            workOrderNumber: null,
            toolName: '',
            entries: [
                {
                    id: 'e1',
                    observation: '',
                    actionPlan: '',
                    illustrations: [],
                    correctedImages: [],
                    correctedPoints: '',
                    responsibleTarget: '',
                }
            ],
        }
    ]);
    
    const fileToBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // The result includes a prefix like "data:image/png;base64,", we only need the part after the comma.
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
        };
        reader.onerror = (error) => reject(error);
    });

    const selectedWoValues = momSections
        .map(sec => sec.workOrderNumber?.value)
        .filter(Boolean);
    
    const handleDateChange = (event) => {
        setSelectedDate(event.target.value);
        console.log("Date selected:", event.target.value); 
    };

    const fetchCustomers = async () => {
        try {
            setIsCustomerLoading(true);
            const response = await axiosInstance.get("/customer/getCustomerList");
            const data = response.data;

            const options = data.map(c => ({
                value: c.id,
                label: c.companyName,
                fullData: c
            }));

            setCustomerOptions(options);
            setIsCustomerLoading(false);
        } catch (error) {
            toast.error("Failed to fetch customers:", error);
            setIsCustomerLoading(false);
        }
    };

    const fetchContactPersons = async () => {
        try {
            if(!selectedCustomer) {
                toast.error("Please select a customer first.");
                return;
            }
            const customerId = selectedCustomer.fullData.id;
            setIsContactPersonLoading(true);
            const response = await axiosInstance.get(`/customer/getContacts/${customerId}`);
            const data = response.data;
            const options = data.map(cp => ({
                value: cp.id,
                label: cp.name,
                fullData: cp
            }));
            setContactPersonOptions(options);
            setIsContactPersonLoading(false);
        } catch (error) {
            toast.error("Failed to fetch contact persons:", error);
            setIsContactPersonLoading(false);
        }
    };

    const fetchProjects = async () => {
        try {
            if(!selectedCustomer) {
                toast.error("Please select a customer first.");
                return;
            }

            const customerId = selectedCustomer.fullData.id;
            setIsProjectLoading(true);
            const response = await axiosInstance.get(`/project/getProjectByCustomerId/${customerId}`);
            const data = response.data;

            const options = data.map(p => ({
            value: p.projectId,
            label: p.projectName,
            fullData: p
            }));

            setProjectOptions(options);
            setIsProjectLoading(false);
        } catch (error) {
            toast.error("Failed to fetch customers:", error);
            setIsProjectLoading(false);
        }
    };

    const fetchItem = async () => {
        try {
            if(!selectedProject) {
                toast.error("Please select a customer first.");
                return;
            }

            const projectId = selectedProject.fullData.projectId;
            setIsItemLoading(true);
            const response = await axiosInstance.get(`/kickoff/getItemNoByProjectId/${projectId}`);
            const data = response.data;

            const options = data.map(item => ({
                value: item,
                label: item
            }));

            setItemOptions(options);
            setIsItemLoading(false);
        } catch (error) {
            toast.error("Failed to fetch customers:", error);
            setIsItemLoading(false);
        }
    };

    const fetchEmployee = async () => {
        try {
            if(!selectedProject) {
                toast.error("Please select a project first.");
                return;
            } 
            const projectId = selectedProject.fullData.projectId;
            setIsEmployeeLoading(true);
            const response = await axiosInstance.get(`/project/getEmployeesbyProjectId/${projectId}`);
            const data = response.data;
            const options = data.map(emp => ({
                value: emp.employeeId,
                label: emp.employeeName
            }));
            setEmployeeOptions(options);
            setIsEmployeeLoading(false);
        } catch (error) {
            toast.error("Failed to fetch employees:", error);
            setIsEmployeeLoading(false);
        }
    };

    const fetchWorkOrderNumbers = async () => {
        try {
            if(!selectedItem) {
                toast.error("Please select an item first.");
                return;
            }
            const itemNo = selectedItem.label;
            setIsWorkOrderLoading(true);
            const response = await axiosInstance.get(`/kickoff/getWorkOrderNumberByItemNo/${itemNo}`);
            const data = response.data;
            const options = data.map(wo => ({
                value: wo,
                label: wo
            }));
            setWorkOrderNumberOptions(options);
            setIsWorkOrderLoading(false);
        } catch (error) {
            toast.error("Failed to fetch work order numbers:", error);
            setIsWorkOrderLoading(false);
        }
    };


    const handleAddSection = () => {
        // Construct the string IDs
        const newSectionIdStr = `s${nextSectionId}`;
        const newEntryIdStr = `e${nextEntryId}`;
        
        const newSection = createNewSection(newSectionIdStr, newEntryIdStr);
        
        setMomSections(prevSections => [...prevSections, newSection]);
        
        // Increment both counters for the next use
        setNextSectionId(prev => prev + 1);
        setNextEntryId(prev => prev + 1);
    };

    const handleAddEntry = (sectionId) => {
        // Construct the string ID for the new entry
        const newEntryIdStr = `e${nextEntryId}`;
        const newEntry = createNewEntry(newEntryIdStr);

        setMomSections(prevSections =>
            prevSections.map(sec => {
                if (sec.id === sectionId) {
                    return { ...sec, entries: [...sec.entries, newEntry] };
                }
                return sec;
            })
        );
        // Increment only the entry counter
        setNextEntryId(prev => prev + 1);
    };


    const handleRemoveSection = (sectionId) => {
        if (momSections.length <= 1) return;
        setMomSections(prevSections => prevSections.filter(sec => sec.id !== sectionId));
    };
    
    const handleSectionHeaderChange = (sectionId, fieldName, value) => {
        setMomSections(prevSections => 
            prevSections.map(sec => 
                sec.id === sectionId ? { ...sec, [fieldName]: value } : sec
            )
        );
    };

    const handleRemoveEntry = (sectionId, entryId) => {
        setMomSections(prevSections =>
            prevSections.map(sec => {
                if (sec.id === sectionId) {
                    if (sec.entries.length <= 1) return sec;
                    return { ...sec, entries: sec.entries.filter(entry => entry.id !== entryId) };
                }
                return sec;
            })
        );
    };

    const handleInputChange = (sectionId, entryId, event) => {
        const { name, value } = event.target;
        setMomSections(prevSections =>
            prevSections.map(sec => {
                if (sec.id === sectionId) {
                    const updatedEntries = sec.entries.map(entry =>
                        entry.id === entryId ? { ...entry, [name]: value } : entry
                    );
                    return { ...sec, entries: updatedEntries };
                }
                return sec;
            })
        );
    };

    const handleImageChange = (sectionId, entryId, event, fieldName) => {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;
        setMomSections(prevSections =>
            prevSections.map(sec => {
                if (sec.id === sectionId) {
                    const updatedEntries = sec.entries.map(entry => {
                        if (entry.id === entryId) {
                            return { ...entry, [fieldName]: [...entry[fieldName], ...files] };
                        }
                        return entry;
                    });
                    return { ...sec, entries: updatedEntries };
                }
                return sec;
            })
        );
        event.target.value = null;
    };

    const handleImageRemove = (sectionId, entryId, fieldName, imageIndex) => {
        setMomSections(prevSections =>
            prevSections.map(sec => {
                if (sec.id === sectionId) {
                    const updatedEntries = sec.entries.map(entry => {
                        if (entry.id === entryId) {
                            const updatedImages = entry[fieldName].filter((_, idx) => idx !== imageIndex);
                            return { ...entry, [fieldName]: updatedImages };
                        }
                        return entry;
                    });
                    return { ...sec, entries: updatedEntries };
                }
                return sec;
            })
        );
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Step 1: Prepare the momInfo part of the payload (synchronous)
            const contactPersonNames = contactPerson.map(cp => cp.label).join(", ");
            const employeeNames = emplyees.map(emp => emp.label).join(", ");
            const emplyeeIds = emplyees.map(emp => emp.value).join(", ");
            const thirdCompanyPersons = thirdCompanyPerson.map(person => person.label).join(", ");
            
            const momInfo = {
                employeeeId: emplyeeIds,
                customerName: selectedCustomer ? selectedCustomer.label : "",
                customerId: selectedCustomer ? selectedCustomer.value : "",
                venue: venue,
                contactPersonName: contactPersonNames,
                employeeName: employeeNames,
                projectName: selectedProject ? selectedProject.label : "",
                projectId: selectedProject ? selectedProject.value : "",
                itemNo: selectedItem ? selectedItem.label : "",
                createdDate: selectedDate,
                introduction: introduction,
                thirdCompany: thirdCompany,
                thirdPersonCompany: thirdCompanyPersons,
                remark: remark,
            };

            // Step 2: Prepare the momEntries part of the payload (asynchronous due to image conversion)
            const momEntriesPromises = momSections.flatMap(section =>
                section.entries.map(async (entry) => {
                    // Convert all images to Base64 in parallel for efficiency
                    const illustrationPromises = entry.illustrations.map(fileToBase64);
                    const correctedImagePromises = entry.correctedImages.map(fileToBase64);

                    const [illustrationImages, correctedImages] = await Promise.all([
                        Promise.all(illustrationPromises),
                        Promise.all(correctedImagePromises),
                    ]);

                    return {
                        workOrderNo: section.workOrderNumber ? section.workOrderNumber.label : "",
                        tooleName: section.toolName, // Using correct key 'toolName'
                        observation: entry.observation,
                        details: entry.actionPlan,
                        correctedPoints: entry.correctedPoints,
                        responsibleAndTarget: entry.responsibleTarget, // Using correct key
                        illustrationImages, // Array of base64 strings
                        correctedImages,    // Array of base64 strings
                    };
                })
            );

            const momEntries = await Promise.all(momEntriesPromises);
            const payload = {
                momInfo,
                momEntries,
            };

            await axiosInstance.post('/kickoff/createMOM', payload);
            
            toast.success("MOM created successfully!");

            if (onSave) onSave();
            if (onClose) onClose();

        } catch (error) {
            console.error("Failed to create MOM:", error);
            const errorMessage = error.response?.data?.message || "An unexpected error occurred.";
            toast.error(`Failed to create MOM: ${errorMessage}`);
        } finally {
            // Step 5: Re-enable the save button
            setIsSaving(false);
        }
    };

    


    
  return (
    <div>
        <div className="form-container">
            <Row className="align-items-center">
                <Col>
                    <h3 className="form-header-title">Create MOM</h3>
                </Col>
            </Row>

            <hr className="form-divider" />

            <Container fluid>
                {/* Row 1: Company and Venue */}
                <Row>
                <Col md={6}>
                    <div className="form-group">
                    <label>Customer Name <span className="required-label">*</span></label>
                    <Select 
                        options={customerOptions} 
                        onChange={(selectedOption) => setSelectedCustomer(selectedOption)}
                        placeholder="Select a customer..."
                        isClearable
                        isLoading={isCustomerLoading}
                        onMenuOpen={fetchCustomers}
                    />
                    </div>
                </Col>
                <Col md={6}>
                    <div className="form-group">
                    <label>Venue <span className="required-label">*</span></label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Enter venue"
                        value={venue}
                        onChange={(e) => setVenue(e.target.value)}
                        />

                    </div>
                </Col>
                </Row>

                {/* Row 2: Contact Persons and Staff */}
                <Row>
                <Col md={6}>
                    <div className="form-group">
                    <label>Contact Persons <span className="required-label">*</span></label>
                    <Select 
                        options={contactPersonOptions} 
                        placeholder="Select contact persons..." 
                        isMulti
                        isLoading={isContactPersonLoading}
                        onMenuOpen={fetchContactPersons}
                        isDisabled={!selectedCustomer}
                        value={contactPerson}
                        onChange={(selectedOption)=> setContactPerson(selectedOption)}
                    />
                    </div>
                </Col>
                <Col md={6}>
                    <div className="form-group">
                    <label>Project <span className="required-label">*</span></label>
                    <Select
                        options={projectOptions}
                        value={selectedProject}
                        onChange={(selectedOption) => setSelectedProject(selectedOption)}
                        placeholder="Select a project..."
                        isClearable
                        onMenuOpen={fetchProjects}
                        isLoading={isProjectLoading}
                        isDisabled={!selectedCustomer}
                    />
                    </div>
                </Col>
                </Row>

                {/* Row 3: Project and Item No */}
                <Row>
                <Col md={6}>
                    <div className="form-group">
                        <label>Employee <span className="required-label">*</span></label>
                        <Select 
                            options={emplyeeOptions} 
                            placeholder="Select employee..." 
                            isMulti
                            isLoading={isEmployeeLoading}
                            onMenuOpen={fetchEmployee}
                            isDisabled={!selectedProject}
                            value={emplyees}
                            onChange={(selectedOption)=> setEmplyees(selectedOption)}
                        />
                    
                    </div>
                </Col>
                <Col md={6}>
                    <div className="form-group">
                        <label>Item no <span className="required-label">*</span></label>
                        <Select
                            options={itemOptions}
                            value={selectedItem}
                            onChange={(selectedOption) => setSelectedItem(selectedOption)}
                            placeholder="Select a item..."
                            isClearable
                            onMenuOpen={fetchItem}
                            isLoading={isItemLoading}
                            isDisabled={!selectedProject}
                        />
                    </div>
                </Col>
                </Row>
                
                {/* Row 4: Date and Introduction */}
                <Row>
                    <Col md={6}>
                        <div className="form-group">
                            <label>Date <span className="required-label">*</span></label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={handleDateChange}
                                className="form-control"
                            />
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="form-group">
                        <label>Introduction</label>
                        <textarea 
                            className="form-control" 
                            rows="3" 
                            placeholder="Enter Introduction"
                            value={introduction}
                            onChange={(e) => setIntroduction(e.target.value)}
                        >
                        </textarea>
                        </div>
                    </Col>
                </Row>

                {/* Row 5: Third Company and Third Company Person */}
                <Row>
                    <Col md={6}>
                        <div className="form-group">
                            <label>Third Company</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Enter Company Name"
                                value={thirdCompany}
                                onChange={(e) => setThirdCompany(e.target.value)}
                            />
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="form-group">
                            <label>Third Company Person</label>
                            <CreatableSelect
                                isMulti
                                value={thirdCompanyPerson}
                                onChange={(newValue) => setThirdCompanyPerson(newValue || [])}
                                placeholder="Type names and press Enter..."
                                noOptionsMessage={() => 'Type a name and press Enter to add'}
                            />
                        </div>
                    </Col>
                </Row>

            </Container>
            <hr className="form-divider mt-4" />
            {momSections.map((section, sectionIndex) => (
                    <div key={section.id} className="mec-container mt-4">
                        <div className="mec-header-bar">
                            <Button 
                                variant="outline-danger"
                                onClick={() => handleRemoveSection(section.id)} 
                                disabled={momSections.length <= 1}>
                                    Remove Section
                            </Button>
                        </div>

                        <div className="mec-form-header">
                            <div className="mec-form-group">
                                <label>WO No *</label>
                                <Select
                                    options={workOrderNumberOptions.map(option => ({
                                        ...option,
                                        isDisabled: selectedWoValues.includes(option.value) && option.value !== section.workOrderNumber?.value
                                    }))}
                                    value={section.workOrderNumber}
                                    onChange={(selectedOption) => handleSectionHeaderChange(section.id, 'workOrderNumber', selectedOption)}
                                    placeholder="Select workorder..."
                                    isClearable
                                    onMenuOpen={fetchWorkOrderNumbers}
                                    isLoading={isWorkOrderLoading}
                                    isDisabled={!selectedItem}
                                />
                            </div>
                            <div className="mec-form-group">
                                <label>Tool Name *</label>
                                <input
                                    type="text"
                                    placeholder="Tool Name"
                                    value={section.toolName}
                                    onChange={(e) => handleSectionHeaderChange(section.id, 'toolName', e.target.value)}
                                    className="form-control"
                                />
                            </div>
                        </div>

                        <div className="mec-entries-section">
                            <h4>MOM Entries</h4>
                            <div className="mec-grid mec-grid--header">
                                <div className="mec-grid-cell mec-grid-cell--header">#</div>
                                <div className="mec-grid-cell mec-grid-cell--header">Observation *</div>
                                <div className="mec-grid-cell mec-grid-cell--header">Detail/Action Plan</div>
                                <div className="mec-grid-cell mec-grid-cell--header">Illustration</div>
                                <div className="mec-grid-cell mec-grid-cell--header">Corrected Image</div>
                                <div className="mec-grid-cell mec-grid-cell--header">Corrected Points</div>
                                <div className="mec-grid-cell mec-grid-cell--header">Responsible & Target</div>
                                <div className="mec-grid-cell mec-grid-cell--header">Action</div>
                            </div>

                            {section.entries.map((entry, entryIndex) => (
                                <div key={entry.id} className="mec-grid mec-grid--entry-row">
                                    <div className="mec-grid-cell mec-grid-cell--index">{entryIndex + 1}</div>
                                    <div className="mec-grid-cell">
                                        <textarea name="observation" placeholder="Enter observation" value={entry.observation} onChange={(e) => handleInputChange(section.id, entry.id, e)} />
                                    </div>
                                    <div className="mec-grid-cell">
                                        <textarea name="actionPlan" placeholder="Enter detail or action plan" value={entry.actionPlan} onChange={(e) => handleInputChange(section.id, entry.id, e)} />
                                    </div>
                                    <div className="mec-grid-cell">
                                        <div className="mec-image-upload-container">
                                            {entry.illustrations.map((image, idx) => (
                                                <div key={idx} className="mec-image-preview">
                                                    <img src={URL.createObjectURL(image)} alt={`preview ${idx}`} />
                                                    <button type="button" className="mec-remove-image-btn" onClick={() => handleImageRemove(section.id, entry.id, 'illustrations', idx)}>&times;</button>
                                                </div>
                                            ))}
                                            <label className="mec-upload-button">
                                                <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImageChange(section.id, entry.id, e, 'illustrations')} />
                                                <span className="mec-upload-icon">+</span>
                                                {entry.illustrations.length > 0 ? 'Add More' : 'Illustration'}
                                            </label>
                                        </div>
                                    </div>
                                    <div className="mec-grid-cell">
                                        <div className="mec-image-upload-container">
                                            {entry.correctedImages.map((image, idx) => (
                                                <div key={idx} className="mec-image-preview">
                                                    <img src={URL.createObjectURL(image)} alt={`preview ${idx}`} />
                                                    <button type="button" className="mec-remove-image-btn" onClick={() => handleImageRemove(section.id, entry.id, 'correctedImages', idx)}>&times;</button>
                                                </div>
                                            ))}
                                            <label className="mec-upload-button">
                                                <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImageChange(section.id, entry.id, e, 'correctedImages')} />
                                                <span className="mec-upload-icon">+</span>
                                                {entry.correctedImages.length > 0 ? 'Add More' : 'Corrected'}
                                            </label>
                                        </div>
                                    </div>
                                    <div className="mec-grid-cell">
                                        <textarea  name="correctedPoints" placeholder="Enter corrected points" value={entry.correctedPoints} onChange={(e) => handleInputChange(section.id, entry.id, e)}/>
                                    </div>
                                    <div className="mec-grid-cell">
                                        <textarea  name="responsibleTarget" placeholder="Enter responsible person and target" value={entry.responsibleTarget} onChange={(e) => handleInputChange(section.id, entry.id, e)}/>
                                    </div>
                                    <div className="mec-grid-cell mec-grid-cell--action">
                                        <button className="mec-delete-btn" onClick={() => handleRemoveEntry(section.id, entry.id)} disabled={section.entries.length <= 1}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mec-footer-actions">
                            <Button variant="primary" onClick={() => handleAddEntry(section.id)}>+ Add Entry</Button>
                        </div>
                    </div>
                ))}
                
                <div className="d-flex mt-4 justify-content-end">
                    <Button variant="success" onClick={handleAddSection}>
                        Add More Section
                    </Button>
                </div>

                <hr className="form-divider mt-4" />
                <Container fluid className="mt-2">
                    <Row>
                        <Col>
                            <div className="form-group">
                                <label>Remark</label>
                                <textarea
                                    className="form-control"
                                    rows="4"
                                    placeholder="Enter remark"
                                    value={remark}
                                    onChange={(e) => setRemark(e.target.value)}
                                />
                            </div>
                        </Col>
                    </Row>
                </Container>
                <div className="d-flex justify-content-end mt-4">
                    <Button variant="secondary" className="me-2" onClick={onClose}>Close</Button>
                    <Button variant="primary" className="ms-2" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                </div>
        </div>
    </div>
  );
};

export default CreateMom;
