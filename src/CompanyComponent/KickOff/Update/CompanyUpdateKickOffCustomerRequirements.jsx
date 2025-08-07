import React, { useState, useEffect } from "react";
import { Accordion, Card, Form, Row, Col, Button } from "react-bootstrap";

const CompanyUpdateKickOffCustomerRequirements = ({
  eventKey,
  activeKey,
  CustomToggle,
  handleAccordionClick,
  onCustomerRequirementsChange,
  initialRequirements = [],
  companyId,
  employeeId,
}) => {
  const [requirements, setRequirements] = useState(initialRequirements);

  useEffect(() => {
    setRequirements(initialRequirements);
  }, [initialRequirements]);

  const handleChange = (index, field, value) => {
    const newReqs = [...requirements];
    newReqs[index] = { ...newReqs[index], [field]: value };
    setRequirements(newReqs);
    onCustomerRequirementsChange(newReqs);
  };

  // UI rendering for list of requirements with input controls, add/remove buttons, etc.
  // Follow your create component UI

  if (!Array.isArray(requirements)) return null;

  return (
    <Card className="mb-3 shadow-sm border-0">
      <CustomToggle
        eventKey={eventKey}
        activeKey={activeKey}
        onClick={() => handleAccordionClick(eventKey)}
      >
        Customer Requirements
      </CustomToggle>
      <Accordion.Collapse eventKey={eventKey}>
        <Card.Body>
          {requirements.map((req, idx) => (
            <Row key={req.requirementId || idx} className="mb-3">
              <Col md={3}>
                <Form.Control
                  type="text"
                  placeholder="Requirement Type"
                  value={req.requirementType || ""}
                  onChange={(e) =>
                    handleChange(idx, "requirementType", e.target.value)
                  }
                />
              </Col>
              <Col md={3}>
                <Form.Control
                  type="text"
                  placeholder="Requirement One"
                  value={req.requirementOne || ""}
                  onChange={(e) =>
                    handleChange(idx, "requirementOne", e.target.value)
                  }
                />
              </Col>
              <Col md={3}>
                <Form.Control
                  type="text"
                  placeholder="Requirement Two"
                  value={req.requirementTwo || ""}
                  onChange={(e) =>
                    handleChange(idx, "requirementTwo", e.target.value)
                  }
                />
              </Col>
              <Col md={3}>
                <Form.Control
                  type="text"
                  placeholder="Requirement Three"
                  value={req.requirementThree || ""}
                  onChange={(e) =>
                    handleChange(idx, "requirementThree", e.target.value)
                  }
                />
              </Col>
              {/* Optionally add remove or other action buttons */}
            </Row>
          ))}
          {/* Optionally add button to add new requirement */}
          <Button
            onClick={() => {
              setRequirements([
                ...requirements,
                {
                  requirementId: null,
                  requirementType: "",
                  requirementOne: "",
                  requirementTwo: "",
                  requirementThree: "",
                  requirementFour: "",
                  kickOffId: "",
                  companyId,
                  employeeId,
                },
              ]);
            }}
          >
            Add Requirement
          </Button>
        </Card.Body>
      </Accordion.Collapse>
    </Card>
  );
};

export default CompanyUpdateKickOffCustomerRequirements;
