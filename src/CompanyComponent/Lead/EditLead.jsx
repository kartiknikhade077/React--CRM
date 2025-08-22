import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import axiosInstance from "../../BaseComponet/axiosInstance";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ConvertToCustomerLead from "./ConvertToCustomerLead";


const EditLead = ({ show, onClose, onSave, leadData, setShow }) => {
  const [lead, setLead] = useState({});
  const [columnList, setColumnList] = useState([]);
  const [showCustomization, setShowCustomization] = useState(false); // <-- Toggle
  const [originalColumnNames, setOriginalColumnNames] = useState({});

  const [showConvertModal, setShowConvertModal] = useState(false);
  const [access, setAccess] = useState({})
  const [role,setRole]=useState("");
  const fixedColumnNames = [
    "RFQ Date",
    "Customer Name",
    "Project Name",
    "Email",
    "Mobile Number",
    "Address",
    "RFQ Summary",
    "Remarks"
  ];

  const defaultFixedColumns = fixedColumnNames.map((name, index) => ({
    name,
    sequence: index + 1,
  }));

  useEffect(() => {
    if (show && leadData) {
      setShowCustomization(false); // Reset view
      getLeadInfo(leadData);
      const access = JSON.parse(localStorage.getItem("access"));
      setAccess(access)
      setRole(localStorage.getItem("role"))
    }
  }, [show, leadData]);

  const getLeadInfo = async (leadId) => {
    try {
      const response = await axiosInstance.get(`/lead/getLeadById/${leadId}`);
      const { leadColumn, lead } = response.data;

      const cols =
        leadColumn && leadColumn.length > 0 ? leadColumn : defaultFixedColumns;

      setColumnList(cols);
      setLead(lead.fields || {});

      // Set original column name map
      const nameMap = {};
      cols.forEach((col) => {
        nameMap[col.name] = col.name;
      });
      setOriginalColumnNames(nameMap);
    } catch (error) {
      console.error("Failed to fetch lead details:", error);
      setColumnList(defaultFixedColumns);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const updated = Array.from(columnList);
    const [reorderedItem] = updated.splice(result.source.index, 1);
    updated.splice(result.destination.index, 0, reorderedItem);
    setColumnList(updated.map((col, idx) => ({ ...col, sequence: idx + 1 })));
  };

  const handleColumnNameChange = async (index, newName) => {
    const trimmedName = newName.trim();
    const currentCol = columnList[index];
    const oldName = currentCol.name;

    // Skip if unchanged
    if (oldName === trimmedName) return;

    // Check for duplicate
    const isDuplicate = columnList.some(
      (col, i) =>
        i !== index && col.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      toast.error("Column name must be unique!");
      return;
    }

    // Update local state
    const updated = [...columnList];
    updated[index].name = trimmedName;
    setColumnList(updated);

    // If old name exists in saved map, call rename API
    const wasSaved = originalColumnNames.hasOwnProperty(oldName);
    if (wasSaved) {
      try {
        await axiosInstance.put("/lead/leadColumnRename", {
          oldName: oldName,
          newName: trimmedName,
        });

        // Update name mapping
        setOriginalColumnNames((prev) => {
          const updatedMap = { ...prev };
          delete updatedMap[oldName];
          updatedMap[trimmedName] = trimmedName;
          return updatedMap;
        });

        toast.success(`Renamed "${oldName}" to "${trimmedName}"`);
      } catch (error) {
        console.error("Rename API error:", error);
        toast.error("Failed to rename column");
      }
    }
  };

  const handleFieldChange = (name, value) => {
    setLead((prev) => ({ ...prev, [name]: value }));
  };

  const updateLead = async () => {
    const payload = {
      leadId: leadData,
      columns: columnList,
      lead: lead,
    };
    try {
      await axiosInstance.put(`/lead/updateLead/${leadData}`, payload);
      onSave();
    } catch (error) {
      console.error("Error updating lead:", error);
    }
  };

  const addColumn = () => {
    const newColumn = {
      name: `New Column ${columnList.length + 1}`,
      sequence: columnList.length + 1,
    };
    setColumnList([...columnList, newColumn]);
  };

  const removeColumn = async (index) => {
    const columnToRemove = columnList[index];

    try {
      await axiosInstance.delete(
        `/lead/deletColumn/${encodeURIComponent(columnToRemove.name)}`
      );

      const updated = columnList.filter((_, i) => i !== index);
      setColumnList(updated.map((col, idx) => ({ ...col, sequence: idx + 1 })));

      toast.success(`Column "${columnToRemove.name}" deleted successfully`);
    } catch (error) {
      console.error("Error deleting column:", error);
      toast.error("Failed to delete column");
    }
  };

  return (
    <>
      <Modal show={show} onHide={onClose} size="lg" centered>
        <fieldset disabled={!access?.leadEdit && role==="ROLE_EMP"}>
        <Modal.Header className="align-items-start flex-column">
          <div className="d-flex w-100 justify-content-between align-items-center">
            <div className=" align-items-center">
              <Modal.Title>Update Lead</Modal.Title>
            </div>

            <div className="d-flex">
              {!showCustomization ? (
                <div className="d-flex gap-2">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setShowCustomization(true)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="ms-2"
                    onClick={() => {
                      setShow(false); // Close Edit modal
                      setShowConvertModal(true); // Open Convert modal
                    }}
                  >
                    Convert to Customer
                  </Button>
                </div>
              ) : (
                <div className="d-flex gap-2">
                  <Button variant="primary" size="sm" onClick={addColumn}>
                    + Add Field
                  </Button>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setShowCustomization(false)}
                  >
                    Exit Customization
                  </Button>
                </div>
              )}

              <button
                type="button"
                className="btn-close ms-2"
                aria-label="Close"
                onClick={onClose}
              ></button>
            </div>
          </div>
        </Modal.Header>

        <Modal.Body>
          {!showCustomization ? (
            // SIMPLE MODE
            <div className="row">
              {columnList.map((col, index) => (
                <div className="col-md-6 mb-3" key={index}>
                  <label className="form-label fw-semibold">{col.name}</label>
                  {col.name === "RFQ Date" ? (
                    <input
                      type="date"
                      className="form-control"
                      placeholder={`Enter ${col.name}`}
                      value={lead[col.name] || new Date().toISOString().split("T")[0]} // default today
                      onChange={(e) =>
                        handleFieldChange(col.name, e.target.value)
                      }
                    />
                  ) : (
                    <input
                      type="text"
                      className="form-control"
                      placeholder={`Enter ${col.name}`}
                      value={lead[col.name] || ""}
                      onChange={(e) => handleFieldChange(col.name, e.target.value)}
                    />
                  )}
                </div>

              ))}
            </div>
          ) : (
            // CUSTOMIZATION MODE
            <>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="columns" direction="vertical">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      <div className="row">
                        {columnList.map((col, index) => (
                          <Draggable
                            key={index}
                            draggableId={`col-${index}`}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                className="col-md-6 mb-3"
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <div className="p-2 border rounded bg-light">
                                  <div className="d-flex justify-content-between mb-1">
                                    <input
                                      type="text"
                                      value={col.name}
                                      className="form-control form-control-sm"
                                      onChange={(e) =>
                                        handleColumnNameChange(
                                          index,
                                          e.target.value
                                        )
                                      }
                                      disabled={fixedColumnNames.includes(
                                        col.name
                                      )}
                                    />
                                    {!fixedColumnNames.includes(col.name) && (
                                      <Button
                                        variant="outline-danger"
                                        size="sm"
                                        className="ms-2"
                                        onClick={() => removeColumn(index)}
                                      >
                                        ✕
                                      </Button>
                                    )}
                                  </div>
                                  <input
                                    type="text"
                                    className="form-control"
                                    placeholder={`Enter ${col.name}`}
                                    value={lead[col.name] || ""}
                                    onChange={(e) =>
                                      handleFieldChange(
                                        col.name,
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                      </div>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" onClick={updateLead}>
            Update Lead
          </Button>
        </Modal.Footer>
        </fieldset>
      </Modal>

      <ConvertToCustomerLead
        show={showConvertModal}
        onClose={() => setShowConvertModal(false)}
        handleBackToEdit={() => setShow(true)}
        fixedData={{
          customerName: lead["Customer Name"] || "",
          email: lead["Email"] || "",
          company: lead["Company Name"] || "",
          phone: lead["Mobile Number"] || "",
          website: lead["Website"] || "",
          address: lead["Address"] || "",
          city: lead["City"] || "",
          state: lead["State"] || "",
          country: lead["Country"] || "",
          gstNumber: lead["GST No"] || "",
          panNumber: lead["PAN No"] || "",
        }}
        leadData={{ id: leadData }} // ✅ Pass lead ID properly
        onSuccess={onSave}
      />
    </>
  );
};

export default EditLead;
