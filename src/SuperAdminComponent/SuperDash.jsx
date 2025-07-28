import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { toast } from "react-toastify";
import axiosInstance from "../BaseComponet/axiosInstance";
import "bootstrap-icons/font/bootstrap-icons.css";
import PaginationComponent from "../Pagination/PaginationComponent";

import NavbarTopSuperAdmin from "./NavbarTopSuperAdmin";
import SidebarSuperAdmin from "./SidebarSuperAdmin";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./SuperDash.css";
const SuperDash = () => {
  const navigate = useNavigate();

  const [emailError, setEmailError] = useState("");

  const [allCompanies, setAllCompanies] = useState([]); // store full list
  const [companies, setCompanies] = useState([]); // current page
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [pageCount, setPageCount] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  // for creating companies
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    password: "",
    expirayDate: "",
    desciption: "",
    leadAccess: false,
    tempalteAccess: false, // ✅ use backend spelling
    emailAccess: false,
  });

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "ROLE_SUPERADMIN") {
      navigate("/"); // block unauthorized access
    } else {
      fetchCompanies();
    }
  }, [navigate]);

  // const fetchCompanies = async () => {
  //   try {
  //     const token = localStorage.getItem("token");
  //     if (!token) {
  //       navigate("/login");
  //       return;
  //     }

  //     const response = await axiosInstance.get(
  //       `/super/getCompanyList/${currentPage}/${pageSize}`
  //     );

  //     console.log("📦 Full API Response:", response); // ✅ Log full response
  //     console.log("📄 Data from API:", response.data); // ✅ Log just data

  //     const allData = response.data.companyList ?? [];

  //     setAllCompanies(allData);

  //     const totalPages = Math.ceil(response.data.totalPages ?? 1);
  //     setPageCount(totalPages);
  //     setCompanies(allData);
  //   } catch (error) {
  //     console.error("Error fetching companies:", error);
  //     if (error.response?.status === 401) {
  //       navigate("/login");
  //     }
  //   }
  // };



  const fetchCompanies = async (page = 0, size = 10) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axiosInstance.get(
        `/super/getCompanyList/${page}/${size}`
      );

      const data = response.data.companyList ?? [];

      setCompanies(data);
      setCurrentPage(page);
      setPageSize(size);
      setPageCount(response.data.totalPages || 1); // or use Math.ceil(response.data.totalElements / size)
    } catch (error) {
      console.error("Error fetching companies:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      }
    }
  };

 useEffect(() => {
   const role = localStorage.getItem("role");
   if (role !== "ROLE_SUPERADMIN") {
     navigate("/");
   } else {
     fetchCompanies(currentPage, pageSize); // use state
   }
 }, [navigate, currentPage, pageSize]);




  const handleInputChange = async (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "email") {
      setFormData({ ...formData, email: value });

      if (value.trim() !== "") {
        try {
          const token = localStorage.getItem("token");

          const response = await axiosInstance.get(
            `/super/checkDuplicateEmail/${value}`
          );

          const isUnique = response.data;
          console.log("isUnique:", isUnique);

          if (!isUnique) {
            setEmailError("Email already exists.");
          } else {
            setEmailError("");
          }
        } catch (err) {
          console.error("Error checking email:", err);
          setEmailError("Error checking email.");
        }
      } else {
        setEmailError("");
      }

      return;
    }

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      console.log("Submitted formData:", formData);
      await axiosInstance.post("/super/createCompany", formData);

      // ✅ Trigger the modal close button programmatically
      document.querySelector("#createCompanyModal .btn-close")?.click();

      // Clear form

      setFormData({
        companyName: "",
        email: "",
        password: "",
        expirayDate: "",
        desciption: "",
        leadAccess: false,
        tempalteAccess: false, // ✅ match backend
        emailAccess: false,
      });

      // Refresh data
      fetchCompanies();

      toast.success("Company created successfully!"); // ✅ Toast here
    } catch (error) {
      console.error("Error creating company:", error.response || error);

      toast.error("Failed to create company. See console for details.");
    }
  };

  // For searching data
const searchCompanies = async (term, page = 0, size = 10) => {
  try {
    const response = await axiosInstance.get(
      `/super/getCompanyList/${page}/${size}?companyName=${term}`
    );

    const data = response.data.companyList ?? [];
    setCompanies(data);
    setPageCount(response.data.totalPages || 1);
    setCurrentPage(page);
  } catch (error) {
    console.error("Error searching companies:", error);
    toast.error("Failed to search companies");
  }
};


  const handleUpdate = (company) => {
    navigate(`/updateCompany/${company.companyId}`, {
      state: { company },
    });
  };

  return (
    <>
      <NavbarTopSuperAdmin />
      <div className="slidebar-main-div">
        <SidebarSuperAdmin />

        <div className="slidebar-main-div-right-section">
          <div className="Companalist-main-card">
            <div className="row m-0 p-0 w-100 d-flex justify-content-between mb-2">
              <div className="col-md-3">
                <h4>Company</h4>
              </div>
              <div className="col-md-3">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <i className="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => {
                      const term = e.target.value;
                      setSearchTerm(term);
                      searchCompanies(term);
                    }}
                  />
                </div>
              </div>
              <div className="col-md-3 d-flex justify-content-end">
                <button
                  className="btn btn-dark d-flex align-items-center gap-1"
                  data-bs-toggle="modal"
                  data-bs-target="#createCompanyModal"
                >
                  <i className="bi bi-plus-circle"></i> New Company
                </button>
              </div>
            </div>

            {/* Modal */}
            <div
              className="modal fade"
              id="createCompanyModal"
              tabIndex="-1"
              aria-labelledby="createCompanyModalLabel"
              aria-hidden="true"
            >
              <div className="modal-dialog">
                <form onSubmit={handleSubmit}>
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title" id="createCompanyModalLabel">
                        Create Company
                      </h5>
                      <button
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="modal"
                        aria-label="Close"
                      />
                    </div>
                    <div className="modal-body">
                      <div className="mb-3">
                        <label className="form-label">Company Name</label>
                        <input
                          type="text"
                          name="companyName"
                          className="form-control"
                          value={formData.companyName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          name="email"
                          className={`form-control ${
                            emailError ? "is-invalid" : ""
                          }`}
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                        {emailError && (
                          <div className="invalid-feedback">{emailError}</div>
                        )}
                      </div>

                      {/* <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input
                          type="password"
                          name="password"
                          className="form-control"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                        />
                      </div> */}

                      <div className="mb-3">
                        <label className="form-label">Password</label>
                        <div className="input-group">
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            className="form-control"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                          />
                          <span
                            className="input-group-text"
                            style={{ cursor: "pointer" }}
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                          </span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Expiray Date</label>
                        <input
                          type="date"
                          name="expirayDate"
                          className="form-control"
                          value={formData.expirayDate}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Description</label>
                        <textarea
                          name="desciption"
                          className="form-control"
                          value={formData.desciption}
                          onChange={handleInputChange}
                          rows={2}
                        />
                      </div>

                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="leadAccess"
                          checked={formData.leadAccess}
                          onChange={handleInputChange}
                        />
                        <label className="form-check-label">Lead Access</label>
                      </div>

                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="tempalteAccess" // ✅ must match exactly
                          checked={formData.tempalteAccess}
                          onChange={handleInputChange}
                        />
                        <label className="form-check-label">
                          Template Access
                        </label>
                      </div>

                      <div className="form-check mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="emailAccess"
                          checked={formData.emailAccess}
                          onChange={handleInputChange}
                        />
                        <label className="form-check-label">Email Access</label>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button type="submit" className="btn btn-success">
                        Save
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        data-bs-dismiss="modal"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Table */}
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Company Name</th>
                  <th>Email</th>
                  <th>Description</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {(companies || []).length > 0 ? (
                  companies.map((company, index) => (
                    <tr key={index}>
                      <td>{index + 1 + currentPage * pageSize}</td>
                      <td>{company.companyName}</td>
                      <td>{company.companyEmail}</td>
                      <td>{company.companyDescription}</td>
                      <td className="text-end">
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => handleUpdate(company)}
                        >
                          <i className="bi bi-pencil-square"></i> Edit
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      No companies found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination-main-crd">
            <PaginationComponent
              currentPage={currentPage}
              pageSize={pageSize}
              pageCount={pageCount}
              onPageChange={(newPage) => setCurrentPage(newPage)}
              onPageSizeChange={(newSize) => {
                const size = Number(newSize);
                if (!isNaN(size) && size > 0) {
                  setPageSize(size);
                  setCurrentPage(0); // Reset to first page on size change
                }
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default SuperDash;
