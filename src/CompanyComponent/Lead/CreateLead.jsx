import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import axiosInstance from "../../BaseComponet/axiosInstance";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreateLead = ({ show, onClose, onSave }) => {
  const [lead, setLead] = useState({});
  const [columnList, setColumnList] = useState([]);
  const [showCustomization, setShowCustomization] = useState(false); // toggle for customization
  const [originalColumnNames, setOriginalColumnNames] = useState({});

  const defaultColumns = [
    { name: "Customer Name", sequence: 1 },
    { name: "Company Name", sequence: 2 },
    { name: "Mobile Number", sequence: 3 },
    { name: "Phone Number", sequence: 4 },
    { name: "Email", sequence: 5 },
    { name: "Address", sequence: 6 },
    { name: "Country", sequence: 7 },
    { name: "State", sequence: 8 },
    { name: "City", sequence: 9 },
    { name: "Zip Code", sequence: 10 },
  ];

  useEffect(() => {
    if (show) {
      setShowCustomization(false); // reset on open
      fetchColumns();
    }
  }, [show]);

  const fetchColumns = async () => {
    try {
      const response = await axiosInstance.get("/lead/getAllColumns");
      const fetchedColumns = response.data?.columns || [];
      setColumnList(
        fetchedColumns.length > 0 ? fetchedColumns : defaultColumns
      );
    } catch (error) {
      console.error("Failed to fetch columns:", error);
      setColumnList(defaultColumns);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const updated = Array.from(columnList);
    const [reorderedItem] = updated.splice(result.source.index, 1);
    updated.splice(result.destination.index, 0, reorderedItem);
    setColumnList(updated.map((col, idx) => ({ ...col, sequence: idx + 1 })));
  };



const getLeadInfo = async () => {
  try {
    const response = await axiosInstance.get(`/lead/your-endpoint`);
    const { leadColumn, lead } = response.data;

    setOriginalColumnNames(
      (leadColumn || []).reduce((acc, col) => {
        acc[col.name] = col.name;
        return acc;
      }, {})
    );

    setColumnList(leadColumn || []);
    setLead(lead.fields || {});
  } catch (error) {
    console.error("Error fetching lead info", error);
  }
};


const handleColumnNameChange = async (index, newName) => {
  const trimmedName = newName.trim();
  const currentCol = columnList[index];
  const oldName = currentCol.name;

  // Check if name is unchanged
  if (oldName === trimmedName) return;

  // Check if name is duplicate
  const isDuplicate = columnList.some(
    (col, i) =>
      i !== index && col.name.toLowerCase() === trimmedName.toLowerCase()
  );
  if (isDuplicate) {
    toast.error("Column name must be unique!");
    return;
  }

  // Update the local state
  const updated = [...columnList];
  updated[index].name = trimmedName;
  setColumnList(updated);

  // Check if this is a previously saved column
  const wasSaved = Object.keys(originalColumnNames).includes(oldName);

  // Only call rename API if it's a saved column
  if (wasSaved) {
    try {
      await axiosInstance.post("/lead/leadColumnRename", {
        oldName: oldName,
        newName: trimmedName,
      });

      // Update the original names map after successful rename
      setOriginalColumnNames((prev) => {
        const updatedMap = { ...prev };
        delete updatedMap[oldName];
        updatedMap[trimmedName] = trimmedName;
        return updatedMap;
      });

      toast.success(`Renamed "${oldName}" to "${trimmedName}"`);
    } catch (error) {
      toast.error("Failed to rename column");
      console.error("Rename column error:", error);
    }
  }
};


  const handleFieldChange = (name, value) => {
    setLead((prev) => ({ ...prev, [name]: value }));
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

  const createLead = () => {
    const payload = {
      columns: columnList,
      lead: lead,
    };
    saveLead(payload);
  };

  const saveLead = async (payload) => {
    console.log("Payload to send to API:", payload);
    try {
      await axiosInstance.post("/lead/createLead", payload);
      onSave(payload);
    } catch (error) {
      console.error("Error saving lead:", error);
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header className="align-items-start flex-column">
        <div className="d-flex w-100 justify-content-between align-items-center">
          <div className=" align-items-center">
            <Modal.Title>Create New Lead</Modal.Title>
          </div>

          <div className="d-flex">
            {!showCustomization ? (
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setShowCustomization(true)}
              >
                Edit
              </Button>
            ) : (
              <div className="d-flex gap-2">
                <Button variant="outline-primary" size="sm" onClick={addColumn}>
                  + Add Column
                </Button>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => setShowCustomization(false)}
                >
                  Switch to Simple Mode
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

      {/* <Modal.Body>
        {!showCustomization ? (
          // SIMPLE MODE
          <div className="row">
            {defaultColumns.map((col, index) => (
              <div className="col-md-6 mb-3" key={index}>
                <label className="form-label fw-semibold">{col.name}</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder={`Enter ${col.name}`}
                  value={lead[col.name] || ""}
                  onChange={(e) => handleFieldChange(col.name, e.target.value)}
                />
              </div>
            ))}
          </div>
        ) : (
          // CUSTOMIZATION MODE
          <>
            <div className="d-flex justify-content-end mb-3">
              <Button variant="success" size="sm" onClick={addColumn}>
                + Add Column
              </Button>
            </div>
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
                                    className="form-control form-control-sm me-2"
                                    onChange={(e) =>
                                      handleColumnNameChange(
                                        index,
                                        e.target.value
                                      )
                                    }
                                  />
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => removeColumn(index)}
                                  >
                                    ✕
                                  </Button>
                                </div>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder={`Enter ${col.name}`}
                                  value={lead[col.name] || ""}
                                  onChange={(e) =>
                                    handleFieldChange(col.name, e.target.value)
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
      </Modal.Body> */}

      <Modal.Body>
        {!showCustomization ? (
          // SIMPLE MODE
          <div className="row">
            {columnList.map((col, index) => (
              <div className="col-md-6 mb-3" key={index}>
                <label className="form-label fw-semibold">{col.name}</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder={`Enter ${col.name}`}
                  value={lead[col.name] || ""}
                  onChange={(e) => handleFieldChange(col.name, e.target.value)}
                />
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
                                    className="form-control form-control-sm me-2"
                                    onChange={(e) =>
                                      handleColumnNameChange(
                                        index,
                                        e.target.value
                                      )
                                    }
                                  />
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => removeColumn(index)}
                                  >
                                    ✕
                                  </Button>
                                </div>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder={`Enter ${col.name}`}
                                  value={lead[col.name] || ""}
                                  onChange={(e) =>
                                    handleFieldChange(col.name, e.target.value)
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
        <Button variant="primary" onClick={createLead}>
          Save Lead
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateLead;
