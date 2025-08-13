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
  id, // ✅ pass kickOffId from parent!
}) => {
  const [requirements, setRequirements] = useState(initialRequirements);
  const [isEditable, setIsEditable] = useState(false);
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
        employeeId: employeeId,
      }));

      await axiosInstance.put("/kickoff/updateCustomerRequirements", payload);

      alert("Customer Requirements updated successfully!");
         setIsEditable(false);
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

      <div className="text-end mx-3 mt-2">
        {/* NEW - Edit / Save Button */}
        {!isEditable ? (
          <Button
            variant="btn btn-outline-dark btn-sm"
            size="sm"
            onClick={() => setIsEditable(true)}
          >
            Edit
          </Button>
        ) : (
          <>
            <Button
              variant="btn btn-outline-success btn-sm mx-2"
              size="sm"
              onClick={handleUpdateRequirements}
            >
              Save
            </Button>

            <Button
              onClick={() => {
                setRequirements(initialRequirements);
                setIsEditable(false);
              }}
              variant="btn btn-outline-secondary btn-sm"
              className=""
            >
              Cancel
            </Button>
          </>
        )}
      </div>
      <Accordion.Collapse eventKey={eventKey}>
        <Card.Body>
          {requirements.map((req, idx) => (
            <Row key={req.requirementId || idx} className="mb-3">
              <Col md={4}>
                <Form.Control
                  type="text"
                  className="rounded-0 fw-bold"
                  placeholder="Requirement Type"
                  value={req.requirementType || ""}
                  disabled
                  onChange={(e) =>
                    handleChange(idx, "requirementType", e.target.value)
                  }
                />
              </Col>
              <Col md={2}>
                <Form.Control
                  type="text"
                  placeholder="Requirement One"
                  value={req.requirementOne || ""}
                  readOnly={!isEditable}
                  onChange={(e) =>
                    handleChange(idx, "requirementOne", e.target.value)
                  }
                />
              </Col>
              <Col md={2}>
                <Form.Control
                  type="text"
                  placeholder="Requirement Two"
                  value={req.requirementTwo || ""}
                  readOnly={!isEditable}
                  onChange={(e) =>
                    handleChange(idx, "requirementTwo", e.target.value)
                  }
                />
              </Col>
              <Col md={2}>
                <Form.Control
                  type="text"
                  placeholder="Requirement Three"
                  value={req.requirementThree || ""}
                  readOnly={!isEditable}
                  onChange={(e) =>
                    handleChange(idx, "requirementThree", e.target.value)
                  }
                />
              </Col>
              <Col md={2}>
                <Form.Control
                  type="text"
                  placeholder="Requirement Three"
                  value={req.requirementFour || ""}
                  readOnly={!isEditable}
                  onChange={(e) =>
                    handleChange(idx, "requirementFour", e.target.value)
                  }
                />
              </Col>
            </Row>
          ))}

          {/* Add Requirement Button */}
          {/* <Button
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
          </Button> */}

          {/* ✅ Update Button */}
        </Card.Body>
      </Accordion.Collapse>
    </Card>
  );
};

export default CompanyUpdateKickOffCustomerRequirements;
