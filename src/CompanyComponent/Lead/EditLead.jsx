import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import axiosInstance from "../../BaseComponet/axiosInstance";

const EditLead = ({ show, onClose, onSave, leadData }) => {
    const [lead, setLead] = useState({});
    const [columnList, setColumnList] = useState([]);

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
        if (show && leadData) {
            getLeadInfo(leadData); // leadData is leadId
        }
    }, [show, leadData]);

    const getLeadInfo = async (leadId) => {
        try {
            const response = await axiosInstance.get(`/lead/getLeadById/${leadId}`);
            const { leadColumn, lead } = response.data;

            setColumnList(leadColumn && leadColumn.length > 0 ? leadColumn : defaultColumns);
            setLead(lead.fields || {}); // Populate form fields
        } catch (error) {
            console.error("Failed to fetch lead details:", error);
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

    const handleColumnNameChange = (index, newName) => {
        const updated = [...columnList];
        updated[index].name = newName;
        setColumnList(updated);
    };

    const handleFieldChange = (name, value) => {
        setLead((prev) => ({ ...prev, [name]: value }));
    };

    const updateLead = async () => {
        const payload = {
            leadId: leadData, // leadData is the ID
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


    // Add a new column
    const addColumn = () => {
        const newColumn = {
            name: `New Column ${columnList.length + 1}`,
            sequence: columnList.length + 1,
        };
        setColumnList([...columnList, newColumn]);
    };

    // Remove a column
    const removeColumn = (index) => {
        const updated = columnList.filter((_, i) => i !== index);
        setColumnList(updated.map((col, idx) => ({ ...col, sequence: idx + 1 })));
    };


    return (
        <Modal show={show} onHide={onClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Edit Lead</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="d-flex justify-content-end mb-3">
                    <Button variant="success" size="sm" onClick={addColumn}>
                        + Add Column
                    </Button>
                </div>
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="columns" direction="vertical">
                        {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef}>
                                {columnList.map((col, index) => (
                                    <Draggable key={index} draggableId={`col-${index}`} index={index}>
                                        {(provided) => (
                                            <div
                                                className="mb-3 p-2 border rounded bg-light"
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                            >

                                                <div className="d-flex justify-content-between">
                                                    <label className="form-label">Column Name</label>
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => removeColumn(index)}
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={col.name}
                                                    className="form-control mb-2"
                                                    onChange={(e) =>
                                                        handleColumnNameChange(index, e.target.value)
                                                    }
                                                />
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
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={updateLead}>
                    Update Lead
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EditLead;
