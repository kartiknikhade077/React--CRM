import React, { useEffect, useState } from "react";
import { Button, Modal, Form, ListGroup, Spinner } from "react-bootstrap";
import { FaTrash, FaPen } from "react-icons/fa";
import { toast } from "react-toastify";
import axiosInstance from "../../BaseComponet/axiosInstance";

const CreateWorkOrderProcess = ({ show, onClose }) => {
  const [processInput, setProcessInput] = useState("");
  const [processList, setProcessList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    if (show) fetchExistingProcesses();
  }, [show]);

  const fetchExistingProcesses = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/work/getAllWorkOrderProcesses");
      setProcessList(res.data || []);
    } catch (error) {
      toast.error("Failed to load processes");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProcess = async () => {
    const processName = processInput.trim();
    if (!processName) return;

    if (processList.some(p => p.processName.toLowerCase() === processName.toLowerCase())) {
      toast.info("This process already exists");
      return;
    }

    try {
      const res = await axiosInstance.post(`/work/addWorkOrderProcess/${processName}`);
      if (res.data) {
        setProcessList([...processList, res.data]);
        setProcessInput("");
        toast.success("Process added successfully");
      }
    } catch (error) {
      if (error.response?.status === 409) {
        toast.warning("Process already exists in DB");
      } else {
        toast.error("Failed to add process");
      }
      console.error(error);
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
      const res = await axiosInstance.put(`/work/updateWorkOrderProcesses/${editId}`, {
        processName: updatedName,
      });

      if (res.data) {
        setProcessList(prev =>
          prev.map(item =>
            item.processId === editId ? { ...item, processName: updatedName } : item
          )
        );
        toast.success("Process updated successfully");
        resetInput();
      }
    } catch (error) {
      toast.error("Failed to update process");
      console.error(error);
    }
  };

  const handleDeleteProcess = async (processId) => {
    try {
      const res = await axiosInstance.delete(`/work/deleteWorkOrderProcesses/${processId}`);
      if (res.status === 200) {
        setProcessList(prev =>
          prev.filter(item => item.processId !== processId)
        );
        toast.success("Process deleted successfully");
      }
    } catch (error) {
      toast.error("Failed to delete process. It may be in use.");
      console.error(error);
    }
  };

  const resetInput = () => {
    setProcessInput("");
    setEditMode(false);
    setEditId(null);
  };
  
  // Also reset when closing the modal
  const handleClose = () => {
    resetInput();
    onClose();
  };

  return (
    <Modal show={show} onHide={handleClose} size="md">
      <Modal.Header closeButton>
        <Modal.Title>Manage Work Order Processes</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form className="d-flex mb-3" onSubmit={(e) => { e.preventDefault(); editMode ? handleUpdateProcess() : handleAddProcess(); }}>
          <Form.Control
            type="text"
            placeholder="Enter process name"
            value={processInput}
            onChange={(e) => setProcessInput(e.target.value)}
            autoFocus
          />
          {editMode ? (
            <Button variant="warning" className="ms-2" onClick={handleUpdateProcess}>
              Update
            </Button>
          ) : (
            <Button variant="success" className="ms-2" onClick={handleAddProcess}>
              Add
            </Button>
          )}
        </Form>

        <div style={{ maxHeight: "250px", overflowY: "auto", border: "1px solid #ddd", borderRadius: "5px" }}>
          {loading ? (
            <div className="text-center p-3">
              <Spinner animation="border" size="sm" /> Loading...
            </div>
          ) : processList.length > 0 ? (
            <ListGroup variant="flush">
              {processList.map((item) => (
                <ListGroup.Item key={item.processId} className="d-flex justify-content-between align-items-center">
                  {item.processName}
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleEditClick(item)}
                    >
                      <FaPen />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDeleteProcess(item.processId)}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <div className="text-muted text-center p-3">No processes added yet.</div>
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

export default CreateWorkOrderProcess;