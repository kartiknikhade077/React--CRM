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
import CompDash from "./Company/Company";
import EmpDash from "./Employee/EmpDash";
import UpdateCompany from "./SuperAdminComponent/UpdateCompany";
import EmployeeList from "./Company/EmployeeList";
import UpdateEmployeeList from "./Company/UpdateEmployeeList";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import RoleLayout from "./navbar/RoleLayout";

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
      </Routes>
    </Router>
  );
};

export default App;
