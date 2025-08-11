import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import CompanySidebar from "../CompanySidebar";
import CompanyTopbar from "../CompanyTopbar";
import Form from "react-bootstrap/Form";
import axiosInstance from "../../BaseComponet/axiosInstance";
import Button from "react-bootstrap/esm/Button";

const BOMUpdatePage = () => {
    const location = useLocation();
    const { bomId } = location.state || {};

    const [BOMInformation, setBOMInformation] = useState({});
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [companyName, setCompanyName ]= useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState("");
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState("");
    const [selectedItem, setSelectedItem] = useState([]);
    const [items, setItems] = useState([])
    const [workWorders, setWorkOrders] = useState([]);
    const [selectedWorkOrder, setSelectedWorkOrder] = useState([]);
    const [projectDetials, setProjectDetails] = useState("");
    const handleToggle = () => setIsCollapsed(!isCollapsed);
    const [categories, setCategories] = useState({});
    const [formRows, setFormRows] = useState({});
    const [rowsByCategory, setRowsByCategory] = useState({});
    const [editableRows, setEditableRows] = useState({});


    const [BOMInfoCategory, setBOMInfoCategory] = useState([])
    // Fetch customers on bomId change
    useEffect(() => {
        if (bomId) {
            fetchCustomers();
            fetchBOMinfo();

        }
    }, [bomId]);


    const fetchCustomers = async () => {
        try {
            const response = await axiosInstance.get("customer/getCustomerList");
            setCustomers(response.data || []);
        } catch (error) {
            console.error("Error fetching customers:", error);
        }
    };

    const fetchBOMinfo = async () => {
        try {
            const response = await axiosInstance.get(`kickoff/getBOMInfoById/${bomId}`);
            const data = response.data;
            setBOMInformation(data.BOMInfo);
            setBOMInfoCategory(data.BOMInfoCategory)
            fetchCategories(data.BOMInfoCategory)
            setProjectDetails(data.BOMInfo.projectDetails)
            if (data.BOMInfo.customerId) {
                setSelectedCustomer(data.BOMInfo.customerId);
                fetchProjectsByCustomerId(data.BOMInfo.customerId)

            }

            if (data.BOMInfo.projectId) {
                setSelectedProjectId(data.BOMInfo.projectId);
                setSelectedItem(data.BOMInfo.itemNo)
                fetchItemsByProjectid(data.BOMInfo.projectId);
            }

            if (data.BOMInfo.itemNo) {
                setSelectedWorkOrder(data.BOMInfo.workOrderNo)
                fetchWorkOrderNumberByItemNo(data.BOMInfo.itemNo)

            }
        } catch (error) {
            console.error("Error fetching BOM info:", error);
        }
    };

    const fetchCategories = async (Informtion) => {
        try {
            const response = await axiosInstance.get("kickoff/getCategoryByCompanyId");
            const fetchedCategories = response.data || {};

            setCategories(fetchedCategories);

            const initialFormRows = {};
            const initialRowsByCategory = {};

            Object.keys(fetchedCategories).forEach((categoryTitle) => {
                // Match category title to BOMInfoCategory.bomCategory
                const matchingBOMItems = Informtion.filter(
                    (bom) => bom.bomCategory?.toLowerCase() === categoryTitle.toLowerCase()
                );

                if (matchingBOMItems.length > 0) {
                    // Use all BOM rows for this category
                    initialFormRows[categoryTitle] = matchingBOMItems.map(() => ({}));

                    initialRowsByCategory[categoryTitle] = matchingBOMItems.map((bom) => ({
                        bomCategory: bom.bomCategory,
                        bomcategoryInfoId: bom.bomcategoryInfoId,
                        bomId: bom.bomId,
                        itemNo: bom.itemNo || "",
                        itemDescription: bom.itemDescription || "",
                        matl: bom.matl || "",
                        finishSizeLength: bom.finishSizeLength || "",
                        finishSizeWidth: bom.finishSizeWidth || "",
                        finishSizeHeight: bom.finishSizeHeight || "",
                        rawSizeLength: bom.rawSizeLength || "",
                        rawSizeWidth: bom.rawSizeWidth || "",
                        rawSizeHeight: bom.rawSizeHeight || "",
                        quantity: bom.qunatity || "", // careful: API uses "qunatity"
                        modelWeight: bom.modelWeight || "",
                        orderingRemarks: bom.orderingRemarks || "",
                        boughtOutItems: bom.boughtOutItems || "",
                        boughtOutQuantity: bom.boughtOutQuantity || "",
                        specification: bom.specification || "",
                        section: bom.section || "",
                    }));
                } else {
                    // No BOM rows → just one empty row
                    initialFormRows[categoryTitle] = [{}];
                    initialRowsByCategory[categoryTitle] = [{
                        bomId: bomId || "",
                        bomCategory: categoryTitle,
                        itemNo: "",
                        itemDescription: "",
                        matl: "",
                        finishSizeLength: "",
                        finishSizeWidth: "",
                        finishSizeHeight: "",
                        rawSizeLength: "",
                        rawSizeWidth: "",
                        rawSizeHeight: "",
                        quantity: "",
                        modelWeight: "",
                        orderingRemarks: "",
                        boughtOutItems: "",
                        boughtOutQuantity: "",
                        specification: "",
                        section: "",
                    }];
                }
            });

            setFormRows(initialFormRows);
            setRowsByCategory(initialRowsByCategory);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };



    const fetchProjectsByCustomerId = async (customerId) => {
        try {
            const response = await axiosInstance.get(`/project/getProjectByCustomerId/${customerId}`);
            setProjects(response.data || []);
        } catch (error) {
            console.error("Error fetching projects:", error);
        }
    };

    
    const handleProjectChange = (e) => {
        setSelectedProjectId(e.target.value);
        const projectId = e.target.value;
        fetchItemsByProjectid(projectId)

        // Find the selected customer from customers array
        const selectedProject = projects.find(p => p.projectId === projectId);

        // Set the company name to project details
        if (selectedProject) {
            setProjectDetails( + "_" + selectedProject.projectName);
        }
    };


    const fetchItemsByProjectid = async (projectId) => {
        try {
            const response = await axiosInstance.get(`/kickoff/getItemNoByProjectId/${projectId}`);
            setItems(response.data || []);

               // Find the selected customer from customers array
        const selectedProject = projects.find(p => p.projectId === projectId);

        // Set the company name to project details
        if (selectedProject) {
            setProjectDetails(companyName + "_" + selectedProject.projectName);
        }
        } catch (error) {
            console.error("Error fetching projects:", error);
        }
    };

    const fetchWorkOrderNumberByItemNo = async (itemNo) => {
        try {
            const response = await axiosInstance.get(`/kickoff/getWorkOrderNumberByItemNo/${itemNo}`);
            setWorkOrders(response.data || []);
            // const partNameResponse = await axiosInstance.get(`/kickoff/getPartNameByItemNo/${itemNo}`);
            // setPartName(partNameResponse.data);

        } catch (error) {
            console.error("Error fetching projects:", error);
        }
    };


    const updateBOMInfo = async (e) => {
        e.preventDefault(); // Prevent form from refreshing the page
        const formData = new FormData(e.target);
        const formValues = Object.fromEntries(formData.entries());

        // Add computed values
        const payload = {
            ...formValues,
            customerId: selectedCustomer,
            customerName: customers.find((c) => c.id === selectedCustomer)?.companyName || "",
            projectId: selectedProjectId,
            projectName: projects.find((p) => p.projectId === selectedProjectId)?.projectName || "",
        };

        console.log("Final Payload:", payload);
        console.log(payload); // Print form data to the console

        try {
            const response = await axiosInstance.put(`/kickoff/updateBOMInfo`, payload);
            console.log(response.data); // Log the response from the API
            // Close the modal after updating
        } catch (error) {
            console.error("Error updating student:", error);
        }
    };


    const handleAddRow = (categoryKey) => {
    setFormRows((prev) => ({
        ...prev,
        [categoryKey]: [...(prev[categoryKey] || []), {}],
    }));

    setRowsByCategory((prev) => ({
        ...prev,
        [categoryKey]: [
            ...(prev[categoryKey] || []),
            {
                bomId: bomId || "",          // from location.state
                bomCategory: categoryKey,    // category name
                itemNo: "",
                itemDescription: "",
                matl: "",
                finishSizeLength: "",
                finishSizeWidth: "",
                finishSizeHeight: "",
                rawSizeLength: "",
                rawSizeWidth: "",
                rawSizeHeight: "",
                quantity: "",
                modelWeight: "",
                orderingRemarks: "",
                boughtOutItems: "",
                boughtOutQuantity: "",
                specification: "",
                section: "",
            }
        ],
    }));
};




    const handleEditRow = (title, rowIdx) => {
        setEditableRows(prev => ({
            ...prev,
            [`${title}-${rowIdx}`]: true
        }));
    };

    const handleSaveRow = async (title, rowIdx) => {
        const rowKey = `${title}-${rowIdx}`;
        const rowData = {
            ...rowsByCategory[title]?.[rowIdx] // include ID if needed for update
        };

        try {
            const response = await axiosInstance.put(
                `/kickoff/updateBOMCategoryInfo`,
                rowData,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            console.log("Update successful:", response.data);

            // Only set row to read-only after successful save
            setEditableRows((prev) => {
                const newState = { ...prev };
                delete newState[rowKey];
                return newState;
            });

        } catch (error) {
            console.error("Error updating row:", error);
        }
    };


    // Change handler for editable fields
    const handleInputChange = (title, rowIdx, field, value) => {
        setRowsByCategory(prev => ({
            ...prev,
            [title]: prev[title].map((row, idx) =>
                idx === rowIdx ? { ...row, [field]: value } : row
            )
        }));
    };

   

    // Remove a single row from a category
    const handleRemoveRow = (category, rowIndex, bomId) => {
        setFormRows(prev => ({
            ...prev,
            [category]: prev[category].filter((_, idx) => idx !== rowIndex)
        }));

        setRowsByCategory(prev => ({
            ...prev,
            [category]: prev[category]?.filter((_, idx) => idx !== rowIndex)
        }));
    };


     const handleCustomerChange = (e) => {
        const customerId = e.target.value;
        setSelectedCustomer(customerId);
        setSelectedProjectId(""); // Reset project
        fetchProjectsByCustomerId(customerId);

        // Find the selected customer from customers array
        const selectedCustomer = customers.find(c => c.id === customerId);

        // Set the company name to project details
        if (selectedCustomer) {
            setProjectDetails(selectedCustomer.companyName);
            setCompanyName(selectedCustomer.companyName)
        }
    };



    return (
        <>
            <CompanyTopbar onToggle={handleToggle} />
            <div className="slidebar-main-div">
                <CompanySidebar isCollapsed={isCollapsed} />

                <div className="slidebar-main-div-right-section">
                    <div className="row m-0 p-0 w-100 d-flex justify-content-between mb-3">
                        <div className="col-md-6">
                            <h4>Update BOM</h4>
                        </div>

                        <Form onSubmit={updateBOMInfo}>
                            {/* Customer & Project in same row */}
                            <div className="row">
                                <div className="col-md-6">
                                    <Form.Group controlId="formCustomer">
                                        <Form.Label>Customer</Form.Label>
                                        <Form.Select
                                            name="customerName"
                                            value={selectedCustomer}
                                            onChange={handleCustomerChange}
                                        >
                                            <option value="">Select Customer</option>
                                            {customers.map((customer) => (
                                                <option key={customer.id} value={customer.id}>
                                                    {customer.companyName}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </div>

                                <div className="col-md-6">
                                    <Form.Group controlId="formProject">
                                        <Form.Label>Project</Form.Label>
                                        <Form.Select
                                            value={selectedProjectId}
                                            name="partName"
                                            onChange={handleProjectChange}
                                            disabled={!selectedCustomer || projects.length === 0}
                                        >
                                            <option value="">Select Project</option>
                                            {projects.map((project) => (
                                                <option key={project.projectId} value={project.projectId}>
                                                    {project.projectName}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                            </div>

                            {/* Item Number & Work Orders in same row */}
                            <div className="row mt-3">
                                <div className="col-md-6">
                                    <Form.Group controlId="formItemNo">
                                        <Form.Label>Item Number</Form.Label>
                                        <Form.Select
                                            aria-label="Select Item Number"
                                            name="itemNo"
                                            value={selectedItem}
                                            onChange={(e) => fetchWorkOrderNumberByItemNo(e.target.value)}
                                            disabled={!selectedProjectId || items.length === 0}
                                        >
                                            <option value="">Select Item Number</option>
                                            {items.map((item) => (
                                                <option key={item} value={item}>
                                                    {item}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </div>

                                <div className="col-md-6">
                                    <Form.Group controlId="formWorkOrder">
                                        <Form.Label>Work Orders</Form.Label>
                                        <Form.Select
                                            aria-label="Select Work Order"
                                            name="workOrderNo"
                                            value={selectedWorkOrder}
                                            onChange={(e) => setSelectedWorkOrder(e.target.value)}
                                            disabled={!selectedProjectId || workWorders.length === 0}
                                        >
                                            <option value="">Select Work Order</option>
                                            {workWorders.map((workOrder) => (
                                                <option key={workOrder} value={workOrder}>
                                                    {workOrder}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                            </div>

                            {/* Part Name & Project Details in same row */}
                            <div className="row mt-3">
                                <div className="col-md-6">
                                    <Form.Group controlId="formPartName">
                                        <Form.Label>Part Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            required
                                            placeholder="Enter Part Name"
                                            name="partName"
                                            defaultValue={BOMInformation.partName}
                                        />
                                    </Form.Group>
                                </div>

                                <div className="col-md-6">
                                    <Form.Group controlId="formProjectDetails">
                                        <Form.Label>Project Details</Form.Label>
                                        <Form.Control
                                            type="text"
                                            required
                                            placeholder="Enter Project Details"
                                            name="projectDetails"
                                            defaultValue={projectDetials}
                                        />
                                    </Form.Group>
                                </div>
                            </div>

                            {/* Date & Revision Number in same row */}
                            <div className="row mt-3">
                                <div className="col-md-6">
                                    <Form.Group controlId="formBomDate">
                                        <Form.Label>Date</Form.Label>
                                        <Form.Control
                                            type="date"
                                            required
                                            name="bomDate"
                                            defaultValue={BOMInformation.bomDate}
                                        />
                                    </Form.Group>
                                </div>

                                <div className="col-md-6">
                                    <Form.Group controlId="formRevisionNumber">
                                        <Form.Label>Revision Number</Form.Label>
                                        <Form.Control
                                            type="text"
                                            required
                                            placeholder="Enter Revision Number"
                                            name="revisionNumber"
                                            defaultValue={BOMInformation.revisionNumber}
                                        />
                                    </Form.Group>
                                </div>
                            </div>

                            {/* Die Details full width */}
                            <div className="row mt-3">
                                <div className="col-md-12">
                                    <Form.Group controlId="formDieDetails">
                                        <Form.Label>Die Details</Form.Label>
                                        <Form.Control
                                            type="text"
                                            required
                                            placeholder="Enter Die Details"
                                            name="dieDetails"
                                            defaultValue={BOMInformation.dieDetails}
                                        />
                                    </Form.Group>
                                </div>
                            </div>


                            <Form.Control type="text" required placeholder="Enter Die Details" name="bomId" hidden defaultValue={BOMInformation.bomId} />
                            <Form.Control type="text" required placeholder="Enter Die Details" name="createdDateTime" hidden defaultValue={BOMInformation.createdDateTime} />

                            <Button variant="primary" type="submit" className="mt-3">
                                Save Changes
                            </Button>
                        </Form>

                    </div>
                    {/* Categories */}

                    <div>

                        <div className="container">
                            <h1>Categories</h1>
                            {Object.entries(categories).map(([title, items]) => (
                                <div className="row mb-4" key={title}>
                                    <div className="col-12">
                                        <div className="card shadow-sm">
                                            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                                                <h5 className="mb-0">{title}</h5>
                                                <Button
                                                    variant="light"
                                                    size="sm"
                                                    onClick={() => handleAddRow(title)}
                                                >
                                                    + Add Row
                                                </Button>


                                            </div>

                                            <div className="card-body">
                                                {(formRows[title] || []).map((_, rowIdx) => (
                                                    <div className="row" key={`${title}-${rowIdx}`}>


                                                        {items.map((item, idx) => (
                                                            <div
                                                                className="col-md-6 col-lg-4 mb-3"
                                                                key={`${title}-${rowIdx}-${idx}`}
                                                            >
                                                                {item === "ITEM NO" && (
                                                                    <Form.Group
                                                                        controlId={`itemNo-${title}-${rowIdx}-${idx}`}
                                                                    >
                                                                        <Form.Label>ITEM NO</Form.Label>
                                                                        <Form.Control
                                                                            type="number"
                                                                            name="itemNo"
                                                                            placeholder="Enter Item Number"
                                                                            readOnly={!editableRows[`${title}-${rowIdx}`]}
                                                                            value={rowsByCategory[title]?.[rowIdx]?.itemNo || ""}
                                                                            onChange={(e) =>
                                                                                handleInputChange(title, rowIdx, "itemNo", e.target.value)
                                                                            }
                                                                        />
                                                                    </Form.Group>
                                                                )}

                                                                {item === "ITEM DESCRIPTION" && (
                                                                    <Form.Group
                                                                        controlId={`itemDescription-${title}-${rowIdx}-${idx}`}
                                                                    >
                                                                        <Form.Label>ITEM DESCRIPTION</Form.Label>
                                                                        <Form.Control
                                                                            type="text"
                                                                            placeholder="Description"
                                                                            name="itemDescription"
                                                                            value={
                                                                                rowsByCategory[title]?.[rowIdx]?.itemDescription ||
                                                                                ""
                                                                            }
                                                                            readOnly={!editableRows[`${title}-${rowIdx}`]}

                                                                            onChange={(e) =>
                                                                                handleInputChange(title, rowIdx, "itemDescription", e.target.value)
                                                                            }

                                                                        />
                                                                    </Form.Group>
                                                                )}

                                                                {item === "MATL" && (
                                                                    <Form.Group
                                                                        controlId={`matl-${title}-${rowIdx}-${idx}`}
                                                                    >
                                                                        <Form.Label>MATL</Form.Label>
                                                                        <Form.Control
                                                                            name="matl"
                                                                            type="text"
                                                                            placeholder="Material"
                                                                            value={rowsByCategory[title]?.[rowIdx]?.matl || ""}
                                                                            readOnly={!editableRows[`${title}-${rowIdx}`]}
                                                                            onChange={(e) => handleInputChange(title, rowIdx, "matl", e.target.value)}

                                                                        />
                                                                    </Form.Group>
                                                                )}

                                                                {item === "FINISH SIZE" && (
                                                                    <Form.Group controlId={`finishSize-${title}-${rowIdx}-${idx}`}>
                                                                        <Form.Label>Finish Size</Form.Label>
                                                                        <div className="d-flex gap-2">
                                                                            <Form.Control type="number" placeholder="L" name="finishSizeLength" readOnly={!editableRows[`${title}-${rowIdx}`]}
                                                                                onChange={(e) => handleInputChange(title, rowIdx, "finishSizeLength", e.target.value)} value={rowsByCategory[title]?.[rowIdx]?.finishSizeLength || ""}
                                                                            />
                                                                            <Form.Control type="number" placeholder="W" name="finishSizeWidth" readOnly={!editableRows[`${title}-${rowIdx}`]}
                                                                                onChange={(e) => handleInputChange(title, rowIdx, "finishSizeWidth", e.target.value)} value={rowsByCategory[title]?.[rowIdx]?.finishSizeWidth || ""}
                                                                            />
                                                                            <Form.Control type="number" placeholder="H" name="finishSizeHeight" readOnly={!editableRows[`${title}-${rowIdx}`]}
                                                                                value={rowsByCategory[title]?.[rowIdx]?.finishSizeHeight || ""}
                                                                            />
                                                                        </div>
                                                                    </Form.Group>
                                                                )}

                                                                {item === "RAW SIZE" && (
                                                                    <Form.Group controlId={`rawSize-${title}-${rowIdx}-${idx}`}>
                                                                        <Form.Label>Raw Size</Form.Label>
                                                                        <div className="d-flex gap-2">
                                                                            <Form.Control type="number" placeholder="L" name="rawSizeLength" readOnly={!editableRows[`${title}-${rowIdx}`]} onChange={(e) => handleInputChange(title, rowIdx, "rawSizeLength", e.target.value)} value={rowsByCategory[title]?.[rowIdx]?.rawSizeLength || ""}
                                                                            />
                                                                            <Form.Control type="number" placeholder="W" name="rawSizeWidth" readOnly={!editableRows[`${title}-${rowIdx}`]} onChange={(e) => handleInputChange(title, rowIdx, "rawSizeWidth", e.target.value)} value={rowsByCategory[title]?.[rowIdx]?.rawSizeWidth || ""}
                                                                            />
                                                                            <Form.Control type="number" placeholder="H" name="rawSizeHeight" readOnly={!editableRows[`${title}-${rowIdx}`]} onChange={(e) => handleInputChange(title, rowIdx, "rawSizeHeight", e.target.value)} value={rowsByCategory[title]?.[rowIdx]?.rawSizeHeight || ""}
                                                                            />
                                                                        </div>
                                                                    </Form.Group>
                                                                )}


                                                                {item === "QTY" && (
                                                                    <Form.Group controlId={`qty-${title}-${rowIdx}-${idx}`}>
                                                                        <Form.Label>Quantity</Form.Label>
                                                                        <Form.Control type="number" placeholder="Quantity" name="quantity" readOnly={!editableRows[`${title}-${rowIdx}`]} onChange={(e) => handleInputChange(title, rowIdx, "quantity", e.target.value)} value={rowsByCategory[title]?.[rowIdx]?.quantity || ""}
                                                                        />
                                                                    </Form.Group>
                                                                )}

                                                                {item === "MODEL WT" && (
                                                                    <Form.Group controlId={`modelWt-${title}-${rowIdx}-${idx}`}>
                                                                        <Form.Label>Model Weight</Form.Label>
                                                                        <Form.Control type="number" placeholder="Model Weight" name="modelWeight" readOnly={!editableRows[`${title}-${rowIdx}`]} onChange={(e) => handleInputChange(title, rowIdx, "modelWeight", e.target.value)} value={rowsByCategory[title]?.[rowIdx]?.modelWeight || ""}
                                                                        />
                                                                    </Form.Group>
                                                                )}

                                                                {item === "ORDERING REMARKS" && (
                                                                    <Form.Group controlId={`orderingRemarks-${title}-${rowIdx}-${idx}`}>
                                                                        <Form.Label>Ordering Remarks</Form.Label>
                                                                        <Form.Control type="text" placeholder="Ordering Remarks" name="orderingRemarks" readOnly={!editableRows[`${title}-${rowIdx}`]} onChange={(e) => handleInputChange(title, rowIdx, "orderingRemarks", e.target.value)} value={rowsByCategory[title]?.[rowIdx]?.orderingRemarks || ""}
                                                                        />
                                                                    </Form.Group>
                                                                )}
                                                                {item === "BOUGHT OUT ITEMS" && (
                                                                    <Form.Group controlId={`boughtOutItems-${title}-${rowIdx}-${idx}`}>
                                                                        <Form.Label>Bought Out Items</Form.Label>
                                                                        <Form.Control type="text" placeholder="Bought Out Items" name="boughtOutItems" readOnly={!editableRows[`${title}-${rowIdx}`]} onChange={(e) => handleInputChange(title, rowIdx, "boughtOutItems", e.target.value)} value={rowsByCategory[title]?.[rowIdx]?.boughtOutItems || ""}
                                                                        />
                                                                    </Form.Group>
                                                                )}

                                                                {item === "BOUGHT OUT QTY" && (
                                                                    <Form.Group controlId={`boughtOutQty-${title}-${rowIdx}-${idx}`}>
                                                                        <Form.Label>Bought Out Qty</Form.Label>
                                                                        <Form.Control type="number" placeholder="Quantity" name="boughtOutQuantity" readOnly={!editableRows[`${title}-${rowIdx}`]} onChange={(e) => handleInputChange(title, rowIdx, "boughtOutQuantity", e.target.value)} value={rowsByCategory[title]?.[rowIdx]?.boughtOutQuantity || ""}
                                                                        />
                                                                    </Form.Group>
                                                                )}

                                                                {item === "SPECIFICATION" && (
                                                                    <Form.Group controlId={`specification-${title}-${rowIdx}-${idx}`}>
                                                                        <Form.Label>Specification</Form.Label>o
                                                                        <Form.Control type="text" placeholder="Specification" name="specification" readOnly={!editableRows[`${title}-${rowIdx}`]} onChange={(e) => handleInputChange(title, rowIdx, "specification", e.target.value)} value={rowsByCategory[title]?.[rowIdx]?.specification || ""} />
                                                                    </Form.Group>
                                                                )}



                                                                {item === "SEC." && (
                                                                    <Form.Group controlId={`sec-${title}-${rowIdx}-${idx}`}>
                                                                        <Form.Label>Section</Form.Label>
                                                                        <Form.Control type="text" placeholder="Section" name="section" readOnly={!editableRows[`${title}-${rowIdx}`]} onChange={(e) => handleInputChange(title, rowIdx, "section", e.target.value)} value={rowsByCategory[title]?.[rowIdx]?.section || ""} />
                                                                    </Form.Group>
                                                                )}

                                                                <Form.Control type="text" required placeholder="Enter Die Details" name="bomCategory" hidden value={rowsByCategory[title]?.[rowIdx]?.bomCategory} />
                                                                <Form.Control type="text" required placeholder="Enter Die Details" name="bomId" hidden value={rowsByCategory[title]?.[rowIdx]?.bomId} />
                                                                <Form.Control type="text" required placeholder="Enter Die Details" name="bomcategoryInfoId" hidden value={rowsByCategory[title]?.[rowIdx]?.bomcategoryInfoId} />


                                                            </div>
                                                        ))}

                                                        <div className="col-auto mb-3">
                                                            <Button
                                                                variant="outline-danger"
                                                                size="sm"
                                                                onClick={() => handleRemoveRow(title, rowIdx, rowsByCategory[title]?.[rowIdx]?.section)}
                                                            >
                                                                Remove Row
                                                            </Button>
                                                        </div>

                                                        <div className="col-auto mb-3">
                                                            {editableRows[`${title}-${rowIdx}`] ? (
                                                                <Button
                                                                    variant="success"
                                                                    size="sm"
                                                                    onClick={() => handleSaveRow(title, rowIdx)}
                                                                >
                                                                    Save
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    variant="warning"
                                                                    size="sm"
                                                                    onClick={() => handleEditRow(title, rowIdx)}
                                                                >
                                                                    Edit
                                                                </Button>
                                                            )}
                                                        </div>

                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>

                </div>
            </div>
        </>
    );
};

export default BOMUpdatePage;
