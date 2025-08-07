import React, { useEffect, useState } from "react";
import CompanySidebar from "../CompanySidebar";
import CompanyTopbar from "../CompanyTopbar";
import CreateChecklistSheet from "./CreateChecklistSheet";
import PaginationComponent from "../../Pagination/PaginationComponent";
import axiosInstance from "../../BaseComponet/axiosInstance";
import { toast } from "react-toastify";
import EditChecklistSheet from "./EditChecklistSheet";
const ChecklistSheetList = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [checklistForm, setChecklistForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [pageCount, setPageCount] = useState(0);
  const [checklists, setChecklists] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [formMode, setFormMode] = useState(null);
  const [editChecklistId, setEditChecklistId] = useState(null);


  useEffect(() => {
    fetchChecklists(currentPage, pageSize, searchTerm);
  }, [currentPage, pageSize, searchTerm]);

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  const fetchChecklists = async (page = 0, size = 10, projectName = "") => {
    try {
      const response = await axiosInstance.get(
        `/kickoff/getAllCheckList/${page}/${size}?projectName=${projectName}`
      );
      const { allCheckList, totalPages, currentPage } = response.data;

      setChecklists(allCheckList);
      setPageCount(totalPages);
      setCurrentPage(currentPage);
    } catch (error) {
      console.error("Error fetching checklists:", error);
    }
  };

  const handleEditClick = (checkListId) => {
    setFormMode("edit");
    setEditChecklistId(checkListId);
  };

  const handleCreateClick = () => {
    setFormMode("create");
    setEditChecklistId(null);
    setChecklistForm(true);
  }

  const handleFormClose = () => {
    setFormMode(null);
    setEditChecklistId(null);
  };

  const handleFormSave = () => {
    setFormMode(null);
    setEditChecklistId(null);
    fetchChecklists(currentPage, pageSize, searchTerm);
  };


  const handleDeleteClick = async (checkListId) => {
    if (window.confirm("Are you sure you want to delete this checklist?")) {
      const response = await axiosInstance.delete(`/kickoff/deleteCheckList/${checkListId}`);
      if (response.status === 200) {
        toast.success("Checklist deleted successfully");
        fetchChecklists(currentPage, pageSize, searchTerm);
      } else {
        toast.error("Failed to delete checklist");
      }
    }
  }

  return (
    <div>
      <CompanyTopbar onToggle={handleToggle} />
      <div className="slidebar-main-div">
        <CompanySidebar isCollapsed={isCollapsed} />
        <div className="slidebar-main-div-right-section">
          {formMode === "create" && (
              <CreateChecklistSheet
                onClose={handleFormClose}
                onSave={handleFormSave}
              />
            )}

            {(formMode === "edit" && editChecklistId) ? (
              <EditChecklistSheet
                checkListId={editChecklistId}
                onClose={handleFormClose}
                onUpdate={handleFormSave}
              />
            ) : formMode === null && (
            <div className="Checklist-sheet-list-container">
              <div className="Companalist-main-card">
                <div className="row m-0 p-0 w-100 d-flex justify-content-between mb-2">
                  <div className="col-md-3">
                    <h4>Checklist-sheet</h4>
                  </div>
                  <div className="col-md-3">
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0">
                        <i className="bi bi-search"></i>
                      </span>
                      <input
                          type="text"
                          className="form-control border-start-0"
                          placeholder="Search by project name..."
                          value={searchTerm}
                          onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(0); // Reset page on new search
                          }}
                        />
                    </div>
                  </div>
                  <div className="col-md-6 d-flex justify-content-end">
                    <button
                      className="btn btn-dark me-1"
                      onClick={handleCreateClick}
                    >
                      + Create Checklist Sheet
                    </button>
                  </div>
                </div>

                <div className="table-main-div">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th>WO No</th>
                        <th>Customer Name</th>
                        <th>Project</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {checklists.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center">No checklist found.</td>
                        </tr>
                      ) : (
                        checklists.map((item) => (
                          <tr key={item.checkListId}>
                            <td>{item.workOrderNumber}</td>
                            <td>{item.customerName}</td>
                            <td>{item.projectName}</td>
                            <td>
                              <button
                                  className="btn btn-outline-primary btn-sm me-1"
                                  onClick={() => handleEditClick(item.checkListId)}
                                  >
                                  <i className="bi bi-pencil-square"></i>
                              </button>

                              <button
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => handleDeleteClick(item.checkListId)}
                              >
                                  <i className="bi bi-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))
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
                    onPageChange={(page) => setCurrentPage(page)}
                    onPageSizeChange={(size) => {
                      setPageSize(size);
                      setCurrentPage(0);
                    }}
                  />
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChecklistSheetList;
