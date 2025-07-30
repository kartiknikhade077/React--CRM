// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/dashboard";
import AdminDashboard from "./AdminComponet/AdminDashboard";
import StudentList from "./AdminComponet/StudentList";
import ProtectedRoute from "./BaseComponet/ProtectedRoute";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";  
import SuperDash from "./SuperAdminComponent/SuperDash";
import CompDash from "./CompanyComponent/Company";
import EmpDash from "./EmployeeComponent/EmpDash";
import UpdateCompany from "./SuperAdminComponent/UpdateCompany";
import EmployeeList from "./CompanyComponent/EmployeeList";
import UpdateEmployeeList from "./CompanyComponent/UpdateEmployeeList";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Department from "./CompanyComponent/Department";

import LeadCompany from "./CompanyComponent/LeadCompany";
import UpdateLead from "./CompanyComponent/UpdateLead";

import CompanyProject from "./CompanyComponent/CompanyProject";
import StaffMembers from "./CompanyComponent/StaffMembers";
// import RoleLayout from "./navbar/RoleLayout";
import CompRole from "./CompanyComponent/Role";
import CompanyBankDetailsSetting from "./CompanyComponent/CompanyBankDetailsSetting";
import CompanySetting from "./CompanyComponent/CompanySetting"; 
import LeadsList from "./CompanyComponent/Lead/LeadsList"
import NotFound from "./NotFound";
import CustomerList from "./CompanyComponent/Customer/CustomerList";

const App = () => {
  const role = localStorage.getItem("role"); // ✅ Get user role from localStorage

  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Role-based Layout Route */}
        <Route
          path="/superDash"
          element={
            <ProtectedRoute>
              <SuperDash />
            </ProtectedRoute>
          }
        />
        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/adminDashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/updateCompany/:id"
          element={
            <ProtectedRoute>
              <UpdateCompany />
            </ProtectedRoute>
          }
        />
        <Route
          path="/compDash"
          element={
            <ProtectedRoute>
              <CompDash />
            </ProtectedRoute>
          }
        />
        <Route
          path="/empDash"
          element={
            <ProtectedRoute>
              <EmpDash />
            </ProtectedRoute>
          }
        />
        <Route
          path="/studenList"
          element={
            <ProtectedRoute>
              <StudentList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/EmployeeList"
          element={
            <ProtectedRoute>
              <EmployeeList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/UpdateEmployeeList/:id"
          element={
            <ProtectedRoute>
              <UpdateEmployeeList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Projectlist"
          element={
            <ProtectedRoute>
              <CompanyProject />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Staffmember"
          element={
            <ProtectedRoute>
              <StaffMembers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/department"
          element={
            <ProtectedRoute>
              <Department />
            </ProtectedRoute>
          }
        />
        <Route
          path="/CompRole"
          element={
            <ProtectedRoute>
              <CompRole />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Leadlist"
          element={
            <ProtectedRoute>
              <LeadsList />
            </ProtectedRoute>
          }
        />

            <Route
          path="/Customer"
          element={
            <ProtectedRoute>
              <CustomerList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/Leadcompany"
          element={
            <ProtectedRoute>
              <LeadCompany />
            </ProtectedRoute>
          }
        />
        <Route
          path="/UpdateLead/:leadId"
          element={
            <ProtectedRoute>
              <UpdateLead />
            </ProtectedRoute>
          }
        />

        <Route
          path="/CompanyBankDetailsSetting"
          element={
            <ProtectedRoute>
              <CompanyBankDetailsSetting />
            </ProtectedRoute>
          }
        />
        <Route
          path="/CompanySetting"
          element={
            <ProtectedRoute>
              <CompanySetting />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
