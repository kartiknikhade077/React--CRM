import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Row, Col, Spinner } from "react-bootstrap";
import { toast } from 'react-toastify';
import axiosInstance from '../../BaseComponet/axiosInstance';

// This list should be consistent across your components
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

// Helper to create a lookup map from Label to ID
const labelToIdMap = allFields.reduce((acc, field) => {
  acc[field.label] = field.id;
  return acc;
}, {});

const UpdateBomCategory = ({ show, onClose, onSaveSuccess, categoryToUpdate }) => {
  // State for form data and loading
  const [categoryName, setCategoryName] = useState('');
  const [checkedFields, setCheckedFields] = useState({});
  const [categoryData, setCategoryData] = useState([]); // To store original data with category IDs

  // State for UI control
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Effect to fetch and populate data when the modal opens
  useEffect(() => {
    if (show && categoryToUpdate) {
      const fetchCategoryDetails = async () => {
        setIsLoading(true);
        try {
          const response = await axiosInstance.get(`/kickoff/getCategoryByType/${categoryToUpdate}`);
          const fetchedData = response.data;

          if (fetchedData && fetchedData.length > 0) {
            setCategoryData(fetchedData); // Store the full data array
            setCategoryName(fetchedData[0].categoryType); // Set the initial name

            // Populate the checkboxes based on the fetched status
            const initialCheckedState = {};
            fetchedData.forEach(item => {
              const fieldId = labelToIdMap[item.categoryField];
              if (fieldId) {
                initialCheckedState[fieldId] = item.status;
              }
            });
            setCheckedFields(initialCheckedState);
          }
        } catch (error) {
          console.error("Failed to fetch category details:", error);
          toast.error("Could not load category details.");
          onClose();
        } finally {
          setIsLoading(false);
        }
      };
      fetchCategoryDetails();
    }
  }, [show, categoryToUpdate, onClose]);

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setCheckedFields(prevState => ({ ...prevState, [name]: checked }));
  };

  const handleSelectAll = () => {
    const allSelected = {};
    allFields.forEach(field => {
      allSelected[field.id] = true;
    });
    setCheckedFields(allSelected);
  };

  const handleRequiredOnly = () => {
    const requiredOnly = {};
    allFields.forEach(field => {
      requiredOnly[field.id] = field.required;
    });
    setCheckedFields(requiredOnly);
  };

  const handleSave = async () => {
    if (!categoryName.trim()) {
      toast.error('Category Name is required.');
      return;
    }

    // Format the payload for the update API
    const payload = categoryData.map(item => {
      const fieldId = labelToIdMap[item.categoryField];
      return {
        categoryId: item.categoryId, // The crucial ID for updating
        categoryType: categoryName.trim(),
        categoryField: item.categoryField,
        status: fieldId ? !!checkedFields[fieldId] : false // Get the current status
      };
    });

    setIsSubmitting(true);
    try {
      await axiosInstance.put('/kickoff/updateBOMCategory', payload);
      toast.success(`Category "${categoryName}" updated successfully!`);

      if (onSaveSuccess) {
        onSaveSuccess();
      }
      onClose();

    } catch (error) {
      console.error('Failed to update BOM Category:', error);
      const errorMessage = error.response?.data?.message || 'An error occurred while updating.';
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Modal show={show} onHide={onClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Update BOM Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isLoading ? (
            <div className="text-center">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p>Loading Category Details...</p>
            </div>
          ) : (
            <Form>
              <Form.Group className="mb-4" controlId="categoryName">
                <Form.Label>Category Name *</Form.Label>
                <Form.Control
                  type="text"
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
                          id={`update-checkbox-${field.id}`}
                          name={field.id}
                          label={
                            <>
                              {field.label}
                              {field.required && <span className="required-tag">Required</span>}
                            </>
                          }
                          checked={!!checkedFields[field.id]}
                          onChange={handleCheckboxChange}
                          disabled={field.required || isSubmitting}
                        />
                      </div>
                    </Col>
                  ))}
                </Row>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={isSubmitting || isLoading}>
            {isSubmitting ? 'Updating...' : 'Update Category'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default UpdateBomCategory;