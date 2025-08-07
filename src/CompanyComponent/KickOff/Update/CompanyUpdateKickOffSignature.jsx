import React, { useState, useEffect } from "react";
import { Accordion, Card, Form, Row, Col, Button } from "react-bootstrap";

const CompanyUpdateKickOffSignature = ({
  eventKey,
  activeKey,
  CustomToggle,
  handleAccordionClick,
  onSignatureChange,
  initialSignatureData = [],
}) => {
  const [signatures, setSignatures] = useState(initialSignatureData);

  // Update local state when initial data changes
  useEffect(() => {
    setSignatures(initialSignatureData);
  }, [initialSignatureData]);

  const handleChange = (index, field, value) => {
    const newSignatures = [...signatures];
    newSignatures[index] = { ...newSignatures[index], [field]: value };
    setSignatures(newSignatures);
    onSignatureChange(newSignatures);
  };

  // Optional: Add new signature entry
  const handleAddSignature = () => {
    setSignatures([
      ...signatures,
      {
        id: null,
        kickOffId: "",
        departments: "",
        headName: "",
      },
    ]);
  };

  // Optional: Remove signature entry
  const handleRemoveSignature = (index) => {
    const newSignatures = signatures.filter((_, i) => i !== index);
    setSignatures(newSignatures);
    onSignatureChange(newSignatures);
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
          <Button onClick={handleAddSignature} variant="primary">
            Add Signature
          </Button>
        </Card.Body>
      </Accordion.Collapse>
    </Card>
  );
};

export default CompanyUpdateKickOffSignature;
