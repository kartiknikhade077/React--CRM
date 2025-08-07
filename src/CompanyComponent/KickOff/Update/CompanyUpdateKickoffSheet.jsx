import React, { useState, useEffect } from "react";
import { Accordion, Button, Form } from "react-bootstrap";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";

import CompanySidebar from "../../CompanySidebar";
import CompanyTopbar from "../../CompanyTopbar";


import CompanyUpdateKickOffCustomerRequirements from "../Update/CompanyUpdateKickOffCustomerRequirements";

import CompanyUpdateKickOffSignature from "../Update/CompanyUpdateKickOffSignature";
import CompanyUpdateProjectRegistrationKickoffSheet from "../Update/CompanyUpdateProjectRegistrationKickoffSheet";

import axiosInstance from "../../../BaseComponet/axiosInstance";
import CompanyUpdateKickoffSheetCustomerData from "../Update/CompanyUpdateKickoffSheetCustomerData";


const CustomToggle = ({ children, eventKey, activeKey, onClick }) => {
  const isActive = activeKey.includes(eventKey);
  return (
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
        borderRadius: isActive ? "8px 8px 0 0" : "8px",
      }}
    >
      <span>{children}</span>
      {isActive ? <FaChevronUp /> : <FaChevronDown />}
    </div>
  );
};


const CompanyUpdateKickoffSheet = () => {
  const { id } = useParams(); // kickoff id from route
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeKeys, setActiveKeys] = useState(["0", "1", "2", "3"]);
  const [loading, setLoading] = useState(true);

  // State holders for all child data (same structure as create)
  const [customerId, setCustomerId] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [projectData, setProjectData] = useState(null);
  const [partsData, setPartsData] = useState([]);
  const [processesData, setProcessesData] = useState([]);
  const [customerRequirementsData, setCustomerRequirementsData] = useState([]);
  const [signatureData, setSignatureData] = useState([]);

  const [employeeList, setEmployeeList] = useState([]);

  // Accordion open/close toggle
  const handleAccordionClick = (eventKey) => {
    setActiveKeys((prev) =>
      prev.includes(eventKey)
        ? prev.filter((key) => key !== eventKey)
        : [...prev, eventKey]
    );
  };

  // Fetch kickoff data & employees on mount
useEffect(() => {
  const fetchKickoffData = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get(`/kickoff/getKickOffInfo/${id}`);

      // Set customer data from kickOffInfo
      const kickoffInfo = data.kickOffInfo || {};

      setCustomerData({
        customerid: kickoffInfo.companyId || "",
        companyName: kickoffInfo.customerName || "",
        contactPerson: kickoffInfo.contactPersonName || "",
        phoneNumber: kickoffInfo.mobileNumber || "",
        website: kickoffInfo.companyWebsite || "",
        billingAddress: kickoffInfo.billingAddress || "",
        shippingAddress: kickoffInfo.shippingAddress || "",
      });
      setCustomerId(kickoffInfo.companyId || "");

      // Set project data from kickOffInfo
      setProjectData({
        projectId: kickoffInfo.projectId || "",
        projectName: kickoffInfo.projectName || "",
        projectTitle: kickoffInfo.projectTitle || "",
        kickOffDate: kickoffInfo.kickOffDate || "",
        startDate: kickoffInfo.startDate || "",
        endDate: kickoffInfo.endDate || "",
      });

      // Parts data from kickOffItemsList
      setPartsData(data.kickOffItemsList || []);

      // Process data from itemProcessList
      setProcessesData(data.itemProcessList || []);

      // Customer requirements
      setCustomerRequirementsData(data.requirementList || []);

      // Signatures
      setSignatureData(data.listofSingnature || []);
    } catch (error) {
      console.error("Failed to fetch kickoff data:", error);
      alert("Failed to load kickoff details, redirecting to list.");
      navigate("/KickOffList");
    } finally {
      setLoading(false);
    }
  };

  fetchKickoffData();
}, [id, navigate]);

  const handleSave = async () => {
    try {
      // Build update payload similarly to create, but include IDs to update existing records
      const payload = {
        kickOffId: id,
        customerName: customerData?.companyName || "",
        contactPersonName: customerData?.contactPerson || "",
        mobileNumber: customerData?.phoneNumber || "",
        companyWebsite: customerData?.website || "",
        billingAddress: customerData?.billingAddress || "",
        shippingAddress: customerData?.shippingAddress || "",

        projectId: projectData?.projectId || "",
        projectName: projectData?.projectName || "",
        projectTitle: projectData?.projectTitle || "",
        kickOffDate: projectData?.kickOffDate || "",
        startDate: projectData?.startDate || "",
        endDate: projectData?.endDate || "",
      };

      console.log("Payload to update kickoff info:", payload);
      await axiosInstance.put("/kickoff/updateKickOffInfo", payload); // Use update API

      // Update partsData - include part IDs for updating existing parts
      const partItems = await Promise.all(
        partsData.map(async (part, index) => ({
          partId: part.partId || null,
          kickOffId: id,
          itemNo: index + 1,
          partName: part.partName || "",
          material: part.material || "",
          thickness: part.thickness || "",
          imageList: await Promise.all(
            (part.images || []).map((img) =>
              typeof img === "string" ? img : fileToBase64(img)
            )
          ),
        }))
      );

      await axiosInstance.put("/kickoff/updateKickOffItems", partItems);

      // Update processesData similarly with IDs
      const processesPayload = processesData.map((proc) => {
        const emp = employeeList.find((e) => e.employeeId === proc.designer);
        const itemNoInt =
          typeof proc.itemNo === "string"
            ? parseInt(proc.itemNo.replace(/^PT-/, ""), 10)
            : proc.itemNo;
        return {
          partProcessId: proc.partProcessId || null,
          kickOffId: id,
          itemNo: itemNoInt,
          workOrderNumber: proc.woNo || proc.workOrderNumber || "",
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

      await axiosInstance.put(
        "/kickoff/updateKickOffItemsProcess",
        processesPayload
      );

      // Update customer requirements
      const reqPayload = customerRequirementsData.map((item) => ({
        ...item,
        kickOffId: id,
        companyId: customerId || "",
      }));
      await axiosInstance.put(
        "/kickoff/updateCustomerRequirements",
        reqPayload
      );

      // Update signatures
      if (signatureData.length > 0) {
        const signaturePayload = signatureData.map((sig) => ({
          ...sig,
          kickOffId: id,
        }));
        await axiosInstance.put(
          "/kickoff/updateKickOffSignature",
          signaturePayload
        );
      }

      alert("Update successful!");
      navigate("/KickOffList"); // optionally redirect after update
    } catch (error) {
      console.error("Update failed", error);
      alert("Failed to update kickoff data.");
    }
  };

  if (loading) return <div>Loading kickoff details...</div>;

  return (
    <>
      <CompanyTopbar onToggle={() => setIsCollapsed(!isCollapsed)} />
      <div className="slidebar-main-div">
        <CompanySidebar isCollapsed={isCollapsed} />
        <div className="slidebar-main-div-right-section p-3">
          <Form>
            <Accordion activeKey={activeKeys} alwaysOpen>
              <Accordion.Item eventKey="0">
                <CompanyUpdateKickoffSheetCustomerData
                  eventKey="0"
                  activeKey={activeKeys}
                  CustomToggle={CustomToggle}
                  handleAccordionClick={handleAccordionClick}
                  setCustomerId={setCustomerId}
              
                  initialData={customerData}
                />
              </Accordion.Item>
               <CompanyUpdateProjectRegistrationKickoffSheet
                eventKey="1"
                activeKey={activeKeys}
                CustomToggle={CustomToggle}
                handleAccordionClick={handleAccordionClick}
                customerId={customerId}
                initialProjectData={projectData}
                initialPartsData={partsData}
                onProjectDataChange={setProjectData}
                onPartsChange={setPartsData}
                onProcessesChange={setProcessesData}
              /> *
              <CompanyUpdateKickOffCustomerRequirements
                eventKey="2"
                activeKey={activeKeys}
                CustomToggle={CustomToggle}
                handleAccordionClick={handleAccordionClick}
                onCustomerRequirementsChange={setCustomerRequirementsData}
                companyId={customerId || ""}
                employeeId={"YOUR_EMPLOYEE_ID"}
                initialRequirements={customerRequirementsData}
              />
                 <CompanyUpdateKickOffSignature
                eventKey="3"
                activeKey={activeKeys}
                CustomToggle={CustomToggle}
                handleAccordionClick={handleAccordionClick}
                onSignatureChange={setSignatureData}
                initialSignatureData={signatureData}
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
                <i className="bi bi-save me-1"></i> Update
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </>
  );
};

export default CompanyUpdateKickoffSheet;

// Helper function copied from create (remember to define or import in this file)
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result.split(",")[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};
