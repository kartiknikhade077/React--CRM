import React,{useEffect, useState} from "react";
import CompanyTopbar from "../CompanyTopbar";
import CompanySidebar from "../CompanySidebar";
import CreateWorkOrder from "./CreateWorkOrder";
import "./WorkOrder.css";
import PaginationComponent from "../../Pagination/PaginationComponent";
import axiosInstance from "../../BaseComponet/axiosInstance";
import EditWorkOrder from "./EditWorkOrder";

const WorkOrderList = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [workOrder, setWorkOrder] = useState([]);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(50);
    const [totalPages, setTotalPages] = useState(0);
    const [editModalVisible,setEditModalVisible] = useState(false);
    const [selectedWorkOrderId,setSelectedWorkOrderId] = useState(false);


    useEffect(() => {
        fetchWorkOrder(page, size);
    }, [page, size]);

    const handleToggle = () => {
        setIsCollapsed(!isCollapsed);
    };

    const handleSaveWorkOrder = () => {
        fetchWorkOrder(page, size);
        setShowModal(false);
    };

    const fetchWorkOrder = async (page, size) => {
        try {
            const response = await axiosInstance.get(`/work/getAllWorkOrders/${page}/${size}`);
            setWorkOrder(response.data.workOrderList);
            setTotalPages(response.data.totalPages);
            
        } catch (error) {
            console.error("Failed to fetch Leads:", error);
        }
    };

    const searchWorkOrder = async (search) => {
        try {
            const response = await axiosInstance.get(`/work/getAllWorkOrders/${page}/${size}?customerName=${search}`);
            setWorkOrder(response.data.workOrderList);
            setTotalPages(response.data.totalPages);


        } catch (error) {
            console.error("Failed to fetch Leads:", error);
        }
    };

    const handleEditClick = (workOrder) => {
        setSelectedWorkOrderId(workOrder);
        setEditModalVisible(true);

    };

    const handleUpdateWorkOrder = () => {
        fetchWorkOrder(page, size);
        setEditModalVisible(false);
    };

    return (
        <div>
            <CompanyTopbar onToggle={handleToggle   } />
            <div className="slidebar-main-div">
                <CompanySidebar isCollapsed={isCollapsed} />
                <div className="slidebar-main-div-right-section">
                    <div className="Companalist-main-card">
                        <div className="row m-0 p-0 w-100 d-flex justify-content-between mb-2">
                            <div className="col-md-3">
                                <h4>Work Orders</h4>
                            </div>
                            <div className="col-md-3">
                                <div className="input-group">
                                    <span className="input-group-text bg-white border-end-0">
                                        <i className="bi bi-search"></i>
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control border-start-0"
                                        placeholder="Search by custumer name...."
                                        onKeyUp={(e) => searchWorkOrder(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-md-6 d-flex justify-content-end">
                                <button
                                    className="btn btn-dark"
                                    onClick={() => setShowModal(true)}
                                >
                                    + Create Work Order
                                </button>
                            </div>
                        </div>

                        <div className="table-main-div">
                            <table className="table table-hover align-middle">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Item Number	</th>
                                    <th>Customer</th>
                                    <th>Project</th>
                                    <th>Part Size</th>
                                    <th>Part Name</th>
                                    <th>Material</th>
                                    <th>Thikness</th>
                                    <th>Edit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {workOrder.length > 0 ? (
                                workOrder.map((workOrder, index) => (
                                    <tr key={workOrder.workOrderId}>
                                        <td>{index + 1}</td>
                                        <td>{workOrder.itemNo}</td>
                                        <td>{workOrder.customerName}</td>
                                        <td>{workOrder.partName}</td>
                                        <td>{workOrder.partSize}</td>
                                        <td>{workOrder.partName}</td>
                                        <td>{workOrder.material}</td>
                                        <td>{workOrder.thickness}</td>
                                        <td>
                                            <button
                                                className="btn btn-outline-primary btn-sm"
                                                onClick={() => handleEditClick(workOrder.workOrderId)}
                                                >
                                                <i className="bi bi-pencil-square"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                                ) : (
                                <tr>
                                    <td colSpan="8" className="text-center">
                                        Work Order Not Found
                                    </td>
                                </tr>
                                )}
                            </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="pagination-main-crd">
                        <PaginationComponent
                            currentPage={page}
                            pageSize={size}
                            pageCount={totalPages}
                            onPageChange={(newPage) => setPage(newPage)}
                            onPageSizeChange={(newSize) => {
                                setSize(newSize);
                                setPage(0);
                            }}
                        />
                    </div>
                </div>
            </div>
            <CreateWorkOrder
                show={showModal}
                onClose={() => setShowModal(false)}
                onSave={handleSaveWorkOrder}
            />

            <EditWorkOrder
                show={editModalVisible}
                workOrderId={selectedWorkOrderId}
                onClose={() => setEditModalVisible(false)}
                onUpdate={handleUpdateWorkOrder}
                
            />


        </div>
        
    );
}
export default WorkOrderList;