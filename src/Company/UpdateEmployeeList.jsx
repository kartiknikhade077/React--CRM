import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../BaseComponet/axiosInstance";
import { toast } from "react-toastify";

import CompanySidebar from "./CompanySidebar";
import CompanyTopbar from "./CompanyTopbar";

const UpdateEmployeeList = () => {
  const [emailError, setEmailError] = useState("");

  const { id } = useParams();
  const [emp, setEmp] = useState(null);

  const [access, setAccess] = useState({
    leadAccess: false,
    template: false,
    email: false,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [initialemp, setInitialEmp] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);

  // Fetch data
  useEffect(() => {
    axiosInstance.get(`/company/getEmployee/${id}`).then((res) => {
      setEmp(res.data.employeeInfo);
      setInitialEmp(res.data.employeeInfo);
      setAccess({
        leadAccess: res.data.moduleAccess.leadAccess,
        template: res.data.moduleAccess.template,
        email: res.data.moduleAccess.email,
      });

      // Set default department and fetch roles
      const deptId = res.data.employeeInfo.departmentId;
      if (deptId) {
        axiosInstance
          .get(`/company/getRolesByDepartmentId/${deptId}`)
          .then((roleRes) => {
            setRoles(roleRes.data);
          });
      }
    });

    // Fetch department list
    axiosInstance.get("/company/getDepartments").then((res) => {
      setDepartments(res.data);
    });
  }, [id]);

  const handleDepartmentChange = async (e) => {
    const departmentId = parseInt(e.target.value);
    const selectedDept = departments.find(
      (d) => d.departmentId === departmentId
    );

    setEmp((prev) => ({
      ...prev,
      departmentId,
      department: selectedDept?.departmentName || "",
      roleId: "", // reset role
    }));

    try {
      const res = await axiosInstance.get(
        `/company/getRolesByDepartmentId/${departmentId}`
      );
      setRoles(res.data);
    } catch (err) {
      toast.error("Failed to load roles");
    }
  };

  const handleRoleChange = async (e) => {
    const roleId = parseInt(e.target.value);
    const selectedRole = roles.find((r) => r.roleId === roleId);

    setEmp((prev) => ({
      ...prev,
      roleId,
      role: selectedRole?.roleName || "",
    }));

    try {
      const res = await axiosInstance.get(
        `/company/getRolesByRoleId/${roleId}`
      );
      const data = res.data;

      setAccess({
        leadAccess: data.leadAccess,
        template: data.templateAccess,
        email: data.emailAccess,
      });
    } catch (err) {
      toast.error("Failed to load role access");
    }
  };

  if (!emp) return <div className="p-4">🔄 Loading employee info...</div>;

  // Handlers
  const handleChange = async (e) => {
    const { name, value } = e.target;

    const newValue =
      name === "departmentId" || name === "roleId" ? parseInt(value) : value;

    setEmp((prev) => ({ ...prev, [name]: newValue }));

    if (name === "email") {
      const email = value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        setEmailError("❌ Invalid email format.");
        return;
      }

      try {
        const response = await axiosInstance.get(
          `/company/checkDuplicateEmail/${email}`
        );
        const isUnique = response.data;

        if (!isUnique && email !== emp.email) {
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

  const handleSaveEmployee = () => {
    if (!initialemp) return;

    // Check if any field is actually changed
    const isChanged =
      emp.name !== initialemp.name ||
      emp.email !== initialemp.email ||
      emp.description !== initialemp.description ||
      emp.departmentId !== initialemp.departmentId ||
      emp.roleId !== initialemp.roleId;
    if (!isChanged) {
      toast.info("ℹ️ No changes detected.");
      return;
    }

    if (emailError) {
      toast.error("❌ Please fix the email error before saving.");
      return;
    }

    const payload = {
      employeeId: emp.employeeId,
      name: emp.name,
      email: emp.email,
      description: emp.description,
      departmentId: emp.departmentId,
      roleId: emp.roleId,
    };

    axiosInstance
      .put("/company/updateEmployeeInfo", payload)
      .then(() => {
        toast.success("✅ Company updated successfully");
        setIsEditing(false);
        setInitialEmp({ ...emp }); // Update reference
      })
      .catch(() => {
        toast.error("❌ Failed to update company");
      });
  };

  const handleSaveAccess = () => {
    const payload = {
      employeeId: emp.employeeId,
      name: emp.name,
      email: emp.email,
      description: emp.description,
      departmentId: emp.departmentId,
      roleId: emp.roleId,
    };

    axiosInstance
      .put("/company/updateEmployeeModules", payload)
      .then(() => toast.success("✅ Access permissions updated!"))
      .catch(() => toast.error("❌ Failed to update access"));
  };

  return (
    <>
       <CompanyTopbar />
      <div className="slidebar-main-div">
        <CompanySidebar />

        <div className="slidebar-main-div-right-section">
          <div className="container mt-4">
            {/* Employee Info */}
            <div className="card p-4 shadow-sm">
              <h4 className="mb-3">👤 Update Employee Info</h4>

              <div className="mb-3">
                <label className="form-label">Employee Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={emp.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Employee Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={emp.email}
                  readOnly
                />
                {emailError && (
                  <small className="text-danger">{emailError}</small>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Department</label>
                <select
                  name="departmentId"
                  className="form-select"
                  value={emp.departmentId || ""}
                  onChange={handleDepartmentChange}
                  disabled={!isEditing}
                >
                  <option value="">-- Select Department --</option>
                  {departments.map((dept) => (
                    <option
                      key={dept.departmentId}
                      value={dept.departmentId}
                    >
                      {dept.departmentName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Role</label>
                <select
                  name="roleId"
                  className="form-select"
                  value={emp.roleId || ""}
                  onChange={handleRoleChange}
                  disabled={!isEditing || !emp.departmentId}
                >
                  <option value="">-- Select Role --</option>
                  {roles.map((role) => (
                    <option key={role.roleId} value={role.roleId}>
                      {role.roleName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  rows="3"
                  className="form-control"
                  value={emp.description}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="d-flex justify-content-end">
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
                    onClick={handleSaveEmployee}
                  >
                    💾 Save Info
                  </button>
                )}
              </div>
            </div>

            {/* Access Permissions */}
            <div className="card mt-4 p-4 shadow-sm">
              <h5 className="mb-3">🔐 Access Permissions</h5>

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

              <div className="form-check form-switch mb-3">
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

              <div className="d-flex justify-content-end">
                <button className="btn btn-dark" onClick={handleSaveAccess}>
                  💾 Save Access
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default UpdateEmployeeList;
