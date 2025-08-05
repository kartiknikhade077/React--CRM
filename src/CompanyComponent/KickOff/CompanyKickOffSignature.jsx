import React from "react";
import { Accordion, Card, Form, Row, Col, Table } from "react-bootstrap";

const departments = [
  "Chemical",
  "Enginnering",
  "Marketing",
  "Mechanical",
  "Quality Assurance",
];

const CompanyKickOffSignature = ({
  eventKey,
  activeKey,
  CustomToggle,
  handleAccordionClick,
}) => (
  <Card className="mb-3 shadow-sm border-0">
    <CustomToggle
      eventKey={eventKey}
      activeKey={activeKey}
      onClick={() => handleAccordionClick(eventKey)}
    >
      Signature
    </CustomToggle>
    <Accordion.Collapse eventKey={eventKey}>
      <Card.Body>
    
          <Table bordered hover responsive>
            <thead className="bg-light">
              <tr>
                <th>Department</th>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept, index) => (
                <tr key={index}>
                  <td>
                    <Form.Control value={dept} disabled />
                  </td>
                  <td>
                    <Form.Select>
                      <option>Select staff</option>
                      <option>Staff A</option>
                      <option>Staff B</option>
                      <option>Staff C</option>
                    </Form.Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        
      </Card.Body>
    </Accordion.Collapse>
  </Card>
);

export default CompanyKickOffSignature;
