import React, { useState } from "react";
import axios from "axios";
import "./Register.css";

const Register = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8081/register", formData);
      setSuccess("Registration successful!");
      setError("");
    } catch (err) {
      setError(err.response?.data || "An error occurred during registration");
      setSuccess("");
    }
  };

  return (
    <div className="crm-register-wrapper">
      <div className="crm-register-left">
        <div className="crm-register-text">
          <h2>
            <span className="typing-text">Welcome to Our CRM</span>
          </h2>
          <p>Create your account to join the experience.</p>
        </div>
      </div>
      <div className="crm-register-right">
        <div className="crm-register-box">
          <h2 className="crm-register-title">Register</h2>
          {error && <p className="crm-register-error">{error}</p>}
          {success && <p className="crm-register-success">{success}</p>}
          <form onSubmit={handleSubmit} className="crm-register-form">
            <input
              type="text"
              name="username"
              placeholder="Email"
              value={formData.username}
              onChange={handleChange}
              required
              className="crm-register-input"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="crm-register-input"
            />
            <button type="submit" className="crm-register-button">
              Register
            </button>
          </form>

          <p className="crm-register-link">
            Already have an account? <a href="/login">Login here</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
