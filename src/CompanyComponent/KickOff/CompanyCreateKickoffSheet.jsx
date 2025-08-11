import React, { useState, useEffect } from "react";
import { Accordion, Button, Form } from "react-bootstrap";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

import CompanySidebar from "../CompanySidebar";
import CompanyTopbar from "../CompanyTopbar";

import CompanyKickoffsheetCustomerData from "../KickOff/CompanyKickoffsheetCustomerData";
import CompanyKickOffCustomerRequirements from "../KickOff/CompanyKickOffCustomerRequirements";
import ProjectRegistrationKickoffSheet from "../KickOff/ProjectRegistrationKickoffSheet";
import CompanyKickOffSignature from "../KickOff/CompanyKickOffSignature";

import axiosInstance from "../../BaseComponet/axiosInstance";

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

// Helper function to convert File to base64 string
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result.split(",")[1]; // remove metadata prefix
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};

const CompanyCreateKickoffSheet = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeKeys, setActiveKeys] = useState(["0", "1", "2", "3"]); // all open initially

  const [customerId, setCustomerId] = useState(null);

  const [customerData, setCustomerData] = useState(null);
  const [projectData, setProjectData] = useState(null);
  const [partsData, setPartsData] = useState([]);
  const [processesData, setProcessesData] = useState([]);

  const [customerRequirementsData, setCustomerRequirementsData] = useState([]);
  const loggedInEmployeeId = "YOUR_EMPLOYEE_ID";

  const [signatureData, setSignatureData] = useState([]);

  const handleAccordionClick = (eventKey) => {
    setActiveKeys(
      (prev) =>
        prev.includes(eventKey)
          ? prev.filter((key) => key !== eventKey) // close
          : [...prev, eventKey] // open
    );
  };

  const handleSave = async () => {
    try {
      // Compose data from both child states
      const payload = {
        // map customerData fields
        customerName: customerData?.companyName || "",
        contactPersonName: customerData?.contactPerson || "",
        mobileNumber: customerData?.phoneNumber || "",
        companyWebsite: customerData?.website || "",
        billingAddress: customerData?.billingAddress || "",
        shippingAddress: customerData?.shippingAddress || "",

        // map projectData fields
        projectName: projectData?.projectName || "",
        projectTitle: projectData?.projectTitle || "",
        kickOffDate: projectData?.kickOffDate || "",
        startDate: projectData?.startDate || "",
        endDate: projectData?.endDate || "",

        projectId: projectData?.projectId || "",
      };

      console.log("Payload to save:", payload);
      const response = await axiosInstance.post(
        "/kickoff/createKickOffInfo",
        payload
      );

      //2nd

      const kickOffId = response.data.kickOffId;
      if (!kickOffId) throw new Error("kickOffId not received");



      // Prepare parts payload with base64 images
      const partItems = await Promise.all(
        partsData.map(async (part) => {
          const itemNoInt =
            typeof part.itemNo === "string"
              ? parseInt(part.itemNo.replace(/^PT-/, ""), 10)
              : part.itemNo;

          return {
            kickOffId,
            itemNo: itemNoInt,
            partName: part.partName || "",
            material: part.material || "",
            thickness: part.thickness || "",
            imageList: await Promise.all(
              (part.images || []).map((img) =>
                typeof img === "string" ? img : fileToBase64(img)
              )
            ),
          };
        })
      );


      await axiosInstance.post("/kickoff/saveKickOffItems", partItems);

      //3RD

      const processesPayload = processesData.map((proc) => {
        const emp = employeeList.find((e) => e.employeeId === proc.designer);
        const itemNoInt = typeof proc.itemNo === "string"
          ? parseInt(proc.itemNo.replace(/^PT-/, ""), 10)
          : proc.itemNo;


        return {
          kickOffId,
          itemNo: itemNoInt, // should be like "PT-xxxx" string
          workOrderNumber: proc.woNo || proc.workOrderNumber || "", // Adjust key if needed
          designerName: emp ? emp.name : "",
          employeeId: proc.employeeId || proc.designer || "",

          operationNumber: proc.opNo || "",
          process: proc.processName || proc.process || "",
          length: parseFloat(proc.length) || 0,
          height: parseFloat(proc.height) || 0,
          width: parseFloat(proc.width) || 0,
          remarks: proc.remarks || "",
        };
      });
      console.log("processesData ==", processesPayload);

      if (processesPayload.length > 0) {
        await axiosInstance.post(
          "/kickoff/saveKickOffItemsProccess",
          processesPayload
        );
      }

      //4th
      const reqPayload = customerRequirementsData.map((item) => ({
        ...item,
        kickOffId,
        companyId: customerId || "", // ensure this matches what you sent to child
        employeeId: loggedInEmployeeId || "", // ensure you fill this with right employee id
      }));




      if (reqPayload.length > 0) {
        await axiosInstance.post(
          "/kickoff/saveCustomerRequirements",
          reqPayload
        );
      }



      // 5th API

      if (signatureData.length > 0) {
        const signaturePayload = signatureData.map((item) => ({
          ...item,
          kickOffId,
        }));
        await axiosInstance.post(
          "/kickoff/saveKickOffSignature",
          signaturePayload
        );
      }


      alert("Save successful!");
    } catch (error) {
      console.error("Save failed", error);
      alert("Failed to save data.");
    }
  };

  const [employeeList, setEmployeeList] = useState([]);

  useEffect(() => {
    axiosInstance
      .get("/company/getEmployeeList/0/10")
      .then((response) => {
        setEmployeeList(response.data.employeeList || []);
      })
      .catch((err) => {
        console.error("Failed to fetch employee list:", err);
      });
  }, []);
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
                setCustomerId={setCustomerId}
                onCustomerDataChange={setCustomerData}
              />
              <ProjectRegistrationKickoffSheet
                eventKey="1"
                activeKey={activeKeys}
                CustomToggle={CustomToggle}
                handleAccordionClick={handleAccordionClick}
                customerId={customerId}
                onProjectDataChange={setProjectData}
                onPartsChange={setPartsData}
                onProcessesChange={setProcessesData}
              />
              <CompanyKickOffCustomerRequirements
                eventKey="2"
                activeKey={activeKeys}
                CustomToggle={CustomToggle}
                handleAccordionClick={handleAccordionClick}
                onCustomerRequirementsChange={setCustomerRequirementsData}
                companyId={customerId || ""} // Pass correct company/customer ID here
                employeeId={loggedInEmployeeId || ""} // Pass employee ID here
              />
              <CompanyKickOffSignature
                eventKey="3"
                activeKey={activeKeys}
                CustomToggle={CustomToggle}
                handleAccordionClick={handleAccordionClick}
                onSignatureChange={setSignatureData}
              />
            </Accordion>

            <div className="d-flex justify-content-end gap-2 mt-4 p-3 bg-white rounded-bottom shadow-sm">
              <Button
                variant="outline-primary"
                onClick={() => alert("Preview Clicked")}
              >
                Preview
              </Button>
              <Button variant="primary" onClick={handleSave}>
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
