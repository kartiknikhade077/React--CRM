import React, { useEffect, useState } from "react";
import CompanyTopbar from "../CompanyTopbar";
import CompanySidebar from "../CompanySidebar";
import PaginationComponent from "../../Pagination/PaginationComponent";
import "./Quotation.css";
import CreateQuotation from "./CreateQuotation";

const QuotationList = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(50);
    const [totalPages, setTotalPages] = useState(0);
    const [view, setView] = useState('list');

    const handleToggle = () => {
        setIsCollapsed(!isCollapsed);
    };

    const handleSave = () => {
        console.log("Save action triggered");
        setView('list');
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
            
            case 'list':
            default:
                return (
                    <>
                        <div className="Companalist-main-card">
                            <div className="row m-0 p-0 w-100 d-flex justify-content-between mb-2">
                                <div className="col-md-3">
                                    <h4>Quotations</h4>
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
                                            onKeyUp=""
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6 d-flex justify-content-end">
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
                                    <thead>
                                        <tr>
                                            <th>Quotation #</th>
                                            <th>Subject</th>
                                            <th>To</th>
                                            <th>Total</th>
                                            <th>Date</th>
                                            <th>Open Till</th>
                                            <th>Tags</th>
                                            <th>Date Created</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
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
                </div>
            </div>
        </div>
    );
}

export default QuotationList;