// src/pages/NotFound.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./css/NotFound.css"; 

const NotFound = () => {

      const navigate = useNavigate();

      const handleGoBack = () => {
        navigate(-1); // Go back to the previous page
      };

  return (
    <div className="notfound-container">
      <div className="notfound-content">
        <h4>ERROR: PAGE NOT FOUND</h4>
        <h1>404</h1>
        <p>We can't find the page you're looking for.</p>
        <button className="go-home-btn" onClick={handleGoBack}>
          Go Back →
        </button>
      </div>
    </div>
  );
};

export default NotFound;
