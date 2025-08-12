import React, { useState, useEffect } from "react";
import { Accordion, Card, Form, Row, Col, Button } from "react-bootstrap";
import axiosInstance from "../../../BaseComponet/axiosInstance";

const CompanyUpdateKickOffCustomerRequirements = ({
  eventKey,
  activeKey,
  CustomToggle,
  handleAccordionClick,
  onCustomerRequirementsChange,
  initialRequirements = [],
  companyId,
  employeeId,
  id // ✅ pass kickOffId from parent!
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

  // ✅ Independent Save for Customer Requirements
  const handleUpdateRequirements = async () => {
    try {
      // Build payload in same shape API expects ⬇
      const payload = requirements.map((req) => ({
        ...req,
        kickOffId: id,
        companyId: companyId,
        employeeId: employeeId
      }));

      await axiosInstance.put("/kickoff/updateCustomerRequirements", payload);

      alert("Customer Requirements updated successfully!");
    } catch (error) {
      console.error("Failed to update customer requirements:", error);
      alert("Failed to update customer requirements");
    }
  };

  if (!Array.isArray(requirements)) return null;

  return (
    <Card className="mb-3 shadow-sm border-0">
      <CustomToggle
        eventKey={eventKey}
        activeKey={activeKey}
        handleAccordionClick={() => handleAccordionClick(eventKey)}
      >
        <div className="d-flex justify-content-between">
          <h5> Customer Requirements</h5>
        </div>
      </CustomToggle>

      <div className="text-end">
        <Button
          variant="primary"
          className="mt-2 mx-2"
          onClick={handleUpdateRequirements}
        >
          Update Requirements
        </Button>
      </div>
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
            </Row>
          ))}

          {/* Add Requirement Button */}
          <Button
            variant="outline-secondary"
            size="sm"
            className="me-2"
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
                  kickOffId: id,
                  companyId,
                  employeeId,
                },
              ]);
            }}
          >
            + Add Requirement
          </Button>

          {/* ✅ Update Button */}
        </Card.Body>
      </Accordion.Collapse>
    </Card>
  );
};

export default CompanyUpdateKickOffCustomerRequirements;
