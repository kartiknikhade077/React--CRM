import React, { useEffect, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import Select from "react-select";
import axiosInstance from "../../BaseComponet/axiosInstance";
import { toast } from "react-toastify";
import CreatableSelect from "react-select/creatable";

const EditMom = ({ onClose, onUpdate,momId }) => {

  
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
    const [momSections, setMomSections] = useState([]);

    const [nextSectionId, setNextSectionId] = useState(2); // Next section will be 's2'
    const [nextEntryId, setNextEntryId] = useState(2);     // Next entry will be 'e2'

    const createNewEntry = (id) => ({
        id,
        momEntryId:null,
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
    
    const fileToBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
        };
        reader.onerror = (error) => reject(error);
    });

    useEffect(() => {
        if (momId) {
            fetchMom();
        }
    }, [momId]);

    const fetchMom = async () => {
        try {
            const response = await axiosInstance.get(`/kickoff/getSingleMomById/${momId}`);
            const data = response.data;

            const { momInfo, momEntries } = data;
            
            // Populate main form fields
            setSelectedDate(momInfo.createdDate.split("T")[0]);
            setVenue(momInfo.venue);
            setIntroduction(momInfo.introduction);
            setThirdCompany(momInfo.thirdCompany);
            setRemark(momInfo.remark);

            // Populate select fields
            if (momInfo.customerName) setSelectedCustomer({ label: momInfo.customerName, value: momInfo.customerName });
            if (momInfo.projectName) setSelectedProject({ label: momInfo.projectName, value: momInfo.projectName });
            if (momInfo.itemNo) setSelectedItem({ label: momInfo.itemNo, value: momInfo.itemNo });

            if (momInfo.contactPersonName) {
                setContactPerson(momInfo.contactPersonName.split(',').map(name => ({ label: name.trim(), value: name.trim() })));
            }
            if (momInfo.employeeName && momInfo.employeeeId) {
                const employeeNames = momInfo.employeeName.split(',').map(name => name.trim());
                const employeeIds = momInfo.employeeeId.split(',').map(id => id.trim());
                setEmplyees(employeeNames.map((name, index) => ({ label: name, value: employeeIds[index] })));
            }
            if (momInfo.thirdPersonCompany) {
                const personsArray = momInfo.thirdPersonCompany.split(',')
                    .map(name => name.trim())
                    .filter(Boolean);
                setThirdCompanyPerson(personsArray.map(name => ({ value: name, label: name })));
            } else {
                setThirdCompanyPerson([]);
            }

            // Reconstruct momSections state
            let sId = 1;
            let eId = 1;
            const sectionsMap = new Map();

            momEntries.forEach(entry => {
                const woNumber = entry.workOrderNo;
                if (!sectionsMap.has(woNumber)) {
                    sectionsMap.set(woNumber, {
                        id: `s${sId++}`,
                        workOrderNumber: { label: woNumber, value: woNumber },
                        toolName: entry.tooleName,
                        entries: [],
                    });
                }
                
                const section = sectionsMap.get(woNumber);
                section.entries.push({
                    id: `e${eId++}`,
                    momEntryId: entry.momEntryId,
                    observation: entry.observation,
                    actionPlan: entry.details,
                    illustrations: entry.illustrationImages,
                    correctedImages: entry.correctedImages,
                    correctedPoints: entry.correctedPoints,
                    responsibleTarget: entry.responsibleAndTarget,
                });
            });
            
            setMomSections(Array.from(sectionsMap.values()));
            setNextSectionId(sId);
            setNextEntryId(eId);

        } catch (error) {
            console.error("Failed to fetch MOM data:", error);
            toast.error("Failed to fetch MOM data. Please try again.");
            if (onClose) onClose();
        }
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
                value: cp.name,
                label: cp.name
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


    const handleRemoveSection = async (sectionId) => {
        if (momSections.length <= 1) {
            toast.warn("At least one section is required.");
            return;
        }

        const sectionToRemove = momSections.find(sec => sec.id === sectionId);
        if (!sectionToRemove) return;

        const payload = {
            workOrderNo: sectionToRemove.workOrderNumber?.value,
            momEntryIds: sectionToRemove.entries.map(entry => entry.momEntryId).filter(Boolean)
        };

        console.log("Payload for removing section:", payload);

        if (payload.momEntryIds.length > 0) {
            try {
                setIsSaving(true); 
                await axiosInstance.delete('/kickoff/deleteBulkEntries', {data:payload}); 
                toast.success(`Section for WO# ${payload.workOrderNo} has been marked for deletion.`);
            } catch (error) {
                console.error("Failed to delete section:", error);
                toast.error("Failed to remove section. Please try again.");
                setIsSaving(false);
                return;
            } finally {
                setIsSaving(false);
            }
        }
        
        // If the API call is successful (or not needed), remove the section from the UI
        setMomSections(prevSections => prevSections.filter(sec => sec.id !== sectionId));
    };
    
    const handleSectionHeaderChange = (sectionId, fieldName, value) => {
        setMomSections(prevSections => 
            prevSections.map(sec => 
                sec.id === sectionId ? { ...sec, [fieldName]: value } : sec
            )
        );
    };

    const handleRemoveEntry = async (sectionId, entryId) => {
        // Find the section and entry objects from state
        const section = momSections.find(sec => sec.id === sectionId);
        if (!section) return;

        // Prevent removing the very last entry in a section
        if (section.entries.length <= 1) {
            toast.warn("Each section must have at least one entry.");
            return;
        }

        const entryToRemove = section.entries.find(entry => entry.id === entryId);
        if (!entryToRemove) return;

        // If the entry has a 'dbId', it exists in the database and we need to call the API.
        if (entryToRemove.momEntryId) {
            try {
                setIsSaving(true); // Disable buttons during the API call
                await axiosInstance.delete(`/kickoff/deleteSingleMOMEntries/${entryToRemove.momEntryId}`);
                toast.success("Entry removed successfully.");
            } catch (error) {
                console.error("Failed to delete entry:", error);
                toast.error("Failed to remove entry. Please try again.");
                setIsSaving(false); // Re-enable buttons on failure
                return; // IMPORTANT: Stop the function if the API call fails
            } finally {
                setIsSaving(false); // Re-enable buttons on success
            }
        }

        // If the API call was successful, or if it was a new entry (no dbId), update the UI state.
        setMomSections(prevSections =>
            prevSections.map(sec => {
                if (sec.id === sectionId) {
                    // Filter out the entry using its local frontend ID
                    const updatedEntries = sec.entries.filter(entry => entry.id !== entryId);
                    return { ...sec, entries: updatedEntries };
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
    
    const handleImageRemove = async (sectionId, entryId, fieldName, imageIndex) => {
        // Find the specific image to remove from the state
        const section = momSections.find(sec => sec.id === sectionId);
        const entry = section?.entries.find(ent => ent.id === entryId);
        const imageToRemove = entry?.[fieldName][imageIndex];

        if (!imageToRemove) return;
        if (imageToRemove.imageId) {
            try {
                setIsSaving(true);
                // Call the API to delete the image from the server
                await axiosInstance.delete(`/kickoff/deleteMOMImage/${imageToRemove.imageId}`);
                toast.success("Image removed successfully.");
            } catch (error) {
                console.error("Failed to delete image:", error);
                toast.error("Failed to remove image. Please try again.");
                setIsSaving(false);
                return; // Stop if the API fails
            } finally {
                setIsSaving(false);
            }
        }

        // If the API call was successful, or if it was a new file, update the UI
        setMomSections(prevSections =>
            prevSections.map(sec => {
                if (sec.id === sectionId) {
                    const updatedEntries = sec.entries.map(ent => {
                        if (ent.id === entryId) {
                            const updatedImages = ent[fieldName].filter((_, idx) => idx !== imageIndex);
                            return { ...ent, [fieldName]: updatedImages };
                        }
                        return ent;
                    });
                    return { ...sec, entries: updatedEntries };
                }
                return sec;
            })
        );
    };

    const handleUpdate = async () => {
        setIsSaving(true);
        try {
            // --- Task 1: Prepare Payload for MOM Info ---
            const momInfoPayload = {
                momId: momId,
                employeeeId: emplyees.map(emp => emp.value).join(","),
                customerName: selectedCustomer ? selectedCustomer.label : "",
                venue: venue,
                contactPersonName: contactPerson.map(cp => cp.label).join(","),
                employeeName: emplyees.map(emp => emp.label).join(","),
                projectName: selectedProject ? selectedProject.label : "",
                itemNo: selectedItem ? selectedItem.label : "",
                createdDate: selectedDate,
                introduction: introduction,
                thirdCompany: thirdCompany,
                thirdPersonCompany: thirdCompanyPerson.map(person => person.label).join(", "),
                remark: remark
            };

            // --- Task 2: Prepare Payload for MOM Entries ---
            const momEntriesPromises = momSections.flatMap(section =>
                section.entries.map(async (entry) => {
                    const processNewImages = async (images) => {
                        const newImagePromises = images
                            .filter(image => image instanceof File)
                            .map(file => fileToBase64(file));
                        return Promise.all(newImagePromises);
                    };
                    const [illustrationImages, correctedImages] = await Promise.all([
                        processNewImages(entry.illustrations),
                        processNewImages(entry.correctedImages),
                    ]);
                    return {
                        momEntryId: entry.momEntryId || null,
                        momId: momId,
                        workOrderNo: section.workOrderNumber?.label || "",
                        tooleName: section.toolName,
                        observation: entry.observation,
                        details: entry.actionPlan,
                        correctedPoints: entry.correctedPoints,
                        responsibleAndTarget: entry.responsibleTarget,
                        illustrationImages,
                        correctedImages,
                    };
                })
            );
            const momEntriesPayload = await Promise.all(momEntriesPromises);

            // --- Task 3: Execute Both API Calls in Parallel ---
            console.log("Updating MOM Info with payload:", momInfoPayload);
            console.log("Updating MOM Entries with payload:", momEntriesPayload);

            const updateInfoPromise = axiosInstance.put('/kickoff/updateMOMInfo', momInfoPayload);
            const updateEntriesPromise = axiosInstance.put('/kickoff/updateMOMEntry', momEntriesPayload);

            await Promise.all([updateInfoPromise, updateEntriesPromise]);

            toast.success('MOM has been updated successfully!');
            
            // Refresh the component with the latest data from the server
            await fetchMom();
            if (onUpdate) onUpdate(); // Notify parent component if needed
            if (onClose) onClose(); // Close modal on success

        } catch (error) {
            console.error("Failed to save changes:", error);
            toast.error(`Failed to save changes: ${error.response?.data?.message || "An error occurred."}`);
        } finally {
            setIsSaving(false);
        }
    };
    
    const selectedWoValues = momSections
        .map(sec => sec.workOrderNumber?.value)
        .filter(Boolean);

    // All other functions like handleDateChange remain the same.
    const handleDateChange = (event) => { setSelectedDate(event.target.value); };

  return (
    <div>
        <div className="form-container">
            <Row className="align-items-center">
                <Col>
                    <h3 className="form-header-title">Edit MOM</h3>
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
                        value={selectedCustomer} 
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
                </Row>

                {/* Row 3: Project and Item No */}
                <Row>
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
                                                    <img
                                                        src={image instanceof File ? URL.createObjectURL(image) : image.image}
                                                        alt={`preview ${idx}`}
                                                    />
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
                                                    <img
                                                        src={image instanceof File ? URL.createObjectURL(image) : image.image}
                                                        alt={`preview ${idx}`}
                                                    />
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
                    {/* <Button variant="primary" className="ms-2" onClick={handleUpdate} disabled={isSaving}>
                         {isSaving ? 'Updating...' : 'Update'}
                     </Button> */}
                     <Button 
                        variant="primary" 
                        className="ms-2" 
                        onClick={handleUpdate} 
                        disabled={isSaving}
                    >
                        {isSaving ? 'Updating...' : 'Update'}
                    </Button>
                </div>
        </div>
    </div>
  );
};

export default EditMom;
