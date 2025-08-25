import React, { useState, useEffect } from "react";
import { Accordion, Card, Form, Row, Col, Button } from "react-bootstrap";
import axiosInstance from "../../../BaseComponet/axiosInstance";
import Select from "react-select";

const CompanyUpdateKickOffSignature = ({
  eventKey,
  activeKey,
  CustomToggle,
  handleAccordionClick,
  onSignatureChange,
  initialSignatureData = [],
  id,
}) => {
  const [signatures, setSignatures] = useState(initialSignatureData);
  const [isEditable, setIsEditable] = useState(false);
  const [employees, setEmployees] = useState([]);

  // 🔹 Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axiosInstance.get(
          "/company/getEmployeeList/0/100"
        );
        setEmployees(response.data.employeeList);
      } catch (error) {
        console.error("Failed to fetch employees:", error);
      }
    };
    fetchEmployees();
  }, []);

  // 🔹 react-select options
  const employeeOptions = employees.map((emp) => ({
    value: emp.employeeId,
    label: emp.name,
  }));

  // Sync with initial props
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
      { id: null, kickOffId: id, departments: "", headName: "" },
    ]);
  };

  const handleRemoveSignature = (index) => {
    const newSignatures = signatures.filter((_, i) => i !== index);
    setSignatures(newSignatures);
    onSignatureChange(newSignatures);
  };

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
          {/* Buttons */}
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
            <Row key={sig.id || idx} className="mb-3">
              {/* Department */}
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

              {/* Head Name Dropdown/Text */}
              <Col md={5}>
                <Form.Group controlId={`headName-${idx}`}>
                  <Form.Label>Head Name</Form.Label>
                  {!isEditable ? (
                    <Form.Control
                      type="text"
                      value={sig.headName || ""}
                      disabled
                    />
                  ) : (
                    <Select
                      options={employeeOptions}
                      value={
                        employeeOptions.find(
                          (opt) => opt.label === sig.headName
                        ) || null
                      }
                      onChange={(selected) =>
                        handleChange(
                          idx,
                          "headName",
                          selected ? selected.label : ""
                        )
                      }
                      placeholder="Select employee"
                      isClearable
                      menuPortalTarget={document.body}
                      styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                        menu: (base) => ({ ...base, zIndex: 9999 }),
                      }}
                    />
                  )}
                </Form.Group>
              </Col>

              {/* Delete Button */}
              <Col md={2} className="d-flex align-items-end p-0">
                <Button
                  variant="btn btn-outline-danger btn-sm"
                  onClick={() => handleRemoveSignature(idx)}
                  disabled={!isEditable}
                >
                  Delete
                </Button>
              </Col>
            </Row>
          ))}

          {/* Add new signature */}
          {isEditable && (
            <div className="mt-3">
              <Button
                onClick={handleAddSignature}
                variant="outline-primary"
                size="sm"
                className="me-2"
              >
                + Add Signature
              </Button>
            </div>
          )}
        </Card.Body>
      </Accordion.Collapse>
    </Card>
  );
};

export default CompanyUpdateKickOffSignature;
