import "../admin.css";
//import logo from "../assets/final.png";
import { useState } from "react";
import { Link, useLocation , useNavigate } from "react-router-dom";

export default function AdminSidebar() 
{

  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname.toLowerCase();

  const [openDropdown, setOpenDropdown] = useState(null);


  // Find which dropdown belongs to current page
  const activeDropdown =
    currentPath.includes("/admin/viewusers") ||
    currentPath.includes("/admin/manageusers")
      ? "users"

      : currentPath.includes("/admin/addcompany") ||
        currentPath.includes("/admin/managecompany") ||
        currentPath.includes("/admin/view_company")
      ? "companies"

      : currentPath.includes("/admin/drives") ||
        currentPath.includes("/admin/applications")
      ? "placements"

      : null;


  const currentDropdown =
    openDropdown || activeDropdown;


  const toggleDropdown = (dropdown) => {

    setOpenDropdown(
      openDropdown === dropdown
        ? null
        : dropdown
    );

  };
  const handleLogout = () => {
  // Remove admin login information
  localStorage.removeItem("adminLoggedIn");
  localStorage.removeItem("adminName");

  // If you have a general login/session key, remove it too
  localStorage.removeItem("token");

  // Redirect to login page
  navigate("/admin/adminlogin", { replace: true });
};


  // const isActive = (path) => {

  //   return currentPath === path.toLowerCase();

  // };


  return (
 
     <div
       className="bg-white border-end position-fixed top-0 start-0"
       style={{
         width: "250px",
         height: "100vh",
         zIndex: 1000,
         overflowY: "auto"
       }}
     >
 
       {/* ================= Logo ================= */}
 
       <div className="p-4 border-bottom">
 
         <h4 className="fw-bold text-primary mb-0">
           EduHire
         </h4>
 
         <small className="text-muted">
           Elevating collage to career
         </small>
 
       </div>
 
 
       {/* ================= Sidebar Menu ================= */}
 
       <div className="p-3 d-flex flex-column" style={{ minHeight: "calc(100vh - 100px)" }}>
 
 
         {/* ================= Dashboard ================= */}
 
         <Link
           to="/Admin/Dashboard"
           className="d-flex align-items-center text-decoration-none text-dark rounded p-2 mb-2"
         >
 
           <i className="bi bi-speedometer2 fs-5 me-3"></i>
 
           <span className="fw-medium">
             Dashboard
           </span>
 
         </Link>
 
 
         {/* ================= Users ================= */}
 
         <div className="mb-2">
 
           <button
             type="button"
             className="btn btn-light w-100 text-start d-flex align-items-center justify-content-between border-0"
             onClick={() => toggleDropdown("users")}
           >
 
             <span className="d-flex align-items-center">
 
               <i className="bi bi-people fs-5 me-3"></i>
 
               <span>
                 Student
               </span>
 
             </span>
 
             <i
               className={`bi ${
                 currentDropdown === "users"
                   ? "bi-chevron-up"
                   : "bi-chevron-down"
               }`}
             ></i>
 
           </button>
 
 
           {currentDropdown === "users" && (
 
             <div className="ms-4 mt-1">
 
               {/* View Student */}
 
               <Link
                 to="/Admin/ViewUsers"
                 className="d-block text-decoration-none text-secondary py-2"
               >
 
                 <i className="bi bi-person-lines-fill me-2"></i>
 
                 View Students
 
               </Link>
 
 
               {/* Manage Students */}
 
               <Link
                 to="/Admin/ManageUsers"
                 className="d-block text-decoration-none text-secondary py-2"
               >
 
                 <i className="bi bi-pencil-square me-2"></i>
 
                 Manage Students
 
               </Link>
 
 
             </div>
 
           )}
 
         </div>
 
 
         {/* ================= Companies ================= */}
 
         <div className="mb-2">
 
           <button
             type="button"
             className="btn btn-light w-100 text-start d-flex align-items-center justify-content-between border-0"
             onClick={() => toggleDropdown("companies")}
           >
 
             <span className="d-flex align-items-center">
 
               <i className="bi bi-building fs-5 me-3"></i>
 
               <span>
                 Companies
               </span>
 
             </span>
 
             <i
               className={`bi ${
                 currentDropdown === "companies"
                   ? "bi-chevron-up"
                   : "bi-chevron-down"
               }`}
             ></i>
 
           </button>
 
 
           {currentDropdown === "companies" && (
 
             <div className="ms-4 mt-1">
 
               {/* Add Company */}
 
               <Link
                 to="/Admin/AddCompany"
                 className="d-block text-decoration-none text-secondary py-2"
               >
 
                 <i className="bi bi-plus-circle me-2"></i>
 
                 Add Company
 
               </Link>
 
 
               {/* Manage Company */}
 
               <Link
                 to="/Admin/ManageCompany"
                 className="d-block text-decoration-none text-secondary py-2"
               >
 
                 <i className="bi bi-pencil-square me-2"></i>
 
                 Manage Company
 
               </Link>
 
 
               {/* View Company */}
 
               <Link
                 to="/Admin/View_Company"
                 className="d-block text-decoration-none text-secondary py-2"
               >
 
                 <i className="bi bi-buildings me-2"></i>
 
                 View Company
 
               </Link>
 
             </div>
 
           )}
 
         </div>
 
 
         {/* ================= Placements ================= */}
 
         <div className="mb-2">
 
           <button
             type="button"
             className="btn btn-light w-100 text-start d-flex align-items-center justify-content-between border-0"
             onClick={() => toggleDropdown("placements")}
           >
 
             <span className="d-flex align-items-center">
 
               <i className="bi bi-briefcase fs-5 me-3"></i>
 
               <span>
                 Placements
               </span>
 
             </span>
 
             <i
               className={`bi ${
                 currentDropdown === "placements"
                   ? "bi-chevron-up"
                   : "bi-chevron-down"
               }`}
             ></i>
 
           </button>
 
 
           {currentDropdown === "placements" && (
 
             <div className="ms-4 mt-1">
 
               {/* Drives */}
 
               <Link
                 to="/Admin/Drives"
                 className="d-block text-decoration-none text-secondary py-2"
               >
 
                 <i className="bi bi-broadcast me-2"></i>
 
                 Drives
 
               </Link>
 
 
               {/* Applications */}
 
               <Link
                 to="/Admin/Applications"
                 className="d-block text-decoration-none text-secondary py-2"
               >
 
                 <i className="bi bi-file-earmark-text me-2"></i>
 
                 Applications
 
               </Link>
 
             </div>
 
           )}
 
         </div>
 
 
         {/* ================= Excel Report ================= */}
 
         <div className="mb-2">
 
           <Link
             to="/Admin/ExcelReport"
             className="d-flex align-items-center text-decoration-none text-dark rounded p-2"
           >
 
             <i className="bi bi-file-earmark-excel fs-5 me-3"></i>
 
             <span className="fw-medium">
               Excel Report
             </span>
 
           </Link>
 
         </div>

         {/* Logout  */}

          <div className="mt-auto pt-3 border-top">

            <button
              type="button"
              onClick={handleLogout}
              className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 rounded-3 fw-semibold"
            >
              <i className="bi bi-box-arrow-right fs-5"></i>
              Logout
            </button>

          </div>
          
 
       </div>
 
     </div>
 
   );
 };
 