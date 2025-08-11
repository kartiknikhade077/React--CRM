import React, { useEffect, useState } from "react";
import CompanySidebar from "../CompanySidebar";
import CompanyTopbar from "../CompanyTopbar";
import Form from 'react-bootstrap/Form';
import axiosInstance from "../../BaseComponet/axiosInstance";
import Button from "react-bootstrap/esm/Button";
import { useNavigate } from "react-router-dom";


const BOMCreatePage = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [items, setItems] = useState([])
    const [workOrders, setWorkOrders] = useState([])
    const [partName, setPartName] = useState("")
    const [selectedCustomerId, setSelectedCustomerId] = useState("");
    const [selectedProjectId, setSelectedProjectId] = useState("");
    const [projectDetials, setProjectDetails] = useState("");
    const [categories, setCategories] = useState({});
    const [formRows, setFormRows] = useState({});
    const [rowsByCategory, setRowsByCategory] = useState({});
    const [BOMInfo, setBOMInfo] = useState([])
    const [dieDetails, setDieDetails] = useState("")
    const navigate = useNavigate();

    const handleToggle = () => {
        setIsCollapsed(!isCollapsed);
    };

    useEffect(() => {
        fetchCustomers();
        fetchCategories();

    }, []);


    //   const fetchCategories = async () => {
    //     try {
    //         const response = await axiosInstance.get("kickoff/getCategoryByCompanyId");
    //         setCategories(response.data || []);
    //     } catch (error) {
    //         console.error("Error fetching customers:", error);
    //     }
    // };

    const fetchCategories = async () => {
        try {
            const response = await axiosInstance.get("kickoff/getCategoryByCompanyId");
            const fetchedCategories = response.data || {};

            setCategories(fetchedCategories);

            // Initialize rows for each category
            const initialFormRows = {};
            const initialRowsByCategory = {};
            Object.keys(fetchedCategories).forEach((key) => {
                initialFormRows[key] = [{}]; // for rendering rows
                initialRowsByCategory[key] = [{}]; // for storing data
            });

            setFormRows(initialFormRows);
            setRowsByCategory(initialRowsByCategory);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };




    const fetchCustomers = async () => {
        try {
            const response = await axiosInstance.get("customer/getCustomerList");
            setCustomers(response.data || []);
        } catch (error) {
            console.error("Error fetching customers:", error);
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


    const fetchItemsByProjectid = async (projectId) => {
        try {
            const response = await axiosInstance.get(`/kickoff/getItemNoByProjectId/${projectId}`);
            setItems(response.data || []);
        } catch (error) {
            console.error("Error fetching projects:", error);
        }
    };

    const fetchWorkOrderNumberByItemNo = async (itemNo) => {
        try {
            const response = await axiosInstance.get(`/kickoff/getWorkOrderNumberByItemNo/${itemNo}`);
            setWorkOrders(response.data || []);
            const partNameResponse = await axiosInstance.get(`/kickoff/getPartNameByItemNo/${itemNo}`);
            setPartName(partNameResponse.data);

        } catch (error) {
            console.error("Error fetching projects:", error);
        }
    };

    const handleCustomerChange = (e) => {
        const customerId = e.target.value;
        setSelectedCustomerId(customerId);
        setSelectedProjectId(""); // Reset project
        fetchProjectsByCustomerId(customerId);

        // Find the selected customer from customers array
        const selectedCustomer = customers.find(c => c.id === customerId);

        // Set the company name to project details
        if (selectedCustomer) {
            setProjectDetails(selectedCustomer.companyName);
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
            setProjectDetails(projectDetials + "_" + selectedProject.projectName);
        }
    };

    const handleItemChange = (e) => {
        // setSelectedProjectId(e.target.value);
        const itemNo = e.target.value;
        fetchWorkOrderNumberByItemNo(itemNo)
    };

    const onHandleChageWorkOrder = async (e) => {

        try{
        const workOrderNo = e.target.value;
        const response = await axiosInstance.get(`/kickoff/getItemProcessByWorkOrderNumber/${workOrderNo}`);

         const itemProcess=response.data.body;
          
            setDieDetails("OP "+itemProcess.operationNumber+"_"+partName+"_"+itemProcess.process)

        }catch(error){
            console.error("Error fetching projects:", error);
        }


    }



    const saveInfo = async (e) => {
        e.preventDefault(); // Prevent page 

        const flatArray = Object.values(rowsByCategory).flat();

        // Collect BOM Info
        const bomInfo = {
            customerName: customers.find(c => c.id === selectedCustomerId)?.companyName || "",
            projectName: projects.find(p => p.projectId === selectedProjectId)?.projectName || "",
            customerId: selectedCustomerId,
            projectId: selectedProjectId,
            partName: partName,
            itemNo: parseInt(e.target.itemNo.value),
            workOrderNo: e.target.workOrderNo.value,
            projectDetails: projectDetials,
            bomDate: e.target.bomDate.value,
            revisionNumber: e.target.revisionNumber.value,
            dieDetails: e.target.dieDetails.value,
        };




        // Combine the final payload
        const finalPayload = {
            BOMInfo: bomInfo,
            BOMCategoryInfo: flatArray
        };

        // console.log("Sending BOM Payload:", finalPayload);

        // Send to backend
        try {
            const response = await axiosInstance.post("/kickoff/createBOM", finalPayload);
            navigate("/BOMList");
        } catch (error) {
            console.error("Error saving BOM:", error);
            alert("Failed to create BOM.");
        }
    };



    const handleAddRow = (categoryKey) => {
        setFormRows((prev) => ({
            ...prev,
            [categoryKey]: [...(prev[categoryKey] || []), {}],
        }));

        setRowsByCategory((prev) => ({
            ...prev,
            [categoryKey]: [...(prev[categoryKey] || []), {}],
        }));
    };

    // -------------------- HANDLE INPUT --------------------
    const handleInputChangeCategories = (category, rowIdx, field, value) => {
        setRowsByCategory((prev) => {
            const updatedCategoryRows = [...(prev[category] || [])];

            updatedCategoryRows[rowIdx] = {
                ...updatedCategoryRows[rowIdx],
                [field]: value,
                bomCategory: category,
            };

            const newState = {
                ...prev,
                [category]: updatedCategoryRows,
            };

            console.log("Updated rowsByCategory:", newState); // 👀 Console live
            return newState;
        });
    };


    return (
        <>
            <CompanyTopbar onToggle={handleToggle} />
            <div className="slidebar-main-div">
                <CompanySidebar isCollapsed={isCollapsed} />

                <div className="slidebar-main-div-right-section">
                    <div className="Companalist-main-card">

                        <div className="row m-0 p-0 w-100 d-flex justify-content-between mb-3">
                            <div className="col-md-6">
                                <h4>Create BOM </h4>
                            </div>

                            <div>
                                <Form onSubmit={saveInfo}>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <Form.Group className="mb-3" controlId="formCustomer">
                                                <Form.Label>Customer</Form.Label>
                                                <Form.Select required
                                                    aria-label="Select Customer"
                                                    name="customerName"
                                                    value={selectedCustomerId}
                                                    onChange={handleCustomerChange}
                                                >
                                                    <option value="">Select Customer</option>
                                                    {customers.map((customer) => (
                                                        <option
                                                            key={customer.id}
                                                            value={customer.id}
                                                        >
                                                            {customer.companyName}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>
                                        </div>
                                        <div className="col-md-6">
                                            <Form.Group className="mb-3" controlId="formProject">
                                                <Form.Label>Project</Form.Label>
                                                <Form.Select required
                                                    aria-label="Select Project"
                                                    name="projectName"
                                                    value={selectedProjectId}
                                                    onChange={handleProjectChange}
                                                    disabled={!projects.length}
                                                >
                                                    <option value="">Select Project</option>
                                                    {projects.map((project) => (
                                                        <option
                                                            key={project.projectId}
                                                            value={project.projectId}
                                                        >
                                                            {project.projectName}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6">
                                            <Form.Group className="mb-3" controlId="formItemNo">
                                                <Form.Label>Item Number</Form.Label>
                                                <Form.Select aria-label="Select Item Number" name="itemNo"
                                                    onChange={handleItemChange}
                                                    disabled={!items.length} required
                                                >
                                                    <option value="">Select Project</option>
                                                    {items.map((item) => (
                                                        <option
                                                            key={item}
                                                            value={item}
                                                        >
                                                            {item}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>
                                        </div>
                                        <div className="col-md-6">
                                            <Form.Group className="mb-3" controlId="formWorkOrderNo">
                                                <Form.Label>Work Order Number</Form.Label>
                                                <Form.Select aria-label="Select Work Order Number" required name="workOrderNo" onChange={onHandleChageWorkOrder}>
                                                    <option value="">Select Project</option>
                                                    {workOrders.map((workOrder) => (
                                                        <option
                                                            key={workOrder}
                                                            value={workOrder}
                                                        >
                                                            {workOrder}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6">
                                            <Form.Group className="mb-3" controlId="formPartName">
                                                <Form.Label>Part Name</Form.Label>
                                                <Form.Control type="text" required placeholder="Enter Part Name" name="partName" value={partName} onChange={(e) => setPartName(e.target.value)} />
                                            </Form.Group>
                                        </div>
                                        <div className="col-md-6">
                                            <Form.Group className="mb-3" controlId="formProjectDetails">
                                                <Form.Label>Project Details</Form.Label>
                                                <Form.Control type="text" required placeholder="Enter Project Details" name="projectDetails" value={projectDetials} onChange={(e) => setProjectDetails(e.target.value)} />
                                            </Form.Group>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6">
                                            <Form.Group className="mb-3" controlId="formBomDate">
                                                <Form.Label>Date</Form.Label>
                                                <Form.Control type="date" required placeholder="Select Date" name="bomDate" />
                                            </Form.Group>
                                        </div>
                                        <div className="col-md-6">
                                            <Form.Group className="mb-3" controlId="formRevisionNumber">
                                                <Form.Label>Revision Number</Form.Label>
                                                <Form.Control type="text" required placeholder="Enter Revision Number" name="revisionNumber" />
                                            </Form.Group>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6">
                                            <Form.Group className="mb-3" controlId="formDieDetails">
                                                <Form.Label>Die Details</Form.Label>
                                                <Form.Control type="text" required placeholder="Enter Die Details" name="dieDetails" value={dieDetails}   onChange={(e) => setDieDetails(e.target.value)}/>
                                            </Form.Group>
                                        </div>
                                    </div>


                                    {/* Categories */}

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
                                                                                        placeholder="Enter Item Number"
                                                                                        value={rowsByCategory[title]?.[rowIdx]?.itemNo || ""}
                                                                                        onChange={(e) =>
                                                                                            handleInputChangeCategories(
                                                                                                title,
                                                                                                rowIdx,
                                                                                                "itemNo",
                                                                                                e.target.value
                                                                                            )
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
                                                                                        value={
                                                                                            rowsByCategory[title]?.[rowIdx]?.itemDescription ||
                                                                                            ""
                                                                                        }
                                                                                        onChange={(e) =>
                                                                                            handleInputChangeCategories(
                                                                                                title,
                                                                                                rowIdx,
                                                                                                "itemDescription",
                                                                                                e.target.value
                                                                                            )
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
                                                                                        type="text"
                                                                                        placeholder="Material"
                                                                                        value={rowsByCategory[title]?.[rowIdx]?.matl || ""}
                                                                                        onChange={(e) =>
                                                                                            handleInputChangeCategories(
                                                                                                title,
                                                                                                rowIdx,
                                                                                                "matl",
                                                                                                e.target.value
                                                                                            )
                                                                                        }
                                                                                    />
                                                                                </Form.Group>
                                                                            )}

                                                                            {item === "FINISH SIZE" && (
                                                                                <Form.Group controlId={`finishSize-${title}-${rowIdx}-${idx}`}>
                                                                                    <Form.Label>Finish Size</Form.Label>
                                                                                    <div className="d-flex gap-2">
                                                                                        <Form.Control type="number" placeholder="L" name="finishSizeLength" value={rowsByCategory[title]?.[rowIdx]?.finishSizeLength || ""}
                                                                                            onChange={(e) =>
                                                                                                handleInputChangeCategories(
                                                                                                    title,
                                                                                                    rowIdx,
                                                                                                    "finishSizeLength",
                                                                                                    e.target.value
                                                                                                )
                                                                                            } />
                                                                                        <Form.Control type="number" placeholder="W" name="finishSizeWidth" value={rowsByCategory[title]?.[rowIdx]?.finishSizeWidth || ""}
                                                                                            onChange={(e) =>
                                                                                                handleInputChangeCategories(
                                                                                                    title,
                                                                                                    rowIdx,
                                                                                                    "finishSizeWidth",
                                                                                                    e.target.value
                                                                                                )
                                                                                            } />
                                                                                        <Form.Control type="number" placeholder="H" name="finishSizeHeight" value={rowsByCategory[title]?.[rowIdx]?.finishSizeHeight || ""}
                                                                                            onChange={(e) =>
                                                                                                handleInputChangeCategories(
                                                                                                    title,
                                                                                                    rowIdx,
                                                                                                    "finishSizeHeight",
                                                                                                    e.target.value
                                                                                                )
                                                                                            } />
                                                                                    </div>
                                                                                </Form.Group>
                                                                            )}

                                                                            {item === "RAW SIZE" && (
                                                                                <Form.Group controlId={`rawSize-${title}-${rowIdx}-${idx}`}>
                                                                                    <Form.Label>Raw Size</Form.Label>
                                                                                    <div className="d-flex gap-2">
                                                                                        <Form.Control type="number" placeholder="L" name="rawSizeLength" value={rowsByCategory[title]?.[rowIdx]?.rawSizeLength || ""}
                                                                                            onChange={(e) =>
                                                                                                handleInputChangeCategories(
                                                                                                    title,
                                                                                                    rowIdx,
                                                                                                    "rawSizeLength",
                                                                                                    e.target.value
                                                                                                )
                                                                                            } />
                                                                                        <Form.Control type="number" placeholder="W" name="rawSizeWidth" value={rowsByCategory[title]?.[rowIdx]?.rawSizeWidth || ""}
                                                                                            onChange={(e) =>
                                                                                                handleInputChangeCategories(
                                                                                                    title,
                                                                                                    rowIdx,
                                                                                                    "rawSizeWidth",
                                                                                                    e.target.value
                                                                                                )
                                                                                            } />
                                                                                        <Form.Control type="number" placeholder="H" name="rawSizeHeight" value={rowsByCategory[title]?.[rowIdx]?.rawSizeHeight || ""}
                                                                                            onChange={(e) =>
                                                                                                handleInputChangeCategories(
                                                                                                    title,
                                                                                                    rowIdx,
                                                                                                    "rawSizeHeight",
                                                                                                    e.target.value
                                                                                                )
                                                                                            } />
                                                                                    </div>
                                                                                </Form.Group>
                                                                            )}


                                                                            {item === "QTY" && (
                                                                                <Form.Group controlId={`qty-${title}-${rowIdx}-${idx}`}>
                                                                                    <Form.Label>Quantity</Form.Label>
                                                                                    <Form.Control type="number" placeholder="Quantity" name="quantity" value={rowsByCategory[title]?.[rowIdx]?.quantity || ""}
                                                                                        onChange={(e) =>
                                                                                            handleInputChangeCategories(
                                                                                                title,
                                                                                                rowIdx,
                                                                                                "quantity",
                                                                                                e.target.value
                                                                                            )
                                                                                        } />
                                                                                </Form.Group>
                                                                            )}

                                                                            {item === "MODEL WT" && (
                                                                                <Form.Group controlId={`modelWt-${title}-${rowIdx}-${idx}`}>
                                                                                    <Form.Label>Model Weight</Form.Label>
                                                                                    <Form.Control type="number" placeholder="Model Weight" name="modelWeight" value={rowsByCategory[title]?.[rowIdx]?.modelWeight || ""}
                                                                                        onChange={(e) =>
                                                                                            handleInputChangeCategories(
                                                                                                title,
                                                                                                rowIdx,
                                                                                                "modelWeight",
                                                                                                e.target.value
                                                                                            )
                                                                                        } />
                                                                                </Form.Group>
                                                                            )}

                                                                            {item === "ORDERING REMARKS" && (
                                                                                <Form.Group controlId={`orderingRemarks-${title}-${rowIdx}-${idx}`}>
                                                                                    <Form.Label>Ordering Remarks</Form.Label>
                                                                                    <Form.Control type="text" placeholder="Ordering Remarks" name="orderingRemarks" value={rowsByCategory[title]?.[rowIdx]?.orderingRemarks || ""}
                                                                                        onChange={(e) =>
                                                                                            handleInputChangeCategories(
                                                                                                title,
                                                                                                rowIdx,
                                                                                                "orderingRemarks",
                                                                                                e.target.value
                                                                                            )
                                                                                        } />
                                                                                </Form.Group>
                                                                            )}
                                                                            {item === "BOUGHT OUT ITEMS" && (
                                                                                <Form.Group controlId={`boughtOutItems-${title}-${rowIdx}-${idx}`}>
                                                                                    <Form.Label>Bought Out Items</Form.Label>
                                                                                    <Form.Control type="text" placeholder="Bought Out Items" name="boughtOutItems" value={rowsByCategory[title]?.[rowIdx]?.boughtOutItems || ""}
                                                                                        onChange={(e) =>
                                                                                            handleInputChangeCategories(
                                                                                                title,
                                                                                                rowIdx,
                                                                                                "boughtOutItems",
                                                                                                e.target.value
                                                                                            )
                                                                                        } />
                                                                                </Form.Group>
                                                                            )}

                                                                            {item === "BOUGHT OUT QTY" && (
                                                                                <Form.Group controlId={`boughtOutQty-${title}-${rowIdx}-${idx}`}>
                                                                                    <Form.Label>Bought Out Qty</Form.Label>
                                                                                    <Form.Control type="number" placeholder="Quantity" name="boughtOutQuantity" value={rowsByCategory[title]?.[rowIdx]?.boughtOutQuantity || ""}
                                                                                        onChange={(e) =>
                                                                                            handleInputChangeCategories(
                                                                                                title,
                                                                                                rowIdx,
                                                                                                "boughtOutQuantity",
                                                                                                e.target.value
                                                                                            )
                                                                                        } />
                                                                                </Form.Group>
                                                                            )}

                                                                            {item === "SPECIFICATION" && (
                                                                                <Form.Group controlId={`specification-${title}-${rowIdx}-${idx}`}>
                                                                                    <Form.Label>Specification</Form.Label>o
                                                                                    <Form.Control type="text" placeholder="Specification" name="specification" value={rowsByCategory[title]?.[rowIdx]?.specification || ""} onChange={(e) =>
                                                                                        handleInputChangeCategories(
                                                                                            title,
                                                                                            rowIdx,
                                                                                            "specification",
                                                                                            e.target.value
                                                                                        )
                                                                                    } />
                                                                                </Form.Group>
                                                                            )}



                                                                            {item === "SEC." && (
                                                                                <Form.Group controlId={`sec-${title}-${rowIdx}-${idx}`}>
                                                                                    <Form.Label>Section</Form.Label>
                                                                                    <Form.Control type="text" placeholder="Section" name="section" value={rowsByCategory[title]?.[rowIdx]?.section || ""} onChange={(e) =>
                                                                                        handleInputChangeCategories(
                                                                                            title,
                                                                                            rowIdx,
                                                                                            "section",
                                                                                            e.target.value
                                                                                        )
                                                                                    } />
                                                                                </Form.Group>
                                                                            )}


                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>







                                    <Button variant="primary" type="submit">
                                        Save Changes
                                    </Button>
                                </Form>
                            </div>
                            {/* close form div */}

                        </div>
                        <div>



                        </div>

                    </div>


                </div>
            </div>
        </>
    );
};

export default BOMCreatePage;
