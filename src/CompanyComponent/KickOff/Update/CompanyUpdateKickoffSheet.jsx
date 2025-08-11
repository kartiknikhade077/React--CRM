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

const CustomToggle = ({ eventKey, activeKey, children, handleAccordionClick }) => {
  const isActive = Array.isArray(activeKey)
    ? activeKey.includes(eventKey)
    : activeKey === eventKey;
  return (
    <div
      onClick={() => handleAccordionClick(eventKey)}
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
  const { id } = useParams();
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeKeys, setActiveKeys] = useState(["0", "1", "2", "3"]);
  const [loading, setLoading] = useState(true);

  // Single formData combining customer + project
  const [formData, setFormData] = useState({
    customerid: "",
    customerName: "",
    contactPerson: "",
    phoneNumber: "",
    website: "",
    billingAddress: "",
    shippingAddress: "",
    savedcusomerid: "",
    projectId: "",
    projectName: "",
    projectTitle: "",
    kickOffDate: "",
    startDate: "",
    endDate: "",
  });

  const [partsData, setPartsData] = useState([]);
  const [processesData, setProcessesData] = useState([]);
  const [customerRequirementsData, setCustomerRequirementsData] = useState([]);
  const [signatureData, setSignatureData] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);

  const handleAccordionClick = (eventKey) => {
    setActiveKeys((prev) =>
      prev.includes(eventKey)
        ? prev.filter((key) => key !== eventKey)
        : [...prev, eventKey]
    );
  };

  useEffect(() => {
    const fetchKickoffData = async () => {
      try {
        setLoading(true);
        const { data } = await axiosInstance.get(
          `/kickoff/getKickOffInfo/${id}`
        );

        const kickoffInfo = data.kickOffInfo || {};

        console.log("savedcustomer id-->", data);
        setFormData({
          // customerId

          customerid: kickoffInfo.companyId || "",
          customerName: kickoffInfo.customerName || "",
          contactPerson: kickoffInfo.contactPersonName || "",
          phoneNumber: kickoffInfo.mobileNumber || "",
          website: kickoffInfo.companyWebsite || "",
          billingAddress: kickoffInfo.billingAddress || "",
          shippingAddress: kickoffInfo.shippingAddress || "",
          savedcusomerid: kickoffInfo.customerId || "",
          projectId: kickoffInfo.projectId || "",
          projectName: kickoffInfo.projectName || "",
          projectTitle: kickoffInfo.projectTitle || "",
          kickOffDate: kickoffInfo.kickOffDate || "",
          startDate: kickoffInfo.startDate || "",
          endDate: kickoffInfo.endDate || "",

        });


        setPartsData(data.kickOffItemsList || []);
        setProcessesData(data.itemProcessList || []);
        setCustomerRequirementsData(data.requirementList || []);
        setSignatureData(data.listofSingnature || []);

        try {
          const empRes = await axiosInstance.get(
            "/company/getEmployeeList/0/10"
          );
          setEmployeeList(empRes.data.employeeList || []);
        } catch (err) {
          console.error("Failed to fetch employee list:", err);
        }
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

  // const handleSave = async () => {
  //   try {
  //     const payload = {
  //       kickOffId: id,
  //       customerName: formData.customerName,
  //       contactPersonName: formData.contactPerson,
  //       mobileNumber: formData.phoneNumber,
  //       companyWebsite: formData.website,
  //       billingAddress: formData.billingAddress,
  //       shippingAddress: formData.shippingAddress,
  //       projectId: formData.projectId,
  //       projectName: formData.projectName,
  //       projectTitle: formData.projectTitle,
  //       kickOffDate: formData.kickOffDate,
  //       startDate: formData.startDate,
  //       endDate: formData.endDate,
  //     };

  //     await axiosInstance.put("/kickoff/updateKickOffInfo", payload);

  //     const partItems = await Promise.all(
  //       partsData.map(async (part, index) => ({
  //         partId: part.partId || null,
  //         kickOffId: id,
  //         itemNo: typeof part.itemNo === "string" ? part.itemNo : index + 1,
  //         partName: part.partName || "",
  //         material: part.material || "",
  //         thickness: part.thickness || "",
  //         imageList: await Promise.all(
  //           (part.images || []).map((img) =>
  //             typeof img === "string" ? img : fileToBase64(img)
  //           )
  //         ),
  //       }))
  //     );
  //     await axiosInstance.put("/kickoff/updateKickOffItems", partItems);

  //     const processesPayload = processesData.map((proc) => {
  //       const emp = employeeList.find((e) => e.employeeId === proc.designer);
  //       const itemNoInt =
  //         typeof proc.itemNo === "string"
  //           ? parseInt(proc.itemNo.replace(/^PT-/, ""), 10)
  //           : proc.itemNo;
  //       return {
  //         partProcessId: proc.partProcessId || null,
  //         kickOffId: id,
  //         itemNo: itemNoInt,
  //         workOrderNumber: proc.woNo || proc.workOrderNumber || "",
  //         designerName: emp ? emp.name : "",
  //         employeeId: proc.employeeId || proc.designer || "",
  //         operationNumber: proc.opNo || "",
  //         process: proc.processName || proc.process || "",
  //         length: parseFloat(proc.length) || 0,
  //         height: parseFloat(proc.height) || 0,
  //         width: parseFloat(proc.width) || 0,
  //         remarks: proc.remarks || "",
  //       };
  //     });
  //     await axiosInstance.put(
  //       "/kickoff/updateKickOffItemsProcess",
  //       processesPayload
  //     );

  //     const reqPayload = customerRequirementsData.map((item) => ({
  //       ...item,
  //       kickOffId: id,
  //       companyId: formData.customerid || "",
  //     }));
  //     await axiosInstance.put("/kickoff/updateCustomerRequirements", reqPayload);

  //     if (signatureData.length > 0) {
  //       const signaturePayload = signatureData.map((sig) => ({
  //         ...sig,
  //         kickOffId: id,
  //       }));
  //       await axiosInstance.put(
  //         "/kickoff/updateKickOffSignature",
  //         signaturePayload
  //       );
  //     }

  //     alert("Update successful!");
  //     navigate("/KickOffList");
  //   } catch (error) {
  //     console.error("Update failed", error);
  //     alert("Failed to update kickoff data.");
  //   }
  // };

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
                  formData={formData}
                  setFormData={setFormData}
                  id={id} // <-- added
                />

              </Accordion.Item>

              {/* <CompanyUpdateProjectRegistrationKickoffSheet
                eventKey="1"
                activeKey={activeKeys}
                CustomToggle={CustomToggle}
                handleAccordionClick={handleAccordionClick}
                formData={formData}
                setFormData={setFormData}
                initialPartsData={partsData}
                initialProcessesData={processesData}
                onPartsChange={setPartsData}
                onProcessesChange={setProcessesData}
              /> */}

              <CompanyUpdateProjectRegistrationKickoffSheet
                eventKey="1"
                activeKey={activeKeys}
                CustomToggle={CustomToggle}
                handleAccordionClick={handleAccordionClick}
                initialPartsData={partsData}
                initialProcessesData={processesData}
                onPartsChange={setPartsData}
                onProcessesChange={setProcessesData}
                id={id} // ✅ KickOffId
              />

              <CompanyUpdateKickOffCustomerRequirements
                eventKey="2"
                activeKey={activeKeys}
                CustomToggle={CustomToggle}
                handleAccordionClick={handleAccordionClick}
                onCustomerRequirementsChange={setCustomerRequirementsData}
                companyId={formData.customerid || ""}
                employeeId={"YOUR_EMPLOYEE_ID"} // pass real one if available
                initialRequirements={customerRequirementsData}
                id={id} // ✅ important for saving
              />

              <CompanyUpdateKickOffSignature
                eventKey="3"
                activeKey={activeKeys}
                CustomToggle={CustomToggle}
                handleAccordionClick={handleAccordionClick}
                onSignatureChange={setSignatureData}
                initialSignatureData={signatureData}
                id={id} // ✅ KickOffId
              />

            </Accordion>

            <div className="d-flex justify-content-end gap-2 mt-4 p-3 bg-white rounded-bottom shadow-sm">
              <Button
                variant="outline-primary"
                onClick={() => alert("Preview Clicked")}
              >
                Preview
              </Button>
              {/* <Button variant="primary" onClick={handleSave}>
                <i className="bi bi-save me-1"></i> Update
              </Button> */}
            </div>
          </Form>
        </div>
      </div>
    </>
  );
};

export default CompanyUpdateKickoffSheet;

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
