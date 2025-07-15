import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { toast } from 'react-toastify';


const SuperDash = () => {
    const navigate = useNavigate();

  const [emailError, setEmailError] = useState("");
  
  const [allCompanies, setAllCompanies] = useState([]); // store full list
  const [companies, setCompanies] = useState([]); // current page
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [pageCount, setPageCount] = useState(0);
  


  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    password: "",
    desciption: "",
    leadAccess: false,
    tempalteAccess: false,
    emailAccess: false,
  });

  


  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "ROLE_SUPERADMIN") {
      navigate("/"); // block unauthorized access
    }
    else{
        fetchCompanies();
    }
  }, [navigate]);


  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
  
      const response = await axios.get(`http://localhost:8081/super/getCompanyList/0/1000`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const allData = response.data ?? [];
      setAllCompanies(allData);
  
      // Set page count and current page data
      const totalPages = Math.ceil(allData.length / pageSize);
      setPageCount(totalPages);
      setCurrentPage(0);
      setCompanies(allData.slice(0, pageSize)); // First page
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
      fetchCompanies(0); // Load first page
    }
  }, [navigate]);
  


  const paginateData = (page, size) => {
    const startIndex = page * size;
    const endIndex = startIndex + size;
    const paginated = allCompanies.slice(startIndex, endIndex);
    setCompanies(paginated);
    setCurrentPage(page);
    setPageCount(Math.ceil(allCompanies.length / size));
  };
  
//   const fetchCompanies = async () => {
//     try {
//       const token = localStorage.getItem("token"); // Or sessionStorage
//       const response = await axios.get("http://localhost:8081/super/getCompanyList/0/10?companyName=o", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       setCompanies(response.data);
//     } catch (error) {
//       console.error("Error fetching companies:", error);
//     }
//   };
  
  

  

const handleInputChange = async (e) => {
    const { name, value, type, checked } = e.target;
  
    if (name === "email") {
        setFormData({ ...formData, email: value });
      
        if (value.trim() !== "") {
          try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
              `http://localhost:8081/super/checkDuplicateEmail/${value}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
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
  
      await axios.post("http://localhost:8081/super/createCompany", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
        // ✅ Trigger the modal close button programmatically
        document.querySelector("#createCompanyModal .btn-close")?.click();


  
      // Clear form
      setFormData({
        companyName: "",
        email: "",
        password: "",
        desciption: "",
        leadAccess: false,
        tempalteAccess: false,
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
  
  return (
    <div className="container mt-4">
    <h1>Welcome, Super Admin!</h1>

    <button
  className="btn btn-primary my-3"
  data-bs-toggle="modal"
  data-bs-target="#createCompanyModal"
>
  Create Company
</button>

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
          <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
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
                    className={`form-control ${emailError ? "is-invalid" : ""}`}
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                />
                {emailError && <div className="invalid-feedback">{emailError}</div>}
         </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={formData.password}
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
              name="tempalteAccess"
              checked={formData.tempalteAccess}
              onChange={handleInputChange}
            />
            <label className="form-check-label">Template Access</label>
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
          <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
            Cancel
          </button>
        </div>
      </div>
    </form>
  </div>
</div>

    {/* Table */}
    <table className="table table-bordered">
      <thead>
        <tr>
          <th>Company Name</th>
          <th>Email</th>
          <th>Description</th>
       
        </tr>
      </thead>
      <tbody>
  {(companies || []).length > 0 ? (
    companies.map((company, index) => (
      <tr key={index}>
        <td>{company.compnayName}</td>
        <td>{company.companyEmail}</td>
        <td>{company.companyDescription}</td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="6" className="text-center">No companies found.</td>
    </tr>
  )}
</tbody>



    </table>



    <div className="mb-3 d-flex align-items-center gap-2">
  <label htmlFor="pageSizeInput" className="form-label mb-0">Rows per page:</label>
  <input
    type="number"
    id="pageSizeInput"
    className="form-control"
    style={{ width: "100px" }}
    value={pageSize}
    onChange={(e) => {
        const newSize = parseInt(e.target.value);
        if (!isNaN(newSize) && newSize > 0) {
          setPageSize(newSize);
          paginateData(0, newSize); // Reset to page 0
        }
      }
      }
  />
</div>


<nav>
  <ul className="pagination justify-content-center">
    <li className={`page-item ${currentPage === 0 ? "disabled" : ""}`}>
      <button className="page-link" onClick={() => paginateData(currentPage - 1, pageSize)}>
        Previous
      </button>
    </li>

    {[...Array(pageCount).keys()].map((number) => (
      <li key={number} className={`page-item ${currentPage === number ? "active" : ""}`}>
        <button className="page-link" onClick={() => paginateData(number, pageSize)}>
          {number + 1}
        </button>
      </li>
    ))}

    <li className={`page-item ${currentPage === pageCount - 1 ? "disabled" : ""}`}>
      <button className="page-link" onClick={() => paginateData(currentPage + 1, pageSize)}>
        Next
      </button>
    </li>
  </ul>
</nav>


  </div>






  );
};

export default SuperDash;
