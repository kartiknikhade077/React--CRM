import React, { useState, useEffect } from "react";
import { Accordion, Card, Form, Row, Col, Button } from "react-bootstrap";
import axiosInstance from "../../../BaseComponet/axiosInstance";

// Table structure with correct order and placeholder values
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
  { title: "Remarks", values: ["Enter remarks here", "", "", ""] },
];

const requirementFields = [
  "requirementOne",
  "requirementTwo",
  "requirementThree",
  "requirementFour",
];

const CompanyUpdateKickOffCustomerRequirements = ({
  eventKey,
  activeKey,
  CustomToggle,
  handleAccordionClick,
  onCustomerRequirementsChange,
  initialRequirements = [],
  companyId,
  employeeId,
  id,
}) => {
  const [requirements, setRequirements] = useState(initialRequirements);
  const [isEditable, setIsEditable] = useState(false);
  const [activeCell, setActiveCell] = useState(null);

  // Ensure internal state matches external initialRequirements
  useEffect(() => {
    setRequirements(initialRequirements);
  }, [initialRequirements]);

  // Map requirements by requirementType (trimmed, case sensitive)
  const reqMap = requirements.reduce((acc, req) => {
    acc[req.requirementType?.trim()] = req;
    return acc;
  }, {});

  // Get the index of a type in requirements array; fallback to -1 if not found
  const findReqIndex = (title) =>
    requirements.findIndex(
      (req) =>
        req.requirementType && req.requirementType.trim() === title.trim()
    );

  // Unified change handler
  const handleChange = (index, field, value) => {
    if (index === -1) return; // If not found
    const newReqs = [...requirements];
    newReqs[index] = { ...newReqs[index], [field]: value };
    setRequirements(newReqs);
    onCustomerRequirementsChange?.(newReqs);
  };

  // Focus handler for placeholder logic and cell coloring
  const handleFocus = (title, field, placeholderValue) => {
    if (!isEditable) return;
    setActiveCell(`${title}-${field}`);
    const idx = findReqIndex(title);
    const currValue = requirements[idx]?.[field] || "";
    if (!currValue) {
      handleChange(idx, field, placeholderValue);
    } else if (currValue === placeholderValue) {
      handleChange(idx, field, "");
    } // else: has custom value, leave as is unless user clears
  };

  // Save to backend
  const handleUpdateRequirements = async () => {
    try {
      const payload = requirements.map((req) => ({
        ...req,
        kickOffId: id,
        companyId,
        employeeId,
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
        onClick={() => handleAccordionClick(eventKey)}
      >
        <div className="d-flex justify-content-between">
          <h5>Customer Requirements</h5>
        </div>
      </CustomToggle>

      <div className="text-end mx-3 mt-2">
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
            >
              Cancel
            </Button>
          </>
        )}
      </div>

      <Accordion.Collapse eventKey={eventKey}>
        <Card.Body>
          {tableStructure.map((row, rowIdx) => {
            const req = reqMap[row.title];
            const isRemarksRow = row.title === "Remarks";
            if (isRemarksRow) {
              // Single full-width remarks row, matching the create UI
              return (
                <Row key={row.title} className="mb-3">
                  <Col md={4}>
                    <Form.Control
                      type="text"
                      className="rounded-0 fw-bold"
                      value={row.title}
                      disabled
                    />
                  </Col>
                  <Col md={8}>
                    <Form.Control
                      type="text"
                      placeholder={row.values[0] || "Enter remarks here"}
                      value={req?.requirementOne || ""}
                      readOnly={!isEditable}
                      onChange={(e) =>
                        handleChange(
                          findReqIndex(row.title),
                          "requirementOne",
                          e.target.value
                        )
                      }
                      style={{
                        backgroundColor:
                          (req?.requirementOne || "").trim() !== ""
                            ? "#f7ff5c"
                            : "white",
                      }}
                    />
                  </Col>
                </Row>
              );
            }
            // Default 4-column requirement row
            return (
              <Row key={row.title} className="mb-3">
                <Col md={4}>
                  <Form.Control
                    type="text"
                    className="rounded-0 fw-bold"
                    value={row.title}
                    disabled
                  />
                </Col>
                {requirementFields.map((field, colIdx) => (
                  <Col md={2} key={field}>
                    <Form.Control
                      type="text"
                      placeholder={row.values[colIdx] || ""}
                      value={req ? req[field] || "" : ""}
                      readOnly={!isEditable}
                      onClick={() =>
                        handleFocus(row.title, field, row.values[colIdx] || "")
                      }
                      onChange={(e) =>
                        handleChange(
                          findReqIndex(row.title),
                          field,
                          e.target.value
                        )
                      }
                      style={{
                        backgroundColor:
                          (req?.[field] || "").trim() !== ""
                            ? "#f7ff5c"
                            : activeCell === `${row.title}-${field}`
                            ? "#ffeeba"
                            : "white",
                      }}
                    />
                  </Col>
                ))}
              </Row>
            );
          })}
        </Card.Body>
      </Accordion.Collapse>
    </Card>
  );
};

export default CompanyUpdateKickOffCustomerRequirements;

// import React, { useState, useEffect } from "react";
// import { Accordion, Card, Form, Row, Col, Button } from "react-bootstrap";
// import axiosInstance from "../../../BaseComponet/axiosInstance";

// const CompanyUpdateKickOffCustomerRequirements = ({
//   eventKey,
//   activeKey,
//   CustomToggle,
//   handleAccordionClick,
//   onCustomerRequirementsChange,
//   initialRequirements = [],
//   companyId,
//   employeeId,
//   id, // ✅ pass kickOffId from parent!
// }) => {
//   const [requirements, setRequirements] = useState(initialRequirements);
//   const [isEditable, setIsEditable] = useState(false);
//   useEffect(() => {
//     setRequirements(initialRequirements);
//   }, [initialRequirements]);

//   const handleChange = (index, field, value) => {
//     const newReqs = [...requirements];
//     newReqs[index] = { ...newReqs[index], [field]: value };
//     setRequirements(newReqs);
//     onCustomerRequirementsChange(newReqs);
//   };

//   // ✅ Independent Save for Customer Requirements
//   const handleUpdateRequirements = async () => {
//     try {
//       // Build payload in same shape API expects ⬇
//       const payload = requirements.map((req) => ({
//         ...req,
//         kickOffId: id,
//         companyId: companyId,
//         employeeId: employeeId,
//       }));

//       await axiosInstance.put("/kickoff/updateCustomerRequirements", payload);

//       alert("Customer Requirements updated successfully!");
//          setIsEditable(false);
//     } catch (error) {
//       console.error("Failed to update customer requirements:", error);
//       alert("Failed to update customer requirements");
//     }
//   };

//   if (!Array.isArray(requirements)) return null;

//   return (
//     <Card className="mb-3 shadow-sm border-0">
//       <CustomToggle
//         eventKey={eventKey}
//         activeKey={activeKey}
//         handleAccordionClick={() => handleAccordionClick(eventKey)}
//       >
//         <div className="d-flex justify-content-between">
//           <h5> Customer Requirements</h5>
//         </div>
//       </CustomToggle>

//       <div className="text-end mx-3 mt-2">
//         {/* NEW - Edit / Save Button */}
//         {!isEditable ? (
//           <Button
//             variant="btn btn-outline-dark btn-sm"
//             size="sm"
//             onClick={() => setIsEditable(true)}
//           >
//             Edit
//           </Button>
//         ) : (
//           <>
//             <Button
//               variant="btn btn-outline-success btn-sm mx-2"
//               size="sm"
//               onClick={handleUpdateRequirements}
//             >
//               Save
//             </Button>

//             <Button
//               onClick={() => {
//                 setRequirements(initialRequirements);
//                 setIsEditable(false);
//               }}
//               variant="btn btn-outline-secondary btn-sm"
//               className=""
//             >
//               Cancel
//             </Button>
//           </>
//         )}
//       </div>
//       <Accordion.Collapse eventKey={eventKey}>
//         <Card.Body>
//           {requirements.map((req, idx) => (
//             <Row key={req.requirementId || idx} className="mb-3">
//               <Col md={4}>
//                 <Form.Control
//                   type="text"
//                   className="rounded-0 fw-bold"
//                   placeholder="Requirement Type"
//                   value={req.requirementType || ""}
//                   disabled
//                   onChange={(e) =>
//                     handleChange(idx, "requirementType", e.target.value)
//                   }
//                 />
//               </Col>
//               <Col md={2}>
//                 <Form.Control
//                   type="text"
//                   placeholder="Requirement One"
//                   value={req.requirementOne || ""}
//                   readOnly={!isEditable}
//                   onChange={(e) =>
//                     handleChange(idx, "requirementOne", e.target.value)
//                   }
//                 />
//               </Col>
//               <Col md={2}>
//                 <Form.Control
//                   type="text"
//                   placeholder="Requirement Two"
//                   value={req.requirementTwo || ""}
//                   readOnly={!isEditable}
//                   onChange={(e) =>
//                     handleChange(idx, "requirementTwo", e.target.value)
//                   }
//                 />
//               </Col>
//               <Col md={2}>
//                 <Form.Control
//                   type="text"
//                   placeholder="Requirement Three"
//                   value={req.requirementThree || ""}
//                   readOnly={!isEditable}
//                   onChange={(e) =>
//                     handleChange(idx, "requirementThree", e.target.value)
//                   }
//                 />
//               </Col>
//               <Col md={2}>
//                 <Form.Control
//                   type="text"
//                   placeholder="Requirement Three"
//                   value={req.requirementFour || ""}
//                   readOnly={!isEditable}
//                   onChange={(e) =>
//                     handleChange(idx, "requirementFour", e.target.value)
//                   }
//                 />
//               </Col>
//             </Row>
//           ))}

//         </Card.Body>
//       </Accordion.Collapse>
//     </Card>
//   );
// };

// export default CompanyUpdateKickOffCustomerRequirements;
