import React, { useState, useEffect } from "react";
import { Accordion, Card, Table, Form } from "react-bootstrap";

const tableStructure = [
  { title: "Inserts (Main/CAM)", values: ["SDK11", "HCHCR", "D2 IMP", "HMD5"] },
  {
    title: "Standard Material",
    values: ["Misumi", "Fibro", "Avi Oilless", "Pawan"],
  },
  {
    title: "Heat Treatment HT",
    values: ["VACCUM HT", "Normal", "No", "Extra At Actual"],
  },
  { title: "HT Certificate", values: ["Required", "Not Required", "-", "-"] },
  {
    title: "Tool Construction",
    values: ["SG600", "FG300", "GGG70L", "FCD550"],
  },
  {
    title: "Coating Considered",
    values: ["At Actual", "PVD Coating At Bohler Only", "Hardchrome", "Epoxy"],
  },
  { title: "Tryout RM", values: ["Customer Scope", "-", "-", "-"] },
  {
    title: "Spare Quantity",
    values: ["No", "10% BOM Quantity (Minimum 1)", "-", "-"],
  },
  {
    title: "Spare Items",
    values: [
      "Critical Inserts",
      "Die Buttons & Punch",
      "Coil Springs",
      "Gas Springs / Stripper Bolt",
    ],
  },
  {
    title: "Tool Life Considered",
    values: ["Proto", "2 Lacs", "5 Lacs", "10 Lacs"],
  },
  {
    title: "Checking Fixture",
    values: ["Not In Our Scope", "Aluminum", "Steel Body", "CIBA"],
  },
  {
    title: "Transport",
    values: ["Customer Scope", "Planetto Scope", "-", "-"],
  },
];

const CompanyKickOffCustomerRequirements = ({
  eventKey,
  activeKey,
  CustomToggle,
  handleAccordionClick,
  onCustomerRequirementsChange,
  companyId = "",
  employeeId = "",
}) => {
  const initialTableData = tableStructure.map((row) => [...row.values]);
  const [tableData, setTableData] = useState(initialTableData);
  const [remarks, setRemarks] = useState("");

  // Send updated data upwards on any change
  useEffect(() => {
    if (!onCustomerRequirementsChange) return;

    const dataToSend = tableStructure.map((row, rowIdx) => ({
      requirementType: row.title,
      kickOffId: "", // to be set in parent before sending API
      companyId,
      employeeId,
      requirementOne: tableData[rowIdx][0],
      requirementTwo: tableData[rowIdx][1],
      requirementThree: tableData[rowIdx][2],
      requirementFour: tableData[rowIdx][3],
    }));

    dataToSend.push({
      requirementType: "Remarks",
      kickOffId: "",
      companyId,
      employeeId,
      requirementOne: remarks,
    });

    onCustomerRequirementsChange(dataToSend);
  }, [tableData, remarks, onCustomerRequirementsChange, companyId, employeeId]);

  const handleChange = (rowIdx, colIdx, value) => {
    const updated = tableData.map((row, r) =>
      row.map((cell, c) => (r === rowIdx && c === colIdx ? value : cell))
    );
    setTableData(updated);
  };

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
          <Table bordered hover responsive className="mb-0">
            <tbody>
              {tableStructure.map((row, rowIdx) => (
                <tr key={rowIdx}>
                  <th className="bg-primary text-white">{row.title}</th>
                  {row.values.map((cell, colIdx) => (
                    <td key={colIdx}>
                      <Form.Control
                        type="text"
                        value={tableData[rowIdx][colIdx]}
                        onChange={(e) =>
                          handleChange(rowIdx, colIdx, e.target.value)
                        }
                      />
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <th className="bg-primary text-white">Remarks</th>
                <td colSpan="4">
                  <Form.Control
                    type="text"
                    placeholder="Enter remarks here"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </td>
              </tr>
            </tbody>
          </Table>
        </Card.Body>
      </Accordion.Collapse>
    </Card>
  );
};

export default CompanyKickOffCustomerRequirements;
