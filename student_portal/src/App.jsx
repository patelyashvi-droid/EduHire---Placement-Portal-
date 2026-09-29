import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
import {useState} from 'react';
import "./App.css";

// Admin components
import AdminSidebar from "./admin/components/AdminSidebar.jsx";
import AdminNavbar from "./admin/components/AdminNavbar.jsx";

// Admin pages
import AdminLogin from "./admin/pages/AdminLogin.jsx";
import AdminDashboard from "./admin/pages/AdminDashboard.jsx";
import View_Company from "./admin/pages/View_Company.jsx";
import AddCompany from "./admin/pages/AddCompany.jsx";
import ManageCompany from "./admin/pages/ManageCompany.jsx";
import ViewUsers from "./admin/pages/ViewUsers.jsx";
import ManageUsers from "./admin/pages/ManageUsers.jsx";
import Drives from "./admin/pages/Drives.jsx";
import Applications from "./admin/pages/Applications.jsx";
import ExcelReport from "./admin/pages/ExcelReport.jsx";

// User pages
import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Registration.jsx";
import Otp from "./pages/Otp";
import Dashboard from "./pages/Dashboard";
import CreateProfile from "./pages/CreateProfile";
import Updateprofile from "./pages/Updateprofile.jsx";
import CompanyList from "./pages/CompanyList";
import CompanyDetails from "./pages/CompanyDetails";
import ApplyCompany from "./pages/ApplyCompany";
import ApplicationStatus from "./pages/ApplicationStatus";
import Resume from "./pages/Resume";
import Forgotpass from "./pages/Forgotpass.jsx";
import ProtectedRoute from "./pages/ProtectedRoutes.jsx";


// ================= STUDENT LAYOUT =================

function StudentLayout() {

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={`admin-layout ${isSidebarOpen ? "sidebar-open" : "sidebar-collapsed-layout"}`} id="app">

      <Sidebar
        isSidebarOpen={isSidebarOpen}
        onClose={handleSidebarToggle}
      />

      <div className={`main-content ${isSidebarOpen ? "main-content-expanded" : "main-content-full"}`}>

        <Navbar
          onSidebarToggle={handleSidebarToggle}
        />

        <div className="page-content">
          <Outlet />
        </div>

      </div>

    </div>
  );
}


// ================= ADMIN LAYOUT =================

function AdminLayout() {

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div
      className={`layout-wrapper layout-content-navbar ${
        isSidebarOpen ? "layout-menu-expanded" : ""
      }`}
    >

      <div className="layout-container">

        <AdminSidebar
          isSidebarOpen={isSidebarOpen}
          onSidebarToggle={handleSidebarToggle}
        />

        <div className="layout-page">

          <AdminNavbar
            onSidebarToggle={handleSidebarToggle}
          />

          <div className="content-wrapper">
            <Outlet />
          </div>

        </div>

      </div>

    </div>
  );
}

// admin routes
 function AdminProtectedRoute() {
  const isLoggedIn = localStorage.getItem("adminLoggedIn");

  return isLoggedIn === "true"
    ? <Outlet />
    : <Navigate to="/admin/adminlogin" replace />;
}


// ================= APP =================

function App() {

  return (
    <BrowserRouter>

      <Routes>

        {/* ================= PUBLIC ================= */}

        <Route path="/login" element={<Login />} />

        <Route
          path="/registration"
          element={<Register />}
        />

        <Route
          path="/forgotpass"
          element={<Forgotpass />}
        />

        <Route
          path="/otp"
          element={<Otp />}
        />

         {/* login  */}

           <Route
            path="/admin/adminlogin"
            element={<AdminLogin />}
          />


        {/* ================= STUDENT ================= */}

        <Route element={<StudentLayout />}>

          <Route
            path="/"
           element={
                    <ProtectedRoute>
                     <Home />
                     </ProtectedRoute>}
          />

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/profile"
            element={<CreateProfile />}
          />

           <Route
            path="/Updateprofile"
            element={<Updateprofile />}
          />

          <Route
            path="/companies"
            element={<CompanyList />}
          />

          <Route
            path="/company"
            element={<CompanyDetails />}
          />

          <Route
            path="/apply"
            element={<ApplyCompany />}
          />

         

          <Route
            path="/status"
            element={<ApplicationStatus />}
          />

           <Route
            path="/Resume"
            element={<Resume />}
          />

        </Route>


        {/* ================= ADMIN ================= */}

<Route element={<AdminProtectedRoute />}>
        <Route element={<AdminLayout />}>

          {/* Dashboard */}
          <Route
            path="/admin"
            element={
              <Navigate
                to="/admin/dashboard"
                replace
              />
            }
          />

          <Route
            path="/admin/dashboard"
            element={<AdminDashboard />}
          />

           

          {/* Users */}
          <Route
            path="/admin/viewusers"
            element={<ViewUsers />}
          />

          <Route
            path="/admin/manageusers"
            element={<ManageUsers />}
          />


          {/* Companies */}
          <Route
            path="/admin/view_company"
            element={<View_Company />}
          />

          <Route
            path="/admin/addcompany"
            element={<AddCompany />}
          />

           <Route
            path="/admin/addcompany/:id"
            element={<AddCompany />}
          />

          <Route
            path="/admin/managecompany"
            element={<ManageCompany />}
          />


          {/* Placements */}
          <Route
            path="/admin/drives"
            element={<Drives />}
          />

          <Route
            path="/admin/applications"
            element={<Applications />}
          />
           <Route
            path="/admin/excelreport"
            element={<ExcelReport />}
          />

        </Route>
      </Route>

      </Routes>

    </BrowserRouter>
  );
}

export default App;