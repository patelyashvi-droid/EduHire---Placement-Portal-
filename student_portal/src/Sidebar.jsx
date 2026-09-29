//import React from "react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

function Sidebar( { isSidebarOpen, onClose }) {
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        // First check localStorage for immediate state
        const savedStudentStr = localStorage.getItem("student");
        let savedStudent = null;
        if (savedStudentStr) {
          try {
            savedStudent = JSON.parse(savedStudentStr);
            if (savedStudent) {
              setStudent(savedStudent);
            }
          } catch (e) {
            console.error("Error parsing saved student:", e);
          }
        }

        const emailId = localStorage.getItem("emailId") || savedStudent?.email;
        const studentId = localStorage.getItem("studentId") || savedStudent?.studentId;

        console.log("SIDEBAR FETCH IDENTIFIERS:", { emailId, studentId });

        let response = null;
        if (emailId) {
          response = await fetch(
            `http://localhost:5000/api/students/email/${encodeURIComponent(emailId)}`
          );
        } else if (studentId) {
          response = await fetch(
            `http://localhost:5000/api/students/${encodeURIComponent(studentId)}`
          );
        }

        if (response && response.ok) {
          const data = await response.json();
          console.log("SIDEBAR STUDENT DATA:", data);
          if (data && !data.message) {
            setStudent(data);
            localStorage.setItem("student", JSON.stringify(data));
          }
        }
      } catch (error) {
        console.error("FETCH SIDEBAR STUDENT ERROR:", error);
      }
    };

    fetchStudent();
  }, []);

  return (
    <>
    
      <div className={`sidebar-backdrop ${isSidebarOpen ? 'show' : ''}`} onClick={onClose} data-sidebar-close></div>

      <aside
        className={`admin-sidebar ${
          isSidebarOpen ? "sidebar-expanded" : "sidebar-collapsed"
        }`}
        id="adminSidebar"
        aria-label="Main navigation"
      >
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <Link
            className="brand-mark"
            to="/dashboard"
            aria-label="College Placement Portal"
          >
            <span className="brand-icon">
              <i className="bi bi-mortarboard-fill"></i>
            </span>

            <span className="brand-copy">
              <span className="brand-title">EduHire</span>
              <span className="brand-subtitle">Student Dashboard</span>
            </span>
          </Link>
        </div>

        {/* Sidebar Navigation */}
        <nav className="sidebar-nav">
          <Link className="nav-link" to="/dashboard">
            <span className="nav-icon">
              <i className="bi bi-house-door-fill"></i>
            </span>
            <span className="nav-text">Dashboard</span>
          </Link>

          <Link className="nav-link" to="/profile">
            <span className="nav-icon">
              <i className="bi bi-person-circle"></i>
            </span>
            <span className="nav-text">Profile</span>
          </Link>

          <Link className="nav-link" to="/companies">
            <span className="nav-icon">
              <i className="bi bi-building"></i>
            </span>
            <span className="nav-text">Companies</span>
          </Link>

          <Link className="nav-link" to="/apply">
            <span className="nav-icon">
              <i className="bi bi-file-earmark-check"></i>
            </span>
            <span className="nav-text">Applied Company</span>
          </Link>

          <Link className="nav-link" to="/status">
            <span className="nav-icon">
              <i className="bi bi-clock-history"></i>
            </span>
            <span className="nav-text">Application Status</span>
          </Link>

           <Link className="nav-link" to="/Resume">
            <span className="nav-icon">
              <i className="bi bi-file-earmark-pdf text-regular me-2"></i>
            </span>
            <span className="nav-text">Resume</span>
          </Link>

          <Link
            className="nav-link"
            to="/login"
            onClick={() => {
              localStorage.removeItem("student");
              localStorage.removeItem("studentId");
              localStorage.removeItem("emailId");
              localStorage.removeItem("isLoggedIn");
              localStorage.removeItem("studentEmail");
              localStorage.removeItem("id");
            }}
          >
            <span className="nav-icon">
              <i className="bi bi-box-arrow-right"></i>
            </span>
            <span className="nav-text">Logout</span>
          </Link>
        </nav>

        {/* Student Info */}
        <div className="sidebar-user">

          {/* <img
            className="avatar-img avatar-md sidebar-user-avatar"
            src="https://i.pravatar.cc/150?img=12"
            alt="Student"
          /> */}

          <div className="sidebar-user-details">
            <strong className="sidebar-user-name">
              {student?.name || "Student Name"}
            </strong>

            <small className="sidebar-user-dept">
              {student?.department || "Department"}
            </small>
          </div>

        </div>

      </aside>
    </>
  );
}

export default Sidebar;