import React, { useEffect, useState } from "react";
import { Button, Modal, Form, ListGroup, Spinner } from "react-bootstrap";
import { FaTrash, FaPen } from "react-icons/fa";
import { toast } from "react-toastify";
import axiosInstance from "../../BaseComponet/axiosInstance";

const CreatePart = ({ show, onClose }) => {
  const [partInput, setPartInput] = useState("");
  const [partList, setPartList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    if (show) fetchExistingParts();
  }, [show]);

  const fetchExistingParts = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/work/getAllParts");
      setPartList(res.data || []);
    } catch (error) {
      toast.error("Failed to load parts");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPart = async () => {
    const partName = partInput.trim();
    if (!partName) return;

    if (partList.some(p => p.partName === partName)) {
      toast.info("This part already exists");
      return;
    }

    try {
      const res = await axiosInstance.post(`/work/addPart/${partName}`);
      if (res.data) {
        setPartList([...partList, res.data]);
        setPartInput("");
        toast.success("Part added");
      }
    } catch (error) {
      if (error.response?.status === 409) {
        toast.warning("Part already exists in DB");
      } else {
        toast.error("Failed to add part");
      }
    }
  };

  const handleEditClick = (item) => {
    setPartInput(item.partName);
    setEditId(item.partId);
    setEditMode(true);
  };

  const handleUpdatePart = async () => {
    const updatedName = partInput.trim();
    if (!updatedName) return;

    try {
      const res = await axiosInstance.put(`/work/updatePart/${editId}`, {
        partName: updatedName,
      });

      if (res.data) {
        setPartList(prev =>
          prev.map(item =>
            item.partId === editId ? { ...item, partName: updatedName } : item
          )
        );
        toast.success("Part updated");
        resetInput();
      }
    } catch (error) {
      toast.error("Failed to update part");
    }
  };

  const handleDelete = async (partId) => {
    try {
      const res = await axiosInstance.delete(`/work/deletePart/${partId}`);
      if (res.status === 200) {
        setPartList(prev => prev.filter(item => item.partId !== partId));
        toast.success("Part deleted");
      }
    } catch (error) {
      toast.error("Failed to delete part");
    }
  };

  const resetInput = () => {
    setPartInput("");
    setEditMode(false);
    setEditId(null);
  };

  return (
    <Modal show={show} onHide={onClose} size="md">
      <Modal.Header closeButton>
        <Modal.Title>Add Part</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form className="d-flex mb-3">
          <Form.Control
            type="text"
            placeholder="Enter part name"
            value={partInput}
            onChange={(e) => setPartInput(e.target.value)}
          />
          {editMode ? (
            <Button variant="warning" className="ms-2" onClick={handleUpdatePart}>
              Update
            </Button>
          ) : (
            <Button variant="success" className="ms-2" onClick={handleAddPart}>
              Add
            </Button>
          )}
        </Form>

        <div style={{ maxHeight: "250px", overflowY: "auto", border: "1px solid #ddd", borderRadius: "5px" }}>
          {loading ? (
            <div className="text-center p-3">
              <Spinner animation="border" size="sm" /> Loading...
            </div>
          ) : partList.length > 0 ? (
            <ListGroup variant="flush">
              {partList.map((item) => (
                <ListGroup.Item key={item.partId} className="d-flex justify-content-between align-items-center">
                  {item.partName}
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
                      onClick={() => handleDelete(item.partId)}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <div className="text-muted text-center p-3">No parts added yet.</div>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreatePart;
