import React,{useState} from "react";
import CompanyTopbar from "../CompanyTopbar";
import CompanySidebar from "../CompanySidebar";
import CreateWorkOrder from "./CreateWorkOrder";
import "./WorkOrder.css";

const WorkOrderList = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const handleToggle = () => {
        setIsCollapsed(!isCollapsed);
    };
    const [showModal, setShowModal] = useState(false);

    const handleSaveWorkOrder = () => {
        setShowModal(false);
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
                                placeholder="Search...."
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
                                    <th>Item Number	</th>
                                    <th>Customer</th>
                                    <th>Project</th>
                                    <th>Part View</th>
                                    <th>Part Name</th>
                                    <th>Material</th>
                                    <th>Thikness</th>
                                    <th>Process count</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colSpan="8" className="text-center">
                                        Work Order Not Found
                                    </td>
                                </tr>
                            </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <CreateWorkOrder
                show={showModal}
                onClose={() => setShowModal(false)}
                onSave={handleSaveWorkOrder}
            />

        </div>
        
    );
}
export default WorkOrderList;