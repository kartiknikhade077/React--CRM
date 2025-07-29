import React, { useEffect, useState } from "react";
import axiosInstance from "../../BaseComponet/axiosInstance";
import PaginationComponent from "../../Pagination/PaginationComponent";
import { Button } from "react-bootstrap";
import CompanySidebar from "../CompanySidebar";
import CompanyTopbar from "../CompanyTopbar";
import CreateLead from "./CreateLead";
import EditLead from "./EditLead";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const LeadsList = () => {
  const [leads, setLeads] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(50);
  const [totalPages, setTotalPages] = useState(0);
  const [columnSequence, setColumnSequence] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleEditClick = (lead) => {
    setSelectedLead(lead);
    setShowEditModal(true);
  };

  const handleUpdateLead = async () => {
    setShowEditModal(false);
    fetchLeads(page, size);
  };

  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Fetch leads and column configuration
  useEffect(() => {
    fetchLeads(page, size);
  }, [page, size]);

  const fetchLeads = async (page, size) => {
    try {
      const response = await axiosInstance.get(
        `/lead/getAllLeads/${page}/${size}`
      );
      setLeads(response.data.leadList);
      setTotalPages(response.data.totalPages);
      setColumnSequence(response.data.columnSequence); // Column config from backend
    } catch (error) {
      console.error("Failed to fetch Leads:", error);
    }
  };

  // Save lead with updated columns and lead data
  const handleSaveLead = async () => {
    try {
      setShowModal(false);
      fetchLeads(page, size); // Refresh lead list
    } catch (error) {
      console.error("Error saving lead:", error);
    }
  };

  const searchLeads = async (search) => {
    try {
      const response = await axiosInstance.get(
        `/lead/getAllLeads/${page}/${size}?name=${search}`
      );
      setLeads(response.data.leadList);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error saving lead:", error);
    }
  };

  // Handle Column Dragging
  const handleColumnDragEnd = (result) => {
    if (!result.destination) return;

    // Step 1: Clone the current array
    const reordered = Array.from(columnSequence);

    // Step 2: Remove and store the dragged column
    const [moved] = reordered.splice(result.source.index, 1);

    // Step 3: Insert the dragged column at the new position
    reordered.splice(result.destination.index, 0, moved);

    // Step 4: Update the sequence numbers
    const updatedColumns = reordered.map((col, idx) => ({
      ...col,
      sequence: idx + 1, // Fix sequence
    }));

    // Step 5: Update the state with new sequence
    setColumnSequence(updatedColumns);

    // Step 6: Persist the updated sequence in backend
    updateColumnSequence(updatedColumns);
  };

  const updateColumnSequence = async (columns) => {
    try {
      await axiosInstance.put("/lead/leadColumnSequence", columns);
    } catch (error) {
      console.error("Failed to update column sequence:", error);
    }
  };

  return (
    <div>
      <CompanyTopbar onToggle={handleToggle} />
      <div className="slidebar-main-div">
        <CompanySidebar isCollapsed={isCollapsed} />
        <div className="slidebar-main-div-right-section">
          <div className="Companalist-main-card">
            <div className="row m-0 p-0 w-100 d-flex justify-content-between mb-2">
              <div className="col-md-3">
                <h4>Lead</h4>
              </div>
              <div className="col-md-3">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <i className="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search..."
                    onKeyUp={(e) => searchLeads(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-6 d-flex justify-content-end">
                <button className="btn btn-dark">+ Source</button>
                <button className="btn btn-dark mx-1">+ Status</button>
                <button
                  className="btn btn-dark"
                  onClick={() => setShowModal(true)}
                >
                  + Lead
                </button>
              </div>
            </div>

            {/* Lead Table */}
            <div className="table-main-div">
              <table className="table table-hover align-middle">
                <DragDropContext onDragEnd={handleColumnDragEnd}>
                  <Droppable droppableId="columns" direction="horizontal">
                    {(provided) => (
                      <thead
                        className="table-light"
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        <tr>
                          <th>#</th>
                          <th>Created Date</th>
                          {columnSequence.map((col, index) => (
                            <Draggable
                              key={col.name}
                              draggableId={col.name}
                              index={index}
                            >
                              {(provided) => (
                                <th
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="cursor-grab"
                                >
                                  {col.name}
                                </th>
                              )}
                            </Draggable>
                          ))}
                          <th>Status</th>
                          <th>Edit</th>
                        </tr>
                        {provided.placeholder}
                      </thead>
                    )}
                  </Droppable>
                </DragDropContext>
                <tbody>
                  {leads.length > 0 ? (
                    leads.map((lead, index) => (
                      <tr key={lead.id || index}>
                        <td>{index + 1 + page * size}</td>
                        <td>{new Date(lead.createdDate).toLocaleString()}</td>
                        {columnSequence.map((col, i) => (
                          <td key={i}>{lead.fields?.[col.name] || "-"}</td>
                        ))}
                        <td>{lead.status || "New Lead"}</td>
                        <td>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleEditClick(lead.id)}
                          >
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={columnSequence.length + 3}
                        className="text-center"
                      >
                        No leads found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
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

      {/* Create Lead Modal */}
      <CreateLead
        show={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveLead}
      />

      {/* Edit Lead Modal */}
      <EditLead
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleUpdateLead}
        leadData={selectedLead}
      />
    </div>
  );
};

export default LeadsList;
