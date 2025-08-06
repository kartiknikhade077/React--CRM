import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert, Row, Col } from "react-bootstrap";
import Select from "react-select";
import axiosInstance from "../../BaseComponet/axiosInstance";
import { FaTrash } from "react-icons/fa";

const emptyItem = { order: "", itemName: "" };

const CreateCheckListItem = ({ show, onClose, onCreate, editItem, onUpdate,usedOrders }) => {
  const [categories, setCategories] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [items, setItems] = useState([{ ...emptyItem }]);
  const [error, setError] = useState("");
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [orderErrors, setOrderErrors] = useState({});


  // Fetch categories only when dropdown is focused
  const fetchCategories = async () => {
    setDropdownLoading(true);
    try {
      const res = await axiosInstance.get("/kickoff/getCheckListCategory");
      setCategories(res.data);
      setCategoryOptions(
        res.data.map((cat) => ({
          value: cat.categoryId,
          label: cat.categoryName,
          sequence: cat.sequence,
        }))
      );
    } catch {
      setCategories([]);
      setCategoryOptions([]);
    }
    setDropdownLoading(false);
  };

  // Set initial values
  useEffect(() => {
    if (show) {
      if (editItem) {
        setSelectedCategory({
          value: editItem.categoryId,
          label: editItem.categoryName,
        });
        setItems([{ order: editItem.sequence, itemName: editItem.itemName }]);
      } else {
        setSelectedCategory(null);
        setItems([{ ...emptyItem }]);
      }
      setError("");
    }
  }, [show, editItem]);

  const clearForm = () => {
    setSelectedCategory(null);
    setItems([{ ...emptyItem }]);
    setError("");
  };

  const handleItemChange = (idx, field, value) => {
    const updatedItems = items.map((itm, i) =>
      i === idx ? { ...itm, [field]: field === "order" ? Number(value) : value } : itm
    );
    setItems(updatedItems);
    setError("");

    if (field === "order") {
      const orderNum = Number(value);

      // Check for duplicate in usedOrders
      const isDuplicateInUsedOrders =
        usedOrders.includes(orderNum) &&
        (!editItem || editItem.sequence !== orderNum);

      // Check for duplicate in current modal entries (excluding current row)
      const isDuplicateInForm = updatedItems.some(
        (itm, i) => i !== idx && itm.order === orderNum
      );

      const hasDuplicate = isDuplicateInUsedOrders || isDuplicateInForm;

      setOrderErrors((prev) => ({
        ...prev,
        [idx]: hasDuplicate ? "Order number already used" : "",
      }));
    }
  };



  const handleAddRow = () => {
    setItems((prev) => [...prev, { ...emptyItem }]);
  };

  const handleRemoveRow = (idx) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCategory) {
      setError("Please select a category.");
      return;
    }

    const trimmedItems = items.map((itm) => ({
      order: Number(itm.order),
      itemName: itm.itemName.trim(),
    }));

    const hasEmptyFields = trimmedItems.some(
      (itm) => !itm.itemName || !itm.order
    );
    if (hasEmptyFields) {
      setError("All items must have an order and a name.");
      return;
    }

    try {
      if (editItem) {
        const payload = [{
          itemId: editItem.itemId,
          categoryType: selectedCategory.label,
          checkListItem: trimmedItems[0].itemName,
          sequence: trimmedItems[0].order,
        }];

        await axiosInstance.put("/kickoff/updateCheckListCategoryWithItem", payload);
        onUpdate && onUpdate(payload);
      }
      else {
        const payloads = trimmedItems.map((itm) => ({
          categoryType: selectedCategory.label,
          checkListItem: itm.itemName,
          sequence: itm.order,
        }));
        await axiosInstance.post("/kickoff/createCheckListCategoryWithItem", payloads);
        onCreate && onCreate(payloads);
      }

      clearForm();
      onClose();
    } catch (error) {
      setError(editItem ? "Failed to update item." : "Failed to create item(s).");
      console.error("Failed to save item(s):", error);
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
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {editItem ? "Edit Checklist Item" : "Create New Checklist Item(s)"}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <Select
              value={selectedCategory}
              onChange={(option) => setSelectedCategory(option)}
              onMenuOpen={fetchCategories}
              options={categoryOptions}
              isLoading={dropdownLoading}
              placeholder="Select category..."
              isDisabled={!!editItem}
              required
            />
          </Form.Group>
          {items.map((itm, idx) => (
            <div key={idx}>
              <Row className="align-items-end mb-2">
                <Col sm={2}>
                  <Form.Group>
                    <Form.Label>Order</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Order"
                      value={itm.order}
                      min={1}
                      onChange={(e) => handleItemChange(idx, "order", e.target.value)}
                      required
                    />
                    {orderErrors[idx] && (
                      <div style={{ color: 'red', fontSize: '0.875rem' }}>
                        {orderErrors[idx]}
                      </div>
                    )}
                  </Form.Group>

                </Col>
                <Col sm={9}>
                  <Form.Group>
                    <Form.Label>Item Description</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter item description"
                      value={itm.itemName}
                      onChange={(e) =>
                        handleItemChange(idx, "itemName", e.target.value)
                      }
                      required
                    />
                  </Form.Group>
                </Col>
                <Col sm={1} className="d-flex align-items-end justify-content-end">
                  {items.length > 1 && (
                    <Button
                      variant="outline-danger"
                      onClick={() => handleRemoveRow(idx)}
                      style={{ minWidth: 36 }}
                    >
                      <FaTrash />
                    </Button>
                  )}
                </Col>
              </Row>
              {idx === items.length - 1 && !editItem && (
                <Row className="mb-2">
                  <Col sm={12}>
                    <Button
                      variant="primary"
                      onClick={handleAddRow}
                      size="sm"
                    >
                      + Add More
                    </Button>
                  </Col>
                </Row>
              )}
            </div>
          ))}
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
            disabled={
              !selectedCategory ||
              items.some((itm) => !itm.itemName.trim() || !itm.order)
            }
          >
            {editItem ? "Update" : "Add"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CreateCheckListItem;
