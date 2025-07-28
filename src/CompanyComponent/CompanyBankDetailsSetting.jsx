import React, { useState, useEffect } from "react";
import CompanySidebar from "./CompanySidebar";
import CompanyTopbar from "./CompanyTopbar";
import Button from "react-bootstrap/Button";
import axiosInstance from "../BaseComponet/axiosInstance";
import { toast } from "react-toastify";

const CompanyBankDetailsSetting = () => {

  const [isCollapsed, setIsCollapsed] = useState(false);

   const handleToggle = () => {
     setIsCollapsed(!isCollapsed);
   };

  const [hasData, setHasData] = useState(false);
  const [formData, setFormData] = useState({
    companyBankId: null, // will be set if backend returns an ID
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    swiftCode: "",
    upi: "",
    panNumber: "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch existing bank details
  const fetchBankDetails = async () => {
    try {
      const res = await axiosInstance.get("/company/getCompanyBankDetials");
      const data = res?.data;
      if (data && data.companyBankId) {
        setFormData({
          companyBankId: data.companyBankId,
          bankName: data.bankName || "",
          accountNumber: data.accountNumber || "",
          ifscCode: data.ifscCode || "",
          swiftCode: data.swiftCode || "",
          upi: data.upi || "",
          panNumber: data.panNumber || "",
          email: data.email || "",
        });
        setHasData(true);
      } else {
        setHasData(false);
      }
    } catch (error) {
      console.error("Error fetching bank details:", error);
      setHasData(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBankDetails();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare payload: include companyBankId only if updating
    const payload = {
      bankName: formData.bankName,
      accountNumber: formData.accountNumber,
      ifscCode: formData.ifscCode,
      swiftCode: formData.swiftCode,
      upi: formData.upi,
      panNumber: formData.panNumber,
      email: formData.email,
    };
    if (hasData && formData.companyBankId) {
      payload.companyBankId = formData.companyBankId;
    }

    try {
      const res = await axiosInstance.post(
        "/company/updateCompanyBankDetials",
        payload
      );
      // backend returns the saved entity including its ID
      const saved = res?.data;
      if (saved && saved.companyBankId) {
        setFormData((prev) => ({
          ...prev,
          companyBankId: saved.companyBankId,
        }));
        setHasData(true);
        toast.success(
          hasData ? "Bank details updated." : "Bank details created."
        );
      } else {
        toast.error("Unexpected server response.");
      }
    } catch (err) {
      console.error("Error saving bank details:", err);
      toast.error("Failed to save bank details.");
    }
  };

  return (
    <>
      <CompanyTopbar onToggle={handleToggle} />
      <div className="slidebar-main-div d-flex">
        <CompanySidebar isCollapsed={isCollapsed} />
        <div className="slidebar-main-div-right-section p-4 w-100">
          <div className="Companalist-main-card mb-4">
            <h2>Bank Details</h2>
            {isLoading ? (
              <p>Loading...</p>
            ) : (
              <form className="bg-white p-4" onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Bank Name</label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Enter Bank Name"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Account Number</label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Enter Account Number"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">IFSC Code</label>
                  <input
                    type="text"
                    name="ifscCode"
                    value={formData.ifscCode}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Enter IFSC Code"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Swift Code</label>
                  <input
                    type="text"
                    name="swiftCode"
                    value={formData.swiftCode}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Enter Swift Code"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">UPI</label>
                  <input
                    type="text"
                    name="upi"
                    value={formData.upi}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Enter UPI ID"
                  />
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label">PAN Number</label>
                    <input
                      type="text"
                      name="panNumber"
                      value={formData.panNumber}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Enter PAN Number"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Enter Email"
                      required
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-end">
                  <Button variant="primary" type="submit">
                    {hasData ? "Update Setting" : "Save Setting"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CompanyBankDetailsSetting;
