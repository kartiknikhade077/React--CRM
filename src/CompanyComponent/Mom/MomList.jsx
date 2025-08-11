import React, { useEffect, useState } from "react";
import CompanySidebar from "../CompanySidebar";
import CompanyTopbar from "../CompanyTopbar";
import PaginationComponent from "../../Pagination/PaginationComponent";
import CreateMom from "./CreateMom";
import EditMom from "./EditMom";
import "./Mom.css";
import axiosInstance from "../../BaseComponet/axiosInstance";
import { toast } from "react-toastify";
const MomList = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(50);
  const [totalPages, setTotalPages] = useState(0);
  const [formMode, setFormMode] = useState(null);
  const [editId, setEditId] = useState(null);
  const [momList, setMomList] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMomList = async (page, size) => {
    try {
      const response = await axiosInstance.get(`/kickoff/getMOMList/${page}/${size}`);
      const data = response.data;
      setMomList(data.MOMInfosList || []);
      setTotalPages(data.totalPages || 0);

    } catch (error) {
      console.error("Failed to fetch MOM list:", error);
      setMomList([]);
      setTotalPages(0);
    }
  };

  const searchMomList = async (search) => {
    console.log("Searching MOMs with term:", search);
    try {
      const response = await axiosInstance.get(`/kickoff/getMOMList/${page}/${size}?projectName=${search}`);
      const data = response.data;
      console.log("Search results:", data);
      setMomList(data.MOMInfosList || []);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error("Failed to search MOM list:", error);
      toast.error("Failed to search MOMs. Please try again.");
      setMomList([]);
      setTotalPages(0);
    }
  }

  useEffect(() => {
    if (formMode === null) {
      fetchMomList(page, size);
    }
  }, [page, size, formMode]); 

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleEditClick = (checkListId) => {
    setFormMode("edit");
    setEditId(checkListId);
  };

  const handleCreateClick = () => {
    setFormMode("create");
    setEditId(null);
  }

  const handleFormClose = () => {
    setFormMode(null);
    setEditId(null);
  };

  const handleFormSave = () => {
    setFormMode(null);
    setEditId(null);
    fetchMomList(page, size);
  };

  const handleDeleteClick = async (momId) => {
      const confirmDelete = window.confirm("Are you sure you want to delete this mom?");
      if (!confirmDelete) return;

      try {
          await axiosInstance.delete(`/kickoff/deleteMom/${momId}`);
          toast.success("Work Order deleted successfully.");
          fetchMomList(page, size);
      } catch (error) {
          console.error("Failed to delete work order:", error);
          toast.error("Failed to delete. Please try again.");
      }
  };

  return (
    <div>
      <CompanyTopbar onToggle={handleToggle} />
      <div className="slidebar-main-div">
        <CompanySidebar isCollapsed={isCollapsed} />
        <div className="slidebar-main-div-right-section">
          {/* Conditional Rendering for Forms and List */}

          {formMode === "create" && (
            <CreateMom onClose={handleFormClose} onSave={handleFormSave} />
          )}

          {formMode === "edit" && editId && (
            <EditMom onClose={handleFormClose} onUpdate={handleFormSave} momId={editId} />
          )}
          
          {formMode === null && (
            // --- Main List View ---
            <div className="Checklist-sheet-list-container">
              <div className="Companalist-main-card">
                <div className="row m-0 p-0 w-100 d-flex justify-content-between mb-2">
                  <div className="col-md-3">
                    <h4>MOM</h4>
                  </div>
                  <div className="col-md-4">
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0">
                        <i className="bi bi-search"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0"
                        placeholder="Search by project name..."
                        onKeyUp={(e) => {
                          searchMomList(e.target.value);
                          setPage(0); 
                        }}
                      />
                    </div>
                  </div>
                  <div className="col-md-5 d-flex justify-content-end">
                    <button
                      className="btn btn-dark"
                      onClick={handleCreateClick}
                    >
                      + Create Sheet
                    </button>
                  </div>
                </div>

                <div className="table-main-div">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Customer Name</th>
                        <th>Project</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="5" className="text-center">Loading...</td>
                        </tr>
                      ) : momList.length > 0 ? (
                        momList.map((mom, index) => (
                          <tr key={mom.momId}>
                            <td>{page * size + index + 1}</td>
                            <td>{mom.customerName}</td>
                            <td>{mom.projectName}</td>
                            <td>{mom.createdDate}</td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleEditClick(mom.momId)}
                              >
                                <i className="bi bi-pencil-square"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger ms-2"
                                onClick={()=>handleDeleteClick(mom.momId)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center">No MOMs found.</td>
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
                  onPageChange={(page) => setPage(page)}
                  onPageSizeChange={(size) => {
                    setSize(size);
                    setPage(0);
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

export default MomList;
