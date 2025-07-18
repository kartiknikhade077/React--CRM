import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../BaseComponet/axiosInstance";
import { toast } from "react-toastify";
import NavbarSuperAdmin from "./NavbarSuperAdmin";
import NavbarTopSuperAdmin from "./NavbarTopSuperAdmin";
import SidebarSuperAdmin from "./SidebarSuperAdmin";
const UpdateCompany = () => {
  const [emailError, setEmailError] = useState("");

  const { id } = useParams();
  const [company, setCompany] = useState(null);

  const [access, setAccess] = useState({
    leadAccess: false,
    template: false,
    email: false,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [initialCompany, setInitialCompany] = useState(null);

  // Fetch data
  useEffect(() => {
    axiosInstance.get(`/super/getCompanyInfo/${id}`).then((res) => {
      setCompany(res.data.company);
      setInitialCompany(res.data.company); // Save original values
      setAccess({
        leadAccess: res.data.moduleAccess.leadAccess,
        template: res.data.moduleAccess.template,
        email: res.data.moduleAccess.email,
      });
    });
  }, [id]);

  if (!company) return <div className="p-4">🔄 Loading company info...</div>;

  // Handlers
  const handleChange = async (e) => {
    const { name, value } = e.target;

    // Update company state
    setCompany((prev) => ({ ...prev, [name]: value }));

    // Email-specific logic
    if (name === "companyEmail") {
      const email = value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        setEmailError("❌ Invalid email format.");
        return;
      }

      try {
        const response = await axiosInstance.get(
          `/super/checkDuplicateEmail/${email}`
        );
        const isUnique = response.data;

        if (!isUnique && email !== company.companyEmail) {
          setEmailError("❌ Email already exists.");
        } else {
          setEmailError("");
        }
      } catch (error) {
        console.error("Error checking email:", error);
        setEmailError("⚠️ Error validating email.");
      }
    }
  };

  const handleAccessChange = (e) => {
    const { name, checked } = e.target;
    setAccess((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSaveCompany = () => {
    if (!initialCompany) return;

    // Check if any field is actually changed
    const isChanged =
      company.companyName !== initialCompany.companyName ||
      company.companyEmail !== initialCompany.companyEmail ||
      company.companyDescription !== initialCompany.companyDescription;

    if (!isChanged) {
      toast.info("ℹ️ No changes detected.");
      return;
    }

    if (emailError) {
      toast.error("❌ Please fix the email error before saving.");
      return;
    }

    const payload = {
      companyId: company.companyId,
      companyName: company.companyName,
      companyEmail: company.companyEmail,
      companyDescription: company.companyDescription,
    };

    axiosInstance
      .put("/super/updateCompnayInfo", payload)
      .then(() => {
        toast.success("✅ Company updated successfully");
        setIsEditing(false);
        setInitialCompany({ ...company }); // Update reference
      })
      .catch(() => {
        toast.error("❌ Failed to update company");
      });
  };

  const handleSaveAccess = () => {
    const payload = {
      companyId: company.companyId,
      leadAccess: access.leadAccess,
      template: access.template,
      email: access.email,
    };
    axiosInstance
      .put("/super/updateCompanyModules", payload)
      .then(() => toast.success("✅ Access permissions updated!"))
      .catch(() => toast.error("❌ Failed to update access"));
  };

  return (
    <>
      <NavbarTopSuperAdmin />
      <div className="slidebar-main-div">
        <SidebarSuperAdmin />

        <div className="slidebar-main-div-right-section">
          <div className="container mt-4 flex-grow-1">
            <div className="card p-4 shadow-sm">
              <h4 className="mb-3">🧾 Update Company Info</h4>

              <div className="mb-3">
                <label className="form-label">Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  className="form-control"
                  value={company.companyName}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Company Email</label>
                <input
                  type="email"
                  name="companyEmail"
                  className="form-control"
                  value={company.companyEmail}
                  readOnly
                />
                {emailError && (
                  <small className="text-danger">{emailError}</small>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  name="companyDescription"
                  className="form-control"
                  rows="3"
                  value={company.companyDescription}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="d-flex justify-content-between">
                {!isEditing ? (
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => setIsEditing(true)}
                  >
                    ✏️ Edit
                  </button>
                ) : (
                  <button
                    className="btn btn-success"
                    onClick={handleSaveCompany}
                  >
                    💾 Save Company
                  </button>
                )}
              </div>
            </div>

            <div className="card mt-4 p-4 shadow-sm">
              <h5 className="mb-3">🔐 Module Access Control</h5>

              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="leadAccess"
                  id="leadAccess"
                  checked={access.leadAccess}
                  onChange={handleAccessChange}
                />
                <label className="form-check-label" htmlFor="leadAccess">
                  Lead Access
                </label>
              </div>

              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="template"
                  id="template"
                  checked={access.template}
                  onChange={handleAccessChange}
                />
                <label className="form-check-label" htmlFor="template">
                  Template Access
                </label>
              </div>

              <div className="form-check form-switch mb-4">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="email"
                  id="email"
                  checked={access.email}
                  onChange={handleAccessChange}
                />
                <label className="form-check-label" htmlFor="email">
                  Email Access
                </label>
              </div>

              <button className="btn btn-dark" onClick={handleSaveAccess}>
                💾 Save Access
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpdateCompany;
