import React, { useEffect, useState } from "react";
import { Button, Modal, Form, ListGroup, Spinner } from "react-bootstrap";
import { FaTrash, FaPen } from "react-icons/fa";
import { toast } from "react-toastify";
import axiosInstance from "../../BaseComponet/axiosInstance";

const CreateProcesses = ({ show, onClose }) => {
  const [processInput, setProcessInput] = useState("");
  const [processList, setProcessList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    if (show) {
      fetchExistingProcesses();
    }
  }, [show]);

  const fetchExistingProcesses = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/work/getAllProcesses");
      setProcessList(res.data || []);
    } catch (error) {
      toast.error("Failed to load processes");
      console.error("Error fetching processes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProcess = async () => {
    const processName = processInput.trim();
    if (!processName) {
        toast.info("Process name cannot be empty.");
        return;
    }

    if (processList.some(p => p.processName.toLowerCase() === processName.toLowerCase())) {
      toast.info("This process already exists.");
      return;
    }

    try {
      const res = await axiosInstance.post(`/work/addProcess/${processName}`);
      if (res.data) {
        setProcessList([...processList, res.data]);
        setProcessInput("");
        toast.success("Process added successfully!");
      }
    } catch (error) {
      if (error.response?.status === 409) {
        toast.warning("Process already exists in the database.");
      } else {
        toast.error("Failed to add process.");
      }
      console.error("Error adding process:", error);
    }
  };

  const handleEditClick = (item) => {
    setProcessInput(item.processName);
    setEditId(item.processId);
    setEditMode(true);
  };

  const handleUpdateProcess = async () => {
    const updatedName = processInput.trim();
    if (!updatedName || !editId) return;

    try {
      const res = await axiosInstance.put(`/work/updateProcess/${editId}`, {
        processName: updatedName,
      });

      if (res.data) {
        setProcessList(prev =>
          prev.map(item =>
            item.processId === editId ? res.data : item
          )
        );
        toast.success("Process updated successfully!");
        resetInput();
      }
    } catch (error) {
      toast.error("Failed to update process.");
      console.error("Error updating process:", error);
    }
  };

  const handleDeleteProcess = async (processId) => {
    
    try {
      const res = await axiosInstance.delete(`/work/deleteProcess/${processId}`);
      if (res.status === 200) {
        setProcessList(prev =>
          prev.filter(item => item.processId !== processId)
        );
        toast.success("Process deleted successfully!");
      }
    } catch (error) {
      toast.error("Failed to delete process. It may be in use.");
      console.error("Error deleting process:", error);
    }
  };

  const resetInput = () => {
    setProcessInput("");
    setEditMode(false);
    setEditId(null);
  };
  
  const handleClose = () => {
    resetInput();
    onClose();
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (editMode) {
      handleUpdateProcess();
    } else {
      handleAddProcess();
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="md" centered>
      <Modal.Header closeButton>
        <Modal.Title>Manage Processes</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form className="d-flex mb-3" onSubmit={handleFormSubmit}>
          <Form.Control
            type="text"
            placeholder="Enter process name"
            value={processInput}
            onChange={(e) => setProcessInput(e.target.value)}
            autoFocus
          />
          {editMode ? (
            <Button variant="warning" className="ms-2" type="submit">
              Update
            </Button>
          ) : (
            <Button variant="success" className="ms-2" type="submit">
              Add
            </Button>
          )}
        </Form>

        <div style={{ maxHeight: "300px", overflowY: "auto", border: "1px solid #ddd", borderRadius: "5px" }}>
          {loading ? (
            <div className="text-center p-3">
              <Spinner animation="border" size="sm" /> Loading processes...
            </div>
          ) : processList.length > 0 ? (
            <ListGroup variant="flush">
              {processList.map((item) => (
                <ListGroup.Item key={item.processId} className="d-flex justify-content-between align-items-center">
                  <span>{item.processName}</span>
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleEditClick(item)}
                      title="Edit Process"
                    >
                      <FaPen />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDeleteProcess(item.processId)}
                      title="Delete Process"
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <div className="text-muted text-center p-3">No processes have been added yet.</div>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateProcesses;