import React, { useEffect, useState } from "react";
import { Button, Modal, Form, ListGroup, Spinner } from "react-bootstrap";
import { FaTrash, FaPen } from "react-icons/fa";
import { toast } from "react-toastify";
import axiosInstance from "../../BaseComponet/axiosInstance";

const CreateMaterial = ({ show, onClose }) => {
  const [materialInput, setMaterialInput] = useState("");
  const [materialList, setMaterialList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    if (show) fetchMaterials();
  }, [show]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/work/getAllMaterials");
      setMaterialList(res.data || []);
    } catch (error) {
      toast.error("Failed to load materials");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMaterial = async () => {
    const materialName = materialInput.trim();
    if (!materialName) return;

    if (materialList.some(m => m.materialName === materialName)) {
      toast.info("This material already exists");
      return;
    }

    try {
      const res = await axiosInstance.post(`/work/addMaterial/${materialName}`);
      if (res.data) {
        setMaterialList([...materialList, res.data]);
        setMaterialInput("");
        toast.success("Material added");
      }
    } catch (error) {
      if (error.response?.status === 409) {
        toast.warning("Material already exists in DB");
      } else {
        toast.error("Failed to add material");
      }
    }
  };

  const handleEditClick = (item) => {
    setMaterialInput(item.materialName);
    setEditId(item.materialId);
    setEditMode(true);
  };

  const handleUpdateMaterial = async () => {
    const updatedName = materialInput.trim();
    if (!updatedName) return;

    try {
      const res = await axiosInstance.put(`/work/updateMaterial/${editId}`, {
        materialName: updatedName,
      });

      if (res.data) {
        setMaterialList(prev =>
          prev.map(item =>
            item.materialId === editId ? { ...item, materialName: updatedName } : item
          )
        );
        toast.success("Material updated");
        resetInput();
      }
    } catch (error) {
      toast.error("Failed to update material");
    }
  };

  const handleDelete = async (materialId) => {
    try {
      const res = await axiosInstance.delete(`/work/deleteMaterial/${materialId}`);
      if (res.status === 200) {
        setMaterialList(prev =>
          prev.filter(item => item.materialId !== materialId)
        );
        toast.success("Material deleted");
      }
    } catch (error) {
      toast.error("Failed to delete material");
    }
  };

  const resetInput = () => {
    setMaterialInput("");
    setEditMode(false);
    setEditId(null);
  };

  return (
    <Modal show={show} onHide={onClose} size="md">
      <Modal.Header closeButton>
        <Modal.Title>Add Material</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form className="d-flex mb-3">
          <Form.Control
            type="text"
            placeholder="Enter material"
            value={materialInput}
            onChange={(e) => setMaterialInput(e.target.value)}
          />
          {editMode ? (
            <Button variant="warning" className="ms-2" onClick={handleUpdateMaterial}>
              Update
            </Button>
          ) : (
            <Button variant="success" className="ms-2" onClick={handleAddMaterial}>
              Add
            </Button>
          )}
        </Form>

        <div style={{ maxHeight: "250px", overflowY: "auto", border: "1px solid #ddd", borderRadius: "5px" }}>
          {loading ? (
            <div className="text-center p-3">
              <Spinner animation="border" size="sm" /> Loading...
            </div>
          ) : materialList.length > 0 ? (
            <ListGroup variant="flush">
              {materialList.map((item) => (
                <ListGroup.Item key={item.materialId} className="d-flex justify-content-between align-items-center">
                  {item.materialName}
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
                      onClick={() => handleDelete(item.materialId)}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <div className="text-muted text-center p-3">No material added yet.</div>
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

export default CreateMaterial;
