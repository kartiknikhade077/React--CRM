import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUsers,
  FaBuilding,
  FaUserTag,
  FaCog,
  FaSignOutAlt,
  FaUserTie,
  FaRandom,
} from "react-icons/fa";
import "./CompanySidebar.css";

const CompanySidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const toggleSettings = () => {
    setSettingsOpen(!settingsOpen);
  };

  return (
    <div className="company-sidebar">
      <div className="company-sidebar__brand">CRM-Tech</div>

      <ul className="company-sidebar__nav-links">
        <li className={location.pathname === "/compDash" ? "active" : ""}>
          <Link to="/compDash">
            <FaTachometerAlt /> Dashboard
          </Link>
        </li>
        <li className={location.pathname === "/lead" ? "active" : ""}>
          <Link to="/leadDash">
            <FaUserTie /> Lead
          </Link>
        </li>

        <li className={location.pathname === "/DynamicLead" ? "active" : ""}>
          <Link to="/DynamicLead">
            <FaUserTie /> Dynamic Lead
          </Link>
        </li>
        <li className={location.pathname === "/EmployeeList" ? "active" : ""}>
          <Link to="/EmployeeList">
            <FaUsers /> Employee
          </Link>
        </li>
        <li className={location.pathname === "/department" ? "active" : ""}>
          <Link to="/department">
            <FaBuilding /> Department
          </Link>
        </li>
        <li className={location.pathname === "/CompRole" ? "active" : ""}>
          <Link to="/CompRole">
            <FaUserTag /> Role
          </Link>
        </li>
        <li className={location.pathname === "/Projectlist" ? "active" : ""}>
          <Link to="/Projectlist">
            <FaRandom /> Project
          </Link>
        </li>
        <li className={location.pathname === "/Staffmember" ? "active" : ""}>
          <Link to="/Staffmember">
            <FaUsers /> Staff
          </Link>
        </li>
        <li
          className={`company-sidebar__settings-dropdown ${
            settingsOpen ? "open" : ""
          }`}
        >
          <button
            type="button"
            onClick={toggleSettings}
            className="company-sidebar__settings-toggle "
          >
            <FaCog /> Settings
          </button>

          {settingsOpen && (
            <ul className="company-sidebar__dropdown-menu">
              {/* <li
                className={`p-0 ${
                  location.pathname === "/CompanygenralSetting" ? "active" : ""
                }`}
              >
                <Link to="/CompanygenralSetting">Genral</Link>
              </li> */}
              <li
                className={` p-0 ${
                  location.pathname === "/CompanySetting" ? "active" : ""
                }`}
              >
                <Link to="/CompanySetting">Company Information</Link>
              </li>

              {/* <li
                className={` p-0 ${
                  location.pathname === "/localizaion" ? "active" : ""
                }`}
              >
                <Link to="/CompanyBankDetailsSetting">Localization</Link>
              </li> */}

              <li
                className={` p-0 ${
                  location.pathname === "/CompanyBankDetailsSetting"
                    ? "active"
                    : ""
                }`}
              >
                <Link to="/CompanyBankDetailsSetting">Bank details</Link>
              </li>
            </ul>
          )}
        </li>
      </ul>

      <div className="company-sidebar__logout-link">
        <button onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </div>
  );
};

export default CompanySidebar;

// import React, { useState } from "react";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import {
//   FaTachometerAlt,
//   FaUsers,
//   FaBuilding,
//   FaUserTag,
//   FaCog,
//   FaSignOutAlt,
//   FaUserTie,
//   FaProjectDiagram,
//   FaRProject,
//   FaRandom,
// } from "react-icons/fa";
// import "./CompanySidebar.css";

// const CompanySidebar = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [settingsOpen, setSettingsOpen] = useState(false);
//   const handleLogout = () => {
//     localStorage.clear();
//     navigate("/login");
//   };

//   const toggleSettings = () => {
//     setSettingsOpen(!settingsOpen);
//   };

//   return (
//     <div className="sidebar-company">
//       <div className="brand">CRM-Tech</div>

//       <ul className="nav-links">
//         <li className={location.pathname === "/compDash" ? "active" : ""}>
//           <Link to="/compDash">
//             <FaTachometerAlt /> Dashboard
//           </Link>
//         </li>

//         <li className={location.pathname === "/lead" ? "active" : ""}>
//           <Link to="/leadDash">
//             <FaUserTie /> Lead
//           </Link>
//         </li>
//         <li className={location.pathname === "/EmployeeList" ? "active" : ""}>
//           <Link to="/EmployeeList">
//             <FaUsers /> Employee
//           </Link>
//         </li>

//         <li className={location.pathname === "/department" ? "active" : ""}>
//           <Link to="/department">
//             <FaBuilding /> Department
//           </Link>
//         </li>
//         <li className={location.pathname === "/CompRole" ? "active" : ""}>
//           <Link to="/CompRole">
//             <FaUserTag /> Role
//           </Link>
//         </li>

//         <li className={location.pathname === "/Projectlist" ? "active" : ""}>
//           <Link to="/Projectlist">
//             <FaRandom /> Project
//           </Link>
//         </li>

//         <li className={location.pathname === "/Staffmember" ? "active" : ""}>
//           <Link to="/Staffmember">
//             <FaUsers /> Staff
//           </Link>
//         </li>

//         <li className={`settings-dropdown ${settingsOpen ? "open" : ""}`}>
//           <div onClick={toggleSettings} className="settings-toggle p-0">
//             <FaCog /> Settings
//           </div>
//           {settingsOpen && (
//             <ul className="dropdown-menu-right">
//               <li
//                 className={
//                   location.pathname === "/CompanySetting" ? "active" : ""
//                 }
//               >
//                 <Link to="/CompanySetting">Company Information</Link>
//               </li>
//             </ul>
//           )}
//         </li>
//       </ul>

//       <div className="logout-link">
//         <button onClick={handleLogout}>
//           <FaSignOutAlt /> Logout
//         </button>
//       </div>
//     </div>
//   );
// };

// export default CompanySidebar;
