// // src/layouts/RoleLayout.jsx
// import React from "react";
// import NavbarSuperAdmin from "../SuperAdminComponent/NavbarSuperAdmin";
// import CompanyNavbar from "../Company/CompanyNabar";
// // import NavbarAdmin from "../components/navbars/NavbarAdmin";
// // import NavbarEmployee from "../components/navbars/NavbarEmployee";

// const RoleLayout = ({ role, children }) => {
//   const renderNavbar = () => {
//     switch (role) {
//       case "superadmin":
//         return <NavbarSuperAdmin />;
//        case "company":
//          return <CompanyNavbar />;
//       // case "employee":
//       //   return <NavbarEmployee />;
//       default:
//         return null; // Or show no navbar
//     }
//   };

//   return (
//     <>
//       {renderNavbar()}
//       <div className="container mt-4">{children}</div>
//     </>
//   );
// };

// export default RoleLayout;
