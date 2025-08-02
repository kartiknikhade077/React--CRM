import React, { useState } from "react";
import { Accordion, Button, Form } from "react-bootstrap";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

import CompanySidebar from "../CompanySidebar";
import CompanyTopbar from "../CompanyTopbar";

import CompanyKickoffsheetCustomerData from "../KickOff/CompanyKickoffsheetCustomerData";
import CompanyKickOffCustomerRequirements from "../KickOff/CompanyKickOffCustomerRequirements";
import ProjectRegistrationKickoffSheet from "../KickOff/ProjectRegistrationKickoffSheet";
import CompanyKickOffSignature from "../KickOff/CompanyKickOffSignature";

const CustomToggle = ({ children, eventKey, activeKey, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: "#1a3c8c",
      color: "#fff",
      padding: "12px 16px",
      cursor: "pointer",
      fontWeight: "bold",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: "1px solid #fff",
      borderRadius: activeKey === eventKey ? "8px 8px 0 0" : "8px",
    }}
  >
    <span>{children}</span>
    {activeKey === eventKey ? <FaChevronUp /> : <FaChevronDown />}
  </div>
);

const CompanyCreateKickoffSheet = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeKeys, setActiveKeys] = useState(["0", "1", "2", "3"]); // all open initially

  const handleAccordionClick = (eventKey) => {
    setActiveKeys(
      (prev) =>
        prev.includes(eventKey)
          ? prev.filter((key) => key !== eventKey) // close
          : [...prev, eventKey] // open
    );
  };

  return (
    <>
      <CompanyTopbar onToggle={() => setIsCollapsed(!isCollapsed)} />
      <div className="slidebar-main-div">
        <CompanySidebar isCollapsed={isCollapsed} />
        <div className="slidebar-main-div-right-section p-3">
          <Form>
            <Accordion activeKey={activeKeys} alwaysOpen>
              <CompanyKickoffsheetCustomerData
                eventKey="0"
                activeKey={activeKeys}
                CustomToggle={CustomToggle}
                handleAccordionClick={handleAccordionClick}
              />
              <ProjectRegistrationKickoffSheet
                eventKey="1"
                activeKey={activeKeys}
                CustomToggle={CustomToggle}
                handleAccordionClick={handleAccordionClick}
              />
              <CompanyKickOffCustomerRequirements
                eventKey="2"
                activeKey={activeKeys}
                CustomToggle={CustomToggle}
                handleAccordionClick={handleAccordionClick}
              />
              <CompanyKickOffSignature
                eventKey="3"
                activeKey={activeKeys}
                CustomToggle={CustomToggle}
                handleAccordionClick={handleAccordionClick}
              />
            </Accordion>

            <div className="d-flex justify-content-end gap-2 mt-4 p-3 bg-white rounded-bottom shadow-sm">
              <Button
                variant="outline-primary"
                onClick={() => alert("Preview Clicked")}
              >
                Preview
              </Button>
              <Button variant="primary" onClick={() => alert("Save Clicked")}>
                <i className="bi bi-save me-1"></i> Save
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </>
  );
};


export default CompanyCreateKickoffSheet;
