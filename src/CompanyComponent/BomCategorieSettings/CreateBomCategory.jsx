import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Table, Row, Col } from "react-bootstrap";
import axiosInstance from '../../BaseComponet/axiosInstance';
import { toast } from 'react-toastify';


const allFields = [
  { id: 'itemNo', label: 'ITEM NO', required: true },
  { id: 'itemDesc', label: 'ITEM DESCRIPTION', required: true },
  { id: 'matl', label: 'MATL', required: false },
  { id: 'finishSize', label: 'FINISH SIZE', required: false },
  { id: 'rawSize', label: 'RAW SIZE', required: false },
  { id: 'qty', label: 'QTY', required: true },
  { id: 'remarks', label: 'REMARKS', required: false },
  { id: 'modelWt', label: 'MODEL WT', required: false },
  { id: 'orderingRemarks', label: 'ORDERING REMARKS', required: false },
  { id: 'boughtOutItems', label: 'BOUGHT OUT ITEMS', required: false },
  { id: 'boughtOutQty', label: 'BOUGHT OUT QTY', required: false },
  { id: 'specification', label: 'SPECIFICATION', required: false },
  { id: 'sec', label: 'SEC.', required: false },
];

const getInitialCheckedState = () => {
  const initialState = {};
  allFields.forEach(field => {
    initialState[field.id] = field.required;
  });
  return initialState;
};

const CreateBomCategory = ({ show, onSave, onClose }) => {
  const [categoryName, setCategoryName] = useState('');
  const [checkedFields, setCheckedFields] = useState(getInitialCheckedState());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (show) {
      setCategoryName('');
      setCheckedFields(getInitialCheckedState());
      setIsSubmitting(false);
    }
  }, [show]);

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setCheckedFields(prevState => ({ ...prevState, [name]: checked }));
  };

  const handleSelectAll = () => {
    const allSelected = {};
    allFields.forEach(field => { allSelected[field.id] = true; });
    setCheckedFields(allSelected);
  };

  const handleRequiredOnly = () => {
    setCheckedFields(getInitialCheckedState());
  };

  const handleSave = async () => {
    // 1. Basic validation
    if (!categoryName.trim()) {
      alert('Category Name is required.');
      return;
    }

    // 2. Format the data for the API payload
    const payload = allFields.map(field => ({
      categoryType: categoryName.trim(),
      categoryField: field.label,
      status: !!checkedFields[field.id] // Get the boolean status (true/false) for every field
    }));

    // 3. Set loading state and make the API call
    setIsSubmitting(true);
    try {
      // Make the POST request to your endpoint
      const response = await axiosInstance.post('/kickoff/createBOMCategory', payload);

      // Assuming a successful response (e.g., status 200 or 201)
      console.log('API Response:', response.data);
      toast.success(`Category "${categoryName}" saved successfully!`);

      if (onSave) {
        onSave(); 
      }

      onClose(); // Close the modal

    } catch (error) {
      console.error('Failed to save BOM Category:', error);
      // Show a user-friendly error message
      const errorMessage = error.response?.data?.message || 'An error occurred while saving.';
      toast.error(`Error: ${errorMessage}`);
    } finally {
      // 4. Reset loading state
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>New BOM Category</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* The Form JSX remains the same as the previous step */}
        <Form>
          <Form.Group className="mb-4" controlId="categoryName">
            <Form.Label>Category Name *</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter category name (e.g., castingsPatterns_001)"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              disabled={isSubmitting}
            />
          </Form.Group>
          <Form.Group>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <Form.Label className="mb-0">Select Fields for this Category *</Form.Label>
              <div>
                <Button variant="outline-primary" size="sm" className="me-2" onClick={handleSelectAll} disabled={isSubmitting}>
                  Select All
                </Button>
                <Button variant="outline-primary" size="sm" onClick={handleRequiredOnly} disabled={isSubmitting}>
                  Required Only
                </Button>
              </div>
            </div>
            <Row>
              {allFields.map(field => (
                <Col md={4} key={field.id} className="mb-2">
                  <div className={`field-checkbox-wrapper ${checkedFields[field.id] ? 'selected' : ''}`}>
                    <Form.Check
                      type="checkbox"
                      id={`checkbox-${field.id}`}
                      name={field.id}
                      label={
                        <>
                          {field.label}
                          {field.required && <span className="required-tag">Required</span>}
                        </>
                      }
                      checked={checkedFields[field.id]}
                      onChange={handleCheckboxChange}
                      disabled={field.required || isSubmitting}
                    />
                  </div>
                </Col>
              ))}
            </Row>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Category'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CreateBomCategory;