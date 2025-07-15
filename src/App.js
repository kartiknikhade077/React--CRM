import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/dashboard";
import AdminDashboard from "./AdminComponet/AdminDashboard";
import StudentList from "./AdminComponet/StudentList"
import ProtectedRoute from "./BaseComponet/ProtectedRoute"; // Add this new component
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import SuperDash from "./SuperAdminComponent/SuperDash";
import CompDash from "./Company/Company";
import EmpDash from "./Employee/EmpDash";
import EmployeeList from "./Company/EmployeeList"
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
const App = () => {
  return (

    <Router>
        <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/studenList" element={<StudentList />} />
        <Route path="/EmployeeList" element={<EmployeeList />} />
        
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
          path="/superDash"
          element={
            <ProtectedRoute>
              <SuperDash />
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

      </Routes>
    </Router>
  );
};

export default App;
