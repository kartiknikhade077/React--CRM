import React, { useState, useEffect } from "react";
import { Accordion, Card, Form, Row, Col, Button } from "react-bootstrap";
import axiosInstance from "../../../BaseComponet/axiosInstance";

const CompanyUpdateKickOffSignature = ({
  eventKey,
  activeKey,
  CustomToggle,
  handleAccordionClick,
  onSignatureChange,
  initialSignatureData = [],
  id // ✅ Pass KickOffId from parent
}) => {
  const [signatures, setSignatures] = useState(initialSignatureData);

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
        headName: ""
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
      const payload = signatures.map(sig => ({
        ...sig,
        kickOffId: id
      }));

      await axiosInstance.put("/kickoff/updateKickOffSignature", payload);
      alert("Signatures updated successfully!");
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
        onClick={() => handleAccordionClick(eventKey)}
      >
        Signatures
      </CustomToggle>
      <Accordion.Collapse eventKey={eventKey}>
        <Card.Body>
          {signatures.map((sig, idx) => (
            <Row key={sig.id || idx} className="mb-3 align-items-center">
              <Col md={5}>
                <Form.Group controlId={`departments-${idx}`}>
                  <Form.Label>Department</Form.Label>
                  <Form.Control
                    type="text"
                    value={sig.departments || ""}
                    onChange={(e) =>
                      handleChange(idx, "departments", e.target.value)
                    }
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
                  />
                </Form.Group>
              </Col>
              <Col md={2} className="d-flex align-items-center">
                <Button
                  variant="danger"
                  onClick={() => handleRemoveSignature(idx)}
                >
                  Remove
                </Button>
              </Col>
            </Row>
          ))}

          <div className="mt-3">
            <Button onClick={handleAddSignature} variant="outline-primary" size="sm" className="me-2">
              + Add Signature
            </Button>

            {/* ✅ Save Button */}
            <Button onClick={handleUpdateSignatures} variant="primary">
              Update Signatures
            </Button>
          </div>
        </Card.Body>
      </Accordion.Collapse>
    </Card>
  );
};

export default CompanyUpdateKickOffSignature;
