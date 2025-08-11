import React, { useEffect, useState } from "react";
import CompanySidebar from "../CompanySidebar";
import CompanyTopbar from "../CompanyTopbar";
import PaginationComponent from "../../Pagination/PaginationComponent";
import axiosInstance from "../../BaseComponet/axiosInstance";
import Button from "react-bootstrap/Button";
import { useNavigate } from "react-router-dom";
import BOMPDFModal from "./BOMPDFModal";
const BOMList = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [pageCount, setPageCount] = useState(0);
    const [BOMListDetails, setBOMListDetails] = useState([]);
    const [showPdf, setShowPdf] = useState(false);
    const [selectedBomId, setSelectedBomId] = useState("");
    const navigate = useNavigate(); // ✅ useNavigate hook
    const handleToggle = () => {
        setIsCollapsed(!isCollapsed);
    };

    useEffect(() => {
        fetchBOMList();
    }, [currentPage, pageSize]);



    const fetchBOMList = async () => {
        try {
            const response = await axiosInstance.get(`/kickoff/getAllBOMs/${currentPage}/${pageSize}`);
            const data = response.data;

            setBOMListDetails(data.BOMInfoList || []);
            setPageCount(data.totalPages || 1);
        } catch (error) {
            console.error("Error fetching projects:", error);
        }
    };

    const navigateToCreteBOM = () => {
        navigate("/CreateBOM"); // ✅ navigate on button click
    };


    const editBOM = (bomId) => {
        navigate("/EditBOM", { state: { bomId } });
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
                                <h4>BOM List</h4>
                            </div>
                            <div className="col-md-3 d-flex justify-content-end">
                                <Button
                                    className="btn btn-dark"
                                    onClick={() => navigateToCreteBOM()}
                                >
                                    Create BOM
                                </Button>
                            </div>
                        </div>

                        <div className="table-main-div">

                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr>

                                        <th>Customer </th>
                                        <th>Project</th>
                                        <th>WO No</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {BOMListDetails.length > 0 ? (
                                        BOMListDetails.map((BOM) => (
                                            <tr key={BOM.bomId}>
                                                <td>{BOM.customerName}</td>
                                                <td>{BOM.projectName}</td>
                                                <td>{BOM.workOrderNo}</td>


                                                <td className="text-end">
                                                    <button
                                                        className="btn btn-outline-primary btn-sm"
                                                        onClick={() => {
                                                            editBOM(BOM.bomId);

                                                        }}
                                                    >
                                                        <i className="bi bi-pencil-square"></i>
                                                    </button>
                                                    <div>
                                                        <button
                                                            className="btn btn-outline-primary btn-sm"
                                                            onClick={() => {
                                                                setSelectedBomId(BOM.bomId);
                                                                setShowPdf(true);
                                                            }}
                                                        >
                                                            <i className="bi bi-eye"></i> Preview PDF
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="text-center">
                                                No BOM found.
                                            </td>
                                        </tr>
                                    )}

                                </tbody>
                            </table>

                        </div>
                    </div>

                    <div className="pagination-main-crd">
                        <PaginationComponent
                            currentPage={currentPage}
                            pageSize={pageSize}
                            pageCount={pageCount}
                            onPageChange={setCurrentPage}
                            onPageSizeChange={(size) => {
                                setCurrentPage(0);
                                setPageSize(size);
                            }}
                        />
                    </div>

                    {/* Render the modal just once */}
                    {showPdf && (
                        <BOMPDFModal
                            show={showPdf}
                            onClose={() => setShowPdf(false)}
                            bomId={selectedBomId}
                        />
                    )}
                </div>
            </div>
        </>)
}

export default BOMList;