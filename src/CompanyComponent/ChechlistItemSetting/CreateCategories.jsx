import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import axiosInstance from "../../BaseComponet/axiosInstance";

const CreateCategories = ({ show, onClose, onCreate, editCategory, onUpdate }) => {
  const [categoryName, setCategoryName] = useState("");
  const [order, setOrder] = useState("");
  const [usedOrders, setUsedOrders] = useState([]);
  const [error, setError] = useState("");

  // Fetch existing categories when modal opens
  useEffect(() => {
    if (show) {
      axiosInstance
        .get("/kickoff/getCheckListCategory")
        .then((res) => {
          const sequences = res.data.map((cat) => cat.sequence);
          setUsedOrders(sequences);
          // Set default order to next available
          const nextOrder =
            sequences.length > 0 ? Math.max(...sequences) + 1 : 1;
          setOrder(editCategory ? editCategory.sequence : nextOrder);
        })
        .catch(() => setUsedOrders([]));
      setCategoryName(editCategory ? editCategory.categoryName : "");
      setError("");
    }
  }, [show, editCategory]);

  const clearForm = () => {
    setCategoryName("");
    setOrder(usedOrders.length > 0 ? Math.max(...usedOrders) + 1 : 1);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (categoryName.trim() && order) {
      const payload = {
        categoryName: categoryName.trim(),
        sequence: Number(order),
      };
      try {
        if (editCategory) {
          // Update mode
          await axiosInstance.put("/kickoff/updateCheckListCategory", [
            { ...editCategory, ...payload }
          ]);
          onUpdate && onUpdate(payload);
        } else {
          // Create mode
          await axiosInstance.post("/kickoff/createCheckListCategory", payload);
          onCreate && onCreate(payload);
        }
        clearForm();
        onClose();
      } catch (error) {
        setError(editCategory ? "Failed to update category." : "Failed to create category.");
        console.error("Failed to save category:", error);
      }
    }
  };

  return (
    <Modal
      show={show}
      onHide={() => {
        clearForm();
        onClose();
      }}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {editCategory ? "Edit Category" : "Create New Category"}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group className="mb-3">
            <Form.Label>Order</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter order"
              value={order}
              min={1}
              onChange={(e) => {
                setOrder(e.target.value);
                setError("");
              }}
              required
            />
            {/* Show warning only if order is used by another category (not itself) */}
            {usedOrders.includes(Number(order)) &&
              (!editCategory || Number(order) !== editCategory.sequence) && (
                <Form.Text style={{ color: "red" }}>
                  This order is already used by another category.
                </Form.Text>
            )}
          </Form.Group>
          <Form.Group>
            <Form.Label>Category Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter category name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              autoFocus
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => {
              clearForm();
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={!categoryName.trim() || !order}
          >
            {editCategory ? "Update" : "Add"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CreateCategories;
