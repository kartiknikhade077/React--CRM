import React, { useEffect, useState } from "react";
import { Accordion, Card, Form, Table } from "react-bootstrap";
import axiosInstance from "../../BaseComponet/axiosInstance";
import Select from "react-select";

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
}) => {
  const [employees, setEmployees] = useState([]);
  // State to hold selected employeeId per department (optional)
  const [selectedEmployees, setSelectedEmployees] = useState(
    departments.reduce((acc, _, idx) => ({ ...acc, [idx]: null }), {})
  );

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axiosInstance.get(
          "/company/getEmployeeList/0/10"
        );
        setEmployees(response.data.employeeList);
      } catch (error) {
        console.error("Failed to fetch employee list", error);
      }
    };
    fetchEmployees();
  }, []);

  // Prepare employee options for react-select once
  const employeeOptions = employees.map((emp) => ({
    value: emp.employeeId,
    label: emp.name,
  }));

  // Handle selection change per department
  const handleChange = (selectedOption, deptIndex) => {
    setSelectedEmployees({
      ...selectedEmployees,
      [deptIndex]: selectedOption,
    });
  };

  // Render react-select dropdown per department
  const renderEmployeeDropdown = (deptIndex) => {
    return (
      <Select
        options={employeeOptions}
        value={selectedEmployees[deptIndex]}
        onChange={(selectedOption) => handleChange(selectedOption, deptIndex)}
        placeholder="Select staff"
        isClearable
        // styles or other props can be customized here
      />
    );
  };

  return (
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
                <th className="col-6">Department</th>
                <th className="col-6">Name</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept, index) => (
                <tr key={index}>
                  <td>
                    <Form.Control value={dept} disabled />
                  </td>
                  <td>{renderEmployeeDropdown(index)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Accordion.Collapse>
    </Card>
  );
};

export default CompanyKickOffSignature;
