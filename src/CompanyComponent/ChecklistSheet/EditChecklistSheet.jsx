import React, { useEffect, useMemo, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import "./CreateChecklistSheet.css"; // Assuming you might have styles here
import Select from "react-select";
import axiosInstance from "../../BaseComponet/axiosInstance";
import { toast } from "react-toastify";

const EditChecklistSheet = ({ onClose, onUpdate, checkListId }) => {
    // State for form fields - now using state for all inputs
    const [revNo, setRevNo] = useState("");
    const [partDetails, setPartDetails] = useState("");
    const [toolDetails, setToolDetails] = useState("");
    const [designStartDate, setDesignStartDate] = useState("");
    const [designEndDate, setDesignEndDate] = useState("");
    const [pocketMCReleaseDate, setPocketMCReleaseDate] = useState("");
    const [finalMCReleaseDate, setFinalMCReleaseDate] = useState("");

    // State for dropdown options
    const [customerOptions, setCustomerOptions] = useState([]);
    const [projectOptions, setProjectOptions] = useState([]);
    const [designerOptions, setDesignerOptions] = useState([]);
    const [woNoOptions, setWoNoOptions] = useState([]);

    // State for selected dropdown values
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedDesigner, setSelectedDesigner] = useState(null);
    const [selectedWoNo, setSelectedWoNo] = useState(null);
    
    // State for loading indicators
    const [isCustomerLoading, setIsCustomerLoading] = useState(false);
    const [isProjectLoading, setIsProjectLoading] = useState(false);
    const [isDesignerLoading, setIsDesignerLoading] = useState(false);
    const [isWoNoLoading, setIsWoNoLoading] = useState(false);
    const [isPageLoading, setIsPageLoading] = useState(true); // For initial data fetch

    // State for the checklist structure and user selections
    const [checklistData, setChecklistData] = useState([]);
    const [checklistSelections, setChecklistSelections] = useState({});

    const [savedChecklistItems, setSavedChecklistItems] = useState([]);

    const checkOptions = [
        { value: "N/A", label: "N/A" },
        { value: "Yes", label: "Yes" },
        { value: "No", label: "No" }
    ];

    const savedItemsMap = useMemo(() => {
        const map = new Map();
        savedChecklistItems.forEach(item => {
            const compositeKey = `${item.categoryType}::${item.checkListItem}`;
            map.set(compositeKey, item);
        });
        return map;
    }, [savedChecklistItems]);

    // Main useEffect to fetch and populate the entire form based on checkListId
    useEffect(() => {
        if (checkListId) {
            fetchAndPopulateChecklistData();
        }
    }, [checkListId]);

    // This useEffect populates dependent dropdowns when their parent changes
    useEffect(() => {
        if (selectedCustomer) fetchProjects();
        else setProjectOptions([]); // Clear options if customer is cleared
    }, [selectedCustomer]);
    
    useEffect(() => {
        if (selectedProject) fetchDesigners();
        else setDesignerOptions([]);
    }, [selectedProject]);

    useEffect(() => {
        if (selectedDesigner) fetchWoNo();
        else setWoNoOptions([]);
    }, [selectedDesigner]);


    const fetchAndPopulateChecklistData = async () => {
        setIsPageLoading(true);
        try {
            // STEP 1: Fetch the existing checklist data
            // NOTE: Replace '/kickoff/getCheckListById/${checkListId}' with your actual endpoint
            const response = await axiosInstance.get(`/kickoff/getCheckListData/${checkListId}`);
            const data = response.data;
            const { checkListInfo, checkListItemsList } = data;

            setSavedChecklistItems(checkListItemsList || []);

            // STEP 2: Populate the form fields with the fetched data
            // Populate simple text and date inputs
            setRevNo(checkListInfo.revisionNumber || "");
            setPartDetails(checkListInfo.partDetials || "");
            setToolDetails(checkListInfo.toolDetails || "");
            setDesignStartDate(checkListInfo.designStartDate?.split('T')[0] || "");
            setDesignEndDate(checkListInfo.designEndDate?.split('T')[0] || "");
            setPocketMCReleaseDate(checkListInfo.pocketMCReleaseDate?.split('T')[0] || "");
            setFinalMCReleaseDate(checkListInfo.finalMCReleaseDate?.split('T')[0] || "");

            // Populate dropdowns. We create the {value, label} object to set the Select component's value.
            // We also pre-fetch options for all dropdowns to ensure they are available.
            await fetchCustomers(checkListInfo.customerName);
            setSelectedCustomer({ value: checkListInfo.customerId, label: checkListInfo.customerName });

            await fetchProjects(checkListInfo.customerId, checkListInfo.projectName);
            setSelectedProject({ value: checkListInfo.projectId, label: checkListInfo.projectName });

            await fetchDesigners(checkListInfo.projectId, checkListInfo.designerName);
            setSelectedDesigner({ value: checkListInfo.employeeId, label: checkListInfo.designerName });
            
            await fetchWoNo(checkListInfo.employeeId, checkListInfo.workOrderNumber);
            setSelectedWoNo({ value: checkListInfo.workOrderNumber, label: checkListInfo.workOrderNumber });

            // STEP 3: Fetch the checklist template (categories and all items)
            await fetchChecklistTemplateAndSetSelections(checkListItemsList);

        } catch (error) {
            toast.error("Failed to fetch checklist data. Please try again.");
            console.error(error);
        } finally {
            setIsPageLoading(false);
        }
    };

    const fetchChecklistTemplateAndSetSelections = async (savedItems) => {
        try {
            console.log("Fetching data...",savedItems);
            const response = await axiosInstance.get("/kickoff/getCheckListCategoryAndItem");
            const templateData = response.data;
            console.log("Fetched checklist template data:", templateData);

            // Group template data by categoryType
            const groupedData = templateData.reduce((acc, item) => {
                const category = item.categoryType;
                if (!acc[category]) acc[category] = [];
                acc[category].push({
                    description: item.checkListItem,
                    itemId: item.itemId
                });
                return acc;
            }, {});

            const transformedData = Object.keys(groupedData).map(categoryName => {
                const items = groupedData[categoryName]
                    .sort((a, b) => a.itemId.localeCompare(b.itemId)) // Optional: any order before assigning srNo
                    .map((item, index) => ({
                        ...item,
                        srNo: index + 1  // Assign srNo starting from 1
                    }));

                return {
                    categoryName,
                    items
                };
            });

            setChecklistData(transformedData);

            const savedItemsMap = new Map();
            savedItems.forEach(item => {
                const compositeKey = `${item.categoryType}::${item.checkListItem}`;
                savedItemsMap.set(compositeKey, item);
            });

            const newSelections = {};
            transformedData.forEach(category => {
                category.items.forEach(templateItem => {
                    const lookupKey = `${category.categoryName}::${templateItem.description}`;
                    const savedItem = savedItemsMap.get(lookupKey);

                    if (savedItem) {
                        newSelections[templateItem.itemId] = {
                            designerCheck: checkOptions.find(opt => opt.value === savedItem.checkByDesigner) || null,
                            tlCheck: checkOptions.find(opt => opt.value === savedItem.checkByTeamLead) || null
                        };
                    } else {
                        newSelections[templateItem.itemId] = {
                            designerCheck: checkOptions.find(opt => opt.value === "N/A"),
                            tlCheck: checkOptions.find(opt => opt.value === "N/A")
                        };
                    }
                });
            });
            
            setChecklistSelections(newSelections);

        } catch (error) {
            toast.error("Failed to fetch checklist template.");
            console.error(error);
        }
    };
    
    const fetchCustomers = async (preselectedLabel = null) => {
        setIsCustomerLoading(true);
        try {
            const response = await axiosInstance.get("/customer/getCustomerList");
            const options = response.data.map(c => ({ value: c.id, label: c.companyName, fullData: c }));
            setCustomerOptions(options);
            if (preselectedLabel) {
                 setSelectedCustomer(options.find(o => o.label === preselectedLabel));
            }
        } catch (error) {
            toast.error("Failed to fetch customers.");
        } finally {
            setIsCustomerLoading(false);
        }
    };

    const fetchProjects = async (customerId = selectedCustomer?.value, preselectedLabel = null) => {
        if (!customerId) return;
        setIsProjectLoading(true);
        try {
            const response = await axiosInstance.get(`/project/getProjectByCustomerId/${customerId}`);
            const options = response.data.map(p => ({ value: p.projectId, label: p.projectName, fullData: p }));
            setProjectOptions(options);
            if (preselectedLabel) {
                setSelectedProject(options.find(o => o.label === preselectedLabel));
            }
        } catch (error) {
            toast.error("Failed to fetch projects."); // Corrected error message
        } finally {
            setIsProjectLoading(false);
        }
    };

    const fetchDesigners = async (projectId = selectedProject?.value, preselectedLabel = null) => {
        if (!projectId) return;
        setIsDesignerLoading(true);
        try {
            const response = await axiosInstance.get(`/project/getEmployeesbyProjectId/${projectId}`);
            const options = response.data.map(d => ({ value: d.employeeId, label: d.employeeName, fullData: d }));
            setDesignerOptions(options);
             if (preselectedLabel) {
                setSelectedDesigner(options.find(o => o.label === preselectedLabel));
            }
        } catch (error) {
            toast.error("Failed to fetch designers.");
        } finally {
            setIsDesignerLoading(false);
        }
    };

    const fetchWoNo = async (designerId = selectedDesigner?.value, preselectedValue = null) => {
        if (!designerId) return;
        setIsWoNoLoading(true);
        try {
            const response = await axiosInstance.get(`/kickoff/getWorkOrderByEmployeeId/${designerId}`);
            const options = response.data.map(wo => ({ value: wo.workOrderNumber, label: wo.workOrderNumber, fullData: wo }));
            setWoNoOptions(options);
            if (preselectedValue) {
                setSelectedWoNo(options.find(o => o.value === preselectedValue));
            }
        } catch (error) {
            toast.error("Failed to fetch WO No.");
        } finally {
            setIsWoNoLoading(false);
        }
    };


    // --- Handlers ---
    const handleDesignerCheckChange = (itemId, selectedOption) => {
        setChecklistSelections(prev => ({
            ...prev,
            [itemId]: { ...prev[itemId], designerCheck: selectedOption }
        }));
    };

    const handleTLCheckChange = (itemId, selectedOption) => {
        setChecklistSelections(prev => ({
            ...prev,
            [itemId]: { ...prev[itemId], tlCheck: selectedOption }
        }));
    };

    const handleUpdate = async () => {
        const payload = {
            checkListInfo: {
                checkListId: checkListId, // Important: include the ID for update
                employeeId: selectedDesigner?.value || null, // Corrected: was using customer value
                designerName: selectedDesigner?.label || null,
                customerName: selectedCustomer?.label || null,
                projectName: selectedProject?.label || null,
                workOrderNumber: selectedWoNo?.value || null,
                revisionNumber: revNo,
                partDetials: partDetails,
                toolDetails: toolDetails,
                designStartDate: designStartDate,
                designEndDate: designEndDate,
                pocketMCReleaseDate: pocketMCReleaseDate,
                finalMCReleaseDate: finalMCReleaseDate,
            },
            checkListItems: checklistData.flatMap(category =>
                category.items.map(item => {
                    const lookupKey = `${category.categoryName}::${item.description}`;
                    const savedItem = savedItemsMap.get(lookupKey);
                    const payloadItemId = savedItem ? savedItem.checkListItemId : null;

                    return {
                        checkListItemId: payloadItemId,
                        checkListId: checkListId,
                        categoryType: category.categoryName,
                        checkListItem: item.description,
                        checkByDesigner: checklistSelections[item.itemId]?.designerCheck?.value || "N/A",
                        checkByTeamLead: checklistSelections[item.itemId]?.tlCheck?.value || "N/A"
                    };
                })
            )
        };

        try {
            console.log("Payload for update:", payload);
            // NOTE: Use your actual update endpoint. It should be a PUT or PATCH request.
            await axiosInstance.put(`/kickoff/updateCheckList`, payload);
            toast.success("Checklist updated successfully!");
            onUpdate(); // Callback to refresh the list in the parent component
            onClose();  // Close the edit form
        } catch (error) {
            toast.error("Failed to update checklist.");
            console.error("Update failed:", error);
        }
    };

    // Render a loading spinner while fetching initial data
    if (isPageLoading) {
        return <div className="p-5 text-center">Loading checklist...</div>;
    }

    return (
        <div>
            <div className="row m-0 p-0 w-100 d-flex justify-content-between mb-2">
                <div className="col-md-3">
                    <h4>Edit Checklist Form</h4>
                </div>
                <div className="col-md-3 d-flex justify-content-end">
                    <button className="btn btn-secondary me-2" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleUpdate}>Update</button>
                </div>
            </div>

            <div className="main-container">
                <h4 className="checklist-title">Customer Info</h4>
                <Container fluid>
                    <Row className="mb-4">
                        <Col>
                            <label htmlFor="customerName" className="form-label"><span className="required-label">*</span>Customer Name</label>
                            <Select
                                options={customerOptions}
                                value={selectedCustomer}
                                onChange={setSelectedCustomer}
                                onMenuOpen={fetchCustomers}
                                isLoading={isCustomerLoading}
                                placeholder="Select a customer..."
                                isClearable
                            />
                        </Col>
                        <Col>
                            <label htmlFor="project" className="form-label"><span className="required-label">*</span>Project</label>
                            <Select
                                options={projectOptions}
                                value={selectedProject}
                                onChange={setSelectedProject}
                                onMenuOpen={() => fetchProjects()}
                                isLoading={isProjectLoading}
                                placeholder="Select a project..."
                                isClearable
                                isDisabled={!selectedCustomer}
                            />
                        </Col>
                        <Col>
                            <label htmlFor="designer" className="form-label"><span className="required-label">*</span>Designer</label>
                            <Select
                                options={designerOptions}
                                value={selectedDesigner}
                                onChange={setSelectedDesigner}
                                onMenuOpen={() => fetchDesigners()}
                                isLoading={isDesignerLoading}
                                placeholder="Select a designer..."
                                isClearable
                                isDisabled={!selectedProject}
                            />
                        </Col>
                        <Col>
                            <label htmlFor="woNo" className="form-label"><span className="required-label">*</span>WO No</label>
                            <Select
                                options={woNoOptions}
                                value={selectedWoNo}
                                onChange={setSelectedWoNo}
                                onMenuOpen={() => fetchWoNo()}
                                isLoading={isWoNoLoading}
                                placeholder="Select a WO No..."
                                isClearable
                                isDisabled={!selectedDesigner}
                            />
                        </Col>
                        <Col>
                            <label htmlFor="revNo" className="form-label">Rev No.</label>
                            <input type="text" id="revNo" className="form-control" placeholder="Enter Rev No." 
                                value={revNo} 
                                onChange={(e) => setRevNo(e.target.value)}
                            />
                        </Col>
                    </Row>
                    <Row className="mb-4">
                        <Col md={6}>
                            <label htmlFor="partDetails" className="form-label">Part Details</label>
                            <textarea id="partDetails" className="form-control" rows={4} placeholder="Enter Part Details"
                                value={partDetails}
                                onChange={(e) => setPartDetails(e.target.value)}
                            ></textarea>
                        </Col>
                        <Col md={6}>
                            <label htmlFor="toolDetails" className="form-label">Tool Details</label>
                            <textarea id="toolDetails" className="form-control" rows={4} placeholder="Enter Tool Details"
                                value={toolDetails}
                                onChange={(e) => setToolDetails(e.target.value)}
                            ></textarea>
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Col md={3}>
                            <label htmlFor="designStartDate" className="form-label">Design Start Date</label>
                            <input type="date" id="designStartDate" className="form-control"
                                value={designStartDate}
                                onChange={(e) => setDesignStartDate(e.target.value)}
                            />
                        </Col>
                        <Col md={3}>
                            <label htmlFor="designEndDate" className="form-label">Design End Date</label>
                            <input type="date" id="designEndDate" className="form-control"
                                value={designEndDate}
                                onChange={(e) => setDesignEndDate(e.target.value)}
                            />
                        </Col>
                        <Col md={3}>
                            <label htmlFor="pocketMCReleaseDate" className="form-label">Pocket MC Release Date</label>
                            <input type="date" id="pocketMCReleaseDate" className="form-control"
                                value={pocketMCReleaseDate}
                                onChange={(e) => setPocketMCReleaseDate(e.target.value)}
                            />
                        </Col>
                        <Col md={3}>
                            <label htmlFor="finalMCReleaseDate" className="form-label">Final MC Release Date</label>
                            <input type="date" id="finalMCReleaseDate" className="form-control"
                                value={finalMCReleaseDate}
                                onChange={(e) => setFinalMCReleaseDate(e.target.value)}
                             />
                        </Col>
                    </Row>
                </Container>
            </div>

            <div className="checklist-container">
                <h4 className="checklist-title">Checklist Items</h4>
                <table className="checklist-table">
                    <thead>
                        <tr>
                            <th style={{ width: "10%" }}>Sr. No</th>
                            <th style={{ width: "60%" }}>Description</th>
                            <th style={{ width: "15%" }}>Check by Designer</th>
                            <th style={{ width: "15%" }}>Check by TL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {checklistData.map(category => (
                            <React.Fragment key={category.categoryName}>
                                <tr className="category-row">
                                    <td colSpan="4">{category.categoryName}</td>
                                </tr>
                                {category.items.map(item => (
                                    <tr className="item-row" key={item.itemId}>
                                        <td>{item.srNo}</td>
                                        <td>{item.description}</td>
                                        <td>
                                            <Select
                                                options={checkOptions}
                                                value={checklistSelections[item.itemId]?.designerCheck || null}
                                                onChange={(selectedOption) => handleDesignerCheckChange(item.itemId, selectedOption)}
                                                placeholder="Select..."
                                                isClearable
                                            />
                                        </td>
                                        <td>
                                            <Select
                                                options={checkOptions}
                                                value={checklistSelections[item.itemId]?.tlCheck || null}
                                                onChange={(selectedOption) => handleTLCheckChange(item.itemId, selectedOption)}
                                                placeholder="Select..."
                                                isClearable
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EditChecklistSheet;