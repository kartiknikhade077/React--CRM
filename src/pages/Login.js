import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

import axiosInstance from "../BaseComponet/axiosInstance";
const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {

      const response = await axiosInstance.post(
        "/auth/login",
        formData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      setSuccess("Login successful!");

      const { jwtToken, role } = response.data;

      localStorage.setItem("token", jwtToken);
      localStorage.setItem("role", role);

      if (role === "ROLE_SUPERADMIN") {
        navigate("/superDash");
      } else if (role === "ROLE_COMPANY") {
        navigate("/compDash");
      } else if (role === "ROLE_EMP") {
        navigate("/empDash");
      } else {
        navigate("/adminDashboard");
      }
    } catch (err) {
      setError(err.response?.data || "An error occurred during login");
    }
  };

  return (
    <div className="crm-login-page">
      <div className="crm-login-left">
        <h2>Seamless Login for Exclusive Access</h2>
        <p>
          Immerse yourself in a hassle-free login journey with our intuitively
          designed login form. Effortlessly access your account.
        </p>
        {/* <img
          src={animateLeft}
          alt="Animation"
          className="crm-login-left-illustration"
        /> */}
        {/* <p className="crm-login-register-link">
          Don't have an account? <a href="/register">Register here</a>
        </p> */}
      </div>

      <div className="crm-login-right">
        <form className="crm-login-form" onSubmit={handleSubmit}>
          <h3 className="crm-login-form-title">Sign in</h3>

          {error && <div className="crm-login-error-msg">{error}</div>}
          {success && <div className="crm-login-success-msg">{success}</div>}

          <input
            type="text"
            name="username"
            placeholder="Email address"
            value={formData.username}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <div className="crm-login-forgot-password">
            <a href="/forgot-password">Forgot your password?</a>
          </div>

          <button type="submit" className="crm-login-button">
            Sign in
          </button>

          <p className="crm-register-link text-center">
            Don't have an account? <a href="/Register">Register Here</a>
          </p>
          <p className="crm-login-or-text">or continue with</p>

          <div className="crm-login-social-icons">
            <i className="fab fa-google"></i>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
