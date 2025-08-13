import React, { useState, useEffect } from "react";
import { Accordion, Card, Form, Row, Col, Button } from "react-bootstrap";
import axiosInstance from "../../../BaseComponet/axiosInstance";
import { FaTrash, FaPlusCircle } from "react-icons/fa";
const CompanyUpdateKickOffSignature = ({
  eventKey,
  activeKey,
  CustomToggle,
  handleAccordionClick,
  onSignatureChange,
  initialSignatureData = [],
  id, // ✅ Pass KickOffId from parent
}) => {
  const [signatures, setSignatures] = useState(initialSignatureData);
  const [isEditable, setIsEditable] = useState(false);
  // Sync state from props
  useEffect(() => {
    setSignatures(initialSignatureData);
  }, [initialSignatureData]);

  const handleChange = (index, field, value) => {
    const newSignatures = [...signatures];
    newSignatures[index] = { ...newSignatures[index], [field]: value };
    setSignatures(newSignatures);
    onSignatureChange(newSignatures);
  };

  const handleAddSignature = () => {
    setSignatures([
      ...signatures,
      {
        id: null,
        kickOffId: id,
        departments: "",
        headName: "",
      },
    ]);
  };

  const handleRemoveSignature = (index) => {
    const newSignatures = signatures.filter((_, i) => i !== index);
    setSignatures(newSignatures);
    onSignatureChange(newSignatures);
  };

  // ✅ Independent Save for Signatures
  const handleUpdateSignatures = async () => {
    try {
      const payload = signatures.map((sig) => ({
        ...sig,
        kickOffId: id,
      }));

      await axiosInstance.put("/kickoff/updateKickOffSignature", payload);
      alert("Signatures updated successfully!");
       setIsEditable(false); 
    } catch (error) {
      console.error("Failed to update signatures:", error);
      alert("Failed to update signatures");
    }
  };

  return (
    <Card className="mb-3 shadow-sm border-0">
      <CustomToggle
        eventKey={eventKey}
        activeKey={activeKey}
        handleAccordionClick={() => handleAccordionClick(eventKey)}
      >
        Signatures
      </CustomToggle>
      <Accordion.Collapse eventKey={eventKey}>
        <Card.Body>
          {/* Top Right Buttons */}
          <div className="text-end">
            {!isEditable ? (
              <Button
                onClick={() => setIsEditable(true)}
                variant="btn btn-outline-dark btn-sm"
                className="mt-2 mx-2"
              >
                Edit
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleUpdateSignatures}
                  variant="btn btn-outline-success btn-sm"
                  className="mt-2 mx-2"
                >
                  Save
                </Button>
                <Button
                  onClick={() => {
                    setSignatures(initialSignatureData);
                    setIsEditable(false);
                  }}
                  variant="btn btn-outline-secondary btn-sm"
                  className="mt-2 mx-2"
                >
                  Cancel
                </Button>
              </>
            )}
          </div>

          {signatures.map((sig, idx) => (
            <Row key={sig.id || idx} className="mb-3 ">
              <Col md={5}>
                <Form.Group controlId={`departments-${idx}`}>
                  <Form.Label>Department</Form.Label>
                  <Form.Control
                    type="text"
                    value={sig.departments || ""}
                    onChange={(e) =>
                      handleChange(idx, "departments", e.target.value)
                    }
                    disabled={!isEditable}
                  />
                </Form.Group>
              </Col>
              <Col md={5}>
                <Form.Group controlId={`headName-${idx}`}>
                  <Form.Label>Head Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={sig.headName || ""}
                    onChange={(e) =>
                      handleChange(idx, "headName", e.target.value)
                    }
                    disabled={!isEditable}
                  />
                </Form.Group>
              </Col>
              <Col md={2} className="d-flex align-items-end p-0">
                <Button
                  variant="btn btn-outline-danger btn-sm"
                  onClick={() => handleRemoveSignature(idx)}
                >
                  delete
                </Button>
              </Col>
            </Row>
          ))}

          <div className="mt-3">
            <Button
              onClick={handleAddSignature}
              variant="outline-primary"
              size="sm"
              className="me-2"
            >
              + Add Signature
            </Button>

            {/* ✅ Save Button */}
          </div>
        </Card.Body>
      </Accordion.Collapse>
    </Card>
  );
};

export default CompanyUpdateKickOffSignature;
