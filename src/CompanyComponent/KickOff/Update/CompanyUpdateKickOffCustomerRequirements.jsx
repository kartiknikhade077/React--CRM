import React, { useState, useEffect } from "react";
import { Accordion, Card, Form, Row, Col, Button } from "react-bootstrap";
import axiosInstance from "../../../BaseComponet/axiosInstance";

// ✅ Placeholder structure
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

  useEffect(() => {
    setRequirements(initialRequirements);
  }, [initialRequirements]);

  const handleChange = (index, field, value) => {
    const newReqs = [...requirements];
    newReqs[index] = { ...newReqs[index], [field]: value };
    setRequirements(newReqs);
    onCustomerRequirementsChange(newReqs);
  };

  const handleFocus = (rowIdx, field, placeholderValue) => {
    if (!isEditable) return; // Only work in edit mode

    const currentValue = requirements[rowIdx][field];

    if (!currentValue) {
      // Empty → set placeholder into input
      handleChange(rowIdx, field, placeholderValue);
    } else if (currentValue === placeholderValue) {
      // Already has placeholder → clear it
      handleChange(rowIdx, field, "");
    } else {
      // Has custom text → clear it
      handleChange(rowIdx, field, "");
    }
  };

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
        handleAccordionClick={() => handleAccordionClick(eventKey)}
      >
        <div className="d-flex justify-content-between">
          <h5> Customer Requirements</h5>
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
          {requirements.map((req, rowIdx) => (
            <Row key={req.requirementId || rowIdx} className="mb-3">
              <Col md={4}>
                <Form.Control
                  type="text"
                  className="rounded-0 fw-bold"
                  value={req.requirementType || ""}
                  disabled
                />
              </Col>
              {[
                "requirementOne",
                "requirementTwo",
                "requirementThree",
                "requirementFour",
              ].map((field, colIdx) => (
                <Col md={2} key={field}>
                  <Form.Control
                    type="text"
                    placeholder={tableStructure[rowIdx]?.values[colIdx] || ""}
                    value={req[field] || ""}
                    readOnly={!isEditable}
                    onClick={() =>
                      handleFocus(
                        rowIdx,
                        field,
                        tableStructure[rowIdx]?.values[colIdx] || ""
                      )
                    }
                    onChange={(e) =>
                      handleChange(rowIdx, field, e.target.value)
                    }
                    style={{
                      backgroundColor:
                        (req[field] || "").trim() !== ""
                          ? "#f7ff5c" // light green when data present
                          : activeCell === `${rowIdx}-${field}`
                          ? "#ffeeba" // light yellow when active
                          : "white", // default
                    }}
                  />
                </Col>
              ))}
            </Row>
          ))}
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
