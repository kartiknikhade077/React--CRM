import React, { useEffect, useState } from "react";
import CompanyTopbar from "../CompanyTopbar";
import CompanySidebar from "../CompanySidebar";
import PaginationComponent from "../../Pagination/PaginationComponent";
import "./Quotation.css";
import CreateQuotation from "./CreateQuotation";
import axiosInstance from "../../BaseComponet/axiosInstance"; // Assuming this is your configured axios
import { toast } from "react-toastify";
import EditQuotation from "./EditQuotation";
import QuotationPDFModel from "./QuotationPDFModel";

const QuotationList = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [view, setView] = useState('list');
    
    // State for the list, loading, and search
    const [quotations, setQuotations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const [selectedQuotationId, setSelectedQuotationId] = useState(null);

    const [showPdfModal, setShowPdfModal] = useState(false);
    const [selectedQuotationIdForPdf, setSelectedQuotationIdForPdf] = useState(null);


    // Function to fetch quotations from the API
    const fetchQuotations = async () => {
        setIsLoading(true);
        try {
            const companyName = searchTerm || ""; 
            const response = await axiosInstance.get(`/sales/getAllQuotation/${page}/${size}?companyName=${companyName}`);
            
            // The API response nests the list under "projectList"
            setQuotations(response.data.projectList || []);
            setTotalPages(response.data.totalPages || 0);

        } catch (error) {
            console.error("Failed to fetch quotations:", error);
            toast.error("Failed to load quotations. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (view === 'list') {
            fetchQuotations();
        }
    }, [page, size, view]);

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
        setPage(0);
    };
    
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (view === 'list') {
                 fetchQuotations();
            }
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);


    const handleToggle = () => {
        setIsCollapsed(!isCollapsed);
    };

    const handleSave = () => {
        console.log("Save action triggered");
        setView('list');
        fetchQuotations();
    };

    const handleEditClick = (id) => {
        setSelectedQuotationId(id);
        setView('edit');
    };

    const handleCancel = () => {
        setView('list');
        setSelectedQuotationId(null);
    }

    const handlePreviewClick = (quotationId) => {
        setSelectedQuotationIdForPdf(quotationId);
        setShowPdfModal(true);
    };
    
    // Helper function to format dates
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const renderView = () => {
        switch (view) {
            case 'create':
                return (
                    <div className="p-4">
                        <CreateQuotation 
                            onCancel={() => setView('list')}
                            onSave={handleSave}
                        />
                    </div>
                );

            case 'edit':
                return (
                    <div className="p-4">
                        <EditQuotation 
                            quotationId={selectedQuotationId}
                            onCancel={handleCancel}
                            onSave={handleSave}
                        />
                    </div>
                );
            
            case 'list':
            default:
                return (
                    <>
                        <div className="Companalist-main-card">
                            <div className="row m-0 p-0 w-100 d-flex justify-content-between align-items-center mb-2">
                                <div className="col-md-3">
                                    <h4>Quotations</h4>
                                </div>
                                <div className="col-md-4">
                                    <div className="input-group">
                                        <span className="input-group-text bg-white border-end-0">
                                            <i className="bi bi-search"></i>
                                        </span>
                                        <input
                                            type="text"
                                            className="form-control border-start-0"
                                            placeholder="Search by Company Name..."
                                            value={searchTerm}
                                            onChange={handleSearch}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-5 d-flex justify-content-end">
                                    <button
                                        className="btn btn-dark me-1"
                                        onClick={() => setView('create')}
                                    >
                                        + Add Quotation
                                    </button>
                                </div>
                            </div>
                            <div className="table-main-div">
                                <table className="table table-hover align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Quotation #</th>
                                            <th>Customer Name</th>
                                            <th>Project Name</th>
                                            <th>Date</th>
                                            <th>Open Till</th>
                                            <th>Date Created</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan="9" className="text-center">Loading...</td>
                                            </tr>
                                        ) : quotations.length > 0 ? (
                                            quotations.map(q => (
                                                <tr key={q.quotationId}>
                                                    <td>{q.quotationNumber || '-'}</td>
                                                    <td>{q.companyName || '-'}</td>
                                                    <td>{q.projectName || '-'}</td>
                                                    <td>{formatDate(q.quotationDate)}</td>
                                                    <td>{formatDate(q.validDate)}</td>
                                                    <td>{formatDate(q.createdDateTime)}</td>
                                                    <td className="text-capitalize">
                                                        <span className="badge bg-secondary">{'Draft'}</span> {/* Not in API response */}
                                                    </td>
                                                    <td>
                                                        <button 
                                                            className="btn btn-sm btn-outline-primary"
                                                            onClick={() => handleEditClick(q.quotationId)}
                                                        >
                                                            <i className="bi bi-pencil-square me-1"></i>
                                                        </button>
                                                        <button 
                                                            className="btn btn-sm btn-outline-primary ms-2"
                                                            onClick={() => handlePreviewClick(q.quotationId)}
                                                        >
                                                            <i className="bi bi-eye"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="9" className="text-center">No quotations found.</td>
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
                    </>
                );
        }
    };

    return (
        <div>
            <CompanyTopbar onToggle={handleToggle} />
            <div className="slidebar-main-div">
                <CompanySidebar isCollapsed={isCollapsed} />
                <div className="slidebar-main-div-right-section">
                    {renderView()}
                    
                    {showPdfModal && (
                        <QuotationPDFModel
                            show={showPdfModal}
                            onClose={() => setShowPdfModal(false)}
                            quotationId={selectedQuotationIdForPdf}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default QuotationList;