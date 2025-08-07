import React, { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import "./CreateChecklistSheet.css";
import Select from "react-select";
import axiosInstance from "../../BaseComponet/axiosInstance";
import { toast } from "react-toastify";

const CreateChecklistSheet = ({ onClose, onSave }) => {
    const [customerOptions, setCustomerOptions] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isCustomerLoading, setIsCustomerLoading] = useState(false);
    const [projectOptions, setProjectOptions] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [isProjectLoading, setIsProjectLoading] = useState(false);
    const [designerOptions, setDesignerOptions] = useState([]);
    const [selectedDesigner, setSelectedDesigner] = useState(null);
    const [isDesignerLoading, setIsDesignerLoading] = useState(false);
    const [woNoOptions, setWoNoOptions] = useState([]);
    const [selectedWoNo, setSelectedWoNo] = useState(null);
    const [isWoNoLoading, setIsWoNoLoading] = useState(false);
    const [checklistData, setChecklistData] = useState([]);
    const [checklistSelections, setChecklistSelections] = useState({});



    const checkOptions = [
        { value: "N/A", label: "N/A" },
        { value: "Yes", label: "Yes" },
        { value: "No", label: "No" }
    ];

    useEffect(() => {
        fetchChecklistData();
    }, []);

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

    const fetchDesigners = async () => {
        try {
            if(!selectedProject) {
                toast.error("Please select a project first.");
                return;
            }
            const projectId = selectedProject.fullData.projectId;
            setIsDesignerLoading(true);
            const response = await axiosInstance.get(`/project/getEmployeesbyProjectId/${projectId}`);
            const data = response.data;

            const options = data.map(d => ({
            value: d.employeeId,
            label: d.employeeName,
            fullData: d
            }));

            setDesignerOptions(options);
            setIsDesignerLoading(false);
        } catch (error) {
            toast.error("Failed to fetch Designer:", error);
            setIsDesignerLoading(false);
        }
    };

    const fetchWoNo = async () => {
        try {
            if(!selectedDesigner) {
                toast.error("Please select a designer first.");
                return;
            }  
            const designerId = selectedDesigner.value;
            setIsWoNoLoading(true);
            const response = await axiosInstance.get(`/kickoff/getWorkOrderByEmployeeId/${designerId}`);
            const data = response.data;
            const options = data.map(wo => ({
                value: wo.workOrderNumber,
                label: wo.workOrderNumber,
                fullData: wo
            }));
            setWoNoOptions(options);
            setIsWoNoLoading(false);
        } catch (error) {
            toast.error("Failed to fetch WO No:", error);
            setIsWoNoLoading(false);
        }
    };

    const fetchChecklistData = async () => {
        try {
            const response = await axiosInstance.get("/kickoff/getCheckListCategoryAndItem");
            const data = response.data;

            // Group by categoryType
            const groupedData = data.reduce((acc, item) => {
            const category = item.categoryType;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push({
                description: item.checkListItem,
                itemId: item.itemId,
                companyId: item.companyId
            });
            return acc;
            }, {});

            // Convert to array format
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
            
            const defaultSelection = {};
            const naOption = { value: "N/A", label: "N/A" };

            transformedData.forEach(category => {
                category.items.forEach(item => {
                    defaultSelection[item.itemId] = {
                        designerCheck: naOption,
                        tlCheck: naOption
                    };
                });
            });

            setChecklistSelections(defaultSelection);
        } catch (error) {
            toast.error("Failed to fetch checklist items.");
            console.error(error);
        }
    };

    const handleDesignerCheckChange = (itemId, selectedOption) => {
        setChecklistSelections(prev => ({
            ...prev,
            [itemId]: {
            ...prev[itemId],
            designerCheck: selectedOption
            }
        }));
    };

    const handleTLCheckChange = (itemId, selectedOption) => {
        setChecklistSelections(prev => ({
            ...prev,
            [itemId]: {
            ...prev[itemId],
            tlCheck: selectedOption
            }
        }));
    };


    const handleSave = async () => {
        const payload = {
            checkListInfo:{
                employeeId: selectedCustomer?.value || null,
                designerName: selectedDesigner?.label || null,
                customerName: selectedCustomer?.label || null,
                projectName: selectedProject?.label || null,
                workOrderNumber: selectedWoNo?.value || null,
                revisionNumber: document.getElementById("revNo")?.value || null,
                partDetials: document.getElementById("partDetails")?.value || null,
                toolDetails: document.getElementById("toolDetails")?.value || null,
                designStartDate: document.getElementById("designStartDate")?.value || null,
                designEndDate: document.getElementById("designEndDate")?.value || null,
                pocketMCReleaseDate: document.getElementById("pocketMCReleaseDate")?.value || null,
                finalMCReleaseDate: document.getElementById("finalMCReleaseDate")?.value || null,
            },
            checkListItems: checklistData.flatMap(category =>
                category.items.map(item => ({
                    categoryType: category.categoryName,
                    checkListItem: item.description,
                    checkByDesigner: checklistSelections[item.itemId]?.designerCheck?.value || null,
                    checkByTeamLead: checklistSelections[item.itemId]?.tlCheck?.value || null
                }))
            )
        };
        console.log("Customer Info Payload:", payload);
        try {
            const response = await axiosInstance.post("/kickoff/createCheckList", payload);
            if(response.status === 200) {
                toast.success("Checklist created successfully!");
                onSave();
            } else {
                toast.error("Failed to create checklist.");
            }
        } catch (error) {
            console.error("Error creating checklist:", error);
            toast.error("Failed to create checklist.");
        }
    }


  return (
    <div>

      <div className="row m-0 p-0 w-100 d-flex justify-content-between mb-2">

        <div className="col-md-3">
          <h4>Design Checklist Form</h4>
        </div>
        <div className="col-md-3 d-flex justify-content-end">
          <button className="btn btn-secondary me-2" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Save
          </button>
        </div>

      </div>
      <div className="main-container">
        <Container fluid>
            <h4 className="checklist-title">
                Customer Info
            </h4>
            <Row className="mb-4">
                <Col>
                    <label htmlFor="customerName" className="form-label">
                    <span className="required-label">*</span>Customer Name
                    </label>
                    <Select
                        options={customerOptions}
                        value={selectedCustomer}
                        onChange={(selectedOption) => setSelectedCustomer(selectedOption)}
                        placeholder="Select a customer..."
                        isClearable
                        onMenuOpen={fetchCustomers}
                        isLoading={isCustomerLoading}
                    />

                </Col>
                <Col>
                    <label htmlFor="project" className="form-label">
                    <span className="required-label">*</span>Project
                    </label>
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
                </Col>
                
                <Col>
                    <label htmlFor="designer" className="form-label">
                    <span className="required-label">*</span>Designer
                    </label>
                    <Select
                        options={designerOptions}
                        value={selectedDesigner}
                        onChange={(selectedOption) => setSelectedDesigner(selectedOption)}
                        placeholder="Select a designer..."
                        isClearable
                        onMenuOpen={fetchDesigners}
                        isLoading={isDesignerLoading}
                        isDisabled={!selectedProject}
                    />
                </Col>
                
                <Col>
                    <label htmlFor="woNo" className="form-label">
                        <span className="required-label">*</span>WO No</label>
                    <Select
                        options={woNoOptions}
                        value={selectedWoNo}
                        onChange={(selectedOption) => setSelectedWoNo(selectedOption)}
                        placeholder="Select a WO No..."
                        isClearable
                        onMenuOpen={fetchWoNo}
                        isLoading={isWoNoLoading}
                        isDisabled={!selectedDesigner}
                    />
                    
                </Col>

                <Col>
                    <label htmlFor="revNo" className="form-label">Rev No.</label>
                    <input type="text" id="revNo" className="form-control" placeholder="Enter Rev No." />
                </Col>

            </Row>

                {/* Middle Row: Part and Tool Details */}
            <Row className="mb-4">
                <Col md={6}>
                    <label htmlFor="partDetails" className="form-label">Part Details</label>
                    <textarea id="partDetails" className="form-control" rows={4} placeholder="Enter Part Details"></textarea>
                </Col>
                
                <Col md={6}>
                    <label htmlFor="toolDetails" className="form-label">Tool Details</label>
                    <textarea id="toolDetails" className="form-control" rows={4} placeholder="Enter Tool Details"></textarea>
                </Col>
            </Row>

            {/* Bottom Row: Dates */}
            <Row className="mb-3">
                <Col md={3}>
                    <label htmlFor="designStartDate" className="form-label">Design Start Date</label>
                    <input type="date" id="designStartDate" className="form-control" placeholder="dd-mm-yyyy" />
                </Col>
                
                <Col md={3}>
                    <label htmlFor="designEndDate" className="form-label">Design End Date</label>
                    <input type="date" id="designEndDate" className="form-control" placeholder="dd-mm-yyyy" />
                </Col>
                
                <Col md={3}>
                    <label htmlFor="pocketMCReleaseDate" className="form-label">Pocket MC Release Date</label>
                    <input type="date" id="pocketMCReleaseDate" className="form-control" placeholder="dd-mm-yyyy" />
                </Col>
                
                <Col md={3}>
                    <label htmlFor="finalMCReleaseDate" className="form-label">Final MC Release Date</label>
                    <input type="date" id="finalMCReleaseDate" className="form-control" placeholder="dd-mm-yyyy" />
                </Col>
            </Row>
        </Container>
        </div>

        <div className="checklist-container">
            <h4 className="checklist-title">
                Checklist Items
            </h4>

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
                    {/* Category Header Row */}
                    <tr className="category-row">
                        <td colSpan="4">{category.categoryName}</td>
                    </tr>

                    {/* Items for the current category */}
                    {category.items.map(item => (
                        <tr className="item-row" key={item.srNo}>
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

export default CreateChecklistSheet;
