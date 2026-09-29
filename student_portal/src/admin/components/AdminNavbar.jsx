import { useState, useEffect, useRef } from "react";
import "../admin.css";
import avatar1 from "../assets/img/avatars/1.png";
//import { Link } from "react-router-dom";

export default function AdminNavbar({ onSidebarToggle }) {

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const notificationRef = useRef(null);



  // FETCH PENDING STUDENTS


  const fetchPendingStudents = async () => {

    try {

      const response = await fetch(
        "http://localhost:5000/api/students/pending"
      );

      const data = await response.json();

      if (response.ok) {

        setPendingStudents(
          data.students || []
        );

      }

    } catch (error) {

      console.error(
        "Notification fetch error:",
        error
      );

    }
  };

   
 
  // LOAD PENDING STUDENTS


  useEffect(() => {

    fetchPendingStudents();

    // Check for new registrations every 10 seconds
    const interval = setInterval(() => {

      fetchPendingStudents();

    }, 10000);

    return () => {
      clearInterval(interval);
    };

  }, []);


  // ACCEPT STUDENT

 const approveStudent = async (studentId) => {
  try {
    console.log("APPROVING STUDENT ID:", studentId);

    const response = await fetch(
      `http://localhost:5000/api/students/${studentId}/approve`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    const text = await response.text();

    console.log("APPROVE STATUS:", response.status);
    console.log("APPROVE RESPONSE:", text);

    let data = {};

    try {
      data = JSON.parse(text);
    } catch {
      data = {
        message: text
      };
    }

    if (response.ok) {
      alert("Student approved successfully");

      setPendingStudents((prev) =>
        prev.filter(
          (student) => student._id !== studentId
        )
      );
      return true;
    } else {
      alert(
        data.message ||
        data.error ||
        `Unable to approve student. Status: ${response.status}`
      );
      return false;
    }

  } catch (error) {

    console.error("APPROVE ERROR:", error);

    alert(
      "Unable to connect to server: " +
      error.message
    );
    return false;
  }
};

  const rejectStudent = async (studentId) => {

    const confirmReject =
      window.confirm(
        "Are you sure you want to reject this registration?"
      );

    if (!confirmReject) {
      return false;
    }

    try {

      const response = await fetch(
        `http://localhost:5000/api/students/${studentId}/reject`,
        {
          method: "PUT"
        }
      );

      const data = await response.json();

      if (response.ok) {

        alert("Student rejected");

        // Remove only rejected student
        setPendingStudents((prev) =>
          prev.filter(
            (student) =>
              student._id !== studentId
          )
        );
        return true;

      } else {

        alert(
          data.message ||
          "Unable to reject student"
        );
        return false;
      }

    } catch (error) {

      console.error(
        "Reject error:",
        error
      );

      alert(
        "Unable to connect to server"
      );
      return false;
    }

  };


  // ==========================================
  // CLOSE NOTIFICATION WHEN CLICKING OUTSIDE
  // ==========================================

  useEffect(() => {

    const handleClickOutside = (event) => {

      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          event.target
        )
      ) {

        setNotificationOpen(false);

      }

    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {

      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

    };

  }, []);


  // NOTIFICATION TOGGLE

  const toggleNotification = () => {

    setNotificationOpen(
      (prev) => !prev
    );

  };


  return (
    <>
      <nav
      className="layout-navbar container-xxl navbar navbar-expand-xl navbar-detached align-items-center bg-navbar-theme"
      id="layout-navbar"
    >

      {/* Mobile Menu Toggle */}

      <div className="layout-menu-toggle navbar-nav align-items-xl-center me-3 me-xl-0 d-xl-none">

        <a
          className="nav-item nav-link px-0 me-xl-4"
          href="#"
          onClick={(e) => {

            e.preventDefault();

            onSidebarToggle();

          }}
        >

          <i className="bx bx-menu bx-sm"></i>

        </a>

      </div>


      <div
        className="navbar-nav-right d-flex align-items-center"
        id="navbar-collapse"
      >


        <ul className="navbar-nav flex-row align-items-center ms-auto">


      

         {/* Notification */}
     <li
  className="nav-item"
  ref={notificationRef}
  style={{
    position: "relative"
  }}
>

  <button
    type="button"
    className="nav-link btn border-0 position-relative"
    onClick={() =>
      setNotificationOpen(!notificationOpen)
    }
  >

    <i className="bx bx-bell fs-4"></i>

    {pendingStudents.length > 0 && (

      <span
        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
      >
        {pendingStudents.length}
      </span>

    )}

  </button>


        {notificationOpen && (

          <div
        className="dropdown-menu show shadow"
        style={{
          position: "absolute",
          top: "100%",
          right: "0",
          width: "400px",
          maxHeight: "500px",
          overflowY: "auto",
          marginTop: "10px",
          zIndex: 1050
        }}
      >
            <div className="dropdown-header fw-bold">
        Student Registration Requests
      </div>


      {pendingStudents.length === 0 ? (

        <div className="dropdown-item text-muted text-center py-3">

          <i className="bx bx-check-circle me-2"></i>

          No pending registrations

        </div>

      ) : (

        pendingStudents.map((student) => (

          <div
            key={student._id}
            className="dropdown-item-text border-bottom p-3"
          >

            <div className="d-flex align-items-start">

              <div className="me-3">

                <div
                  className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "40px",
                    height: "40px"
                  }}
                >

                  <i className="bx bx-user"></i>

                </div>

              </div>


              <div className="flex-grow-1">

                <h6 className="mb-1">
                  {student.name}
                </h6>

                <small className="text-muted d-block">
                  Roll: {student.roll}
                </small>

                <small className="text-muted d-block">
                  {student.email}
                </small>


                <div className="mt-2">

                  <button
                    className="btn btn-sm btn-primary me-2"
                    onClick={() => {
                      setSelectedStudent(student);
                      setModalOpen(true);
                      setNotificationOpen(false);
                    }}
                  >
                    <i className="bx bx-show me-1"></i>
                    View
                  </button>

                  <button
                    className="btn btn-sm btn-success me-2"
                    onClick={() =>
                      approveStudent(
                        student._id
                      )
                    }
                  >

                    <i className="bx bx-check me-1"></i>

                    Accept

                  </button>


                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() =>
                      rejectStudent(
                        student._id
                      )
                    }
                  >

                    <i className="bx bx-x me-1"></i>

                    Reject

                  </button>

                </div>

              </div>

            </div>

          </div>

        ))

      )}

    </div>

  )}

</li>


          {/* ================================= */}
          {/* ADMIN PROFILE */}
          {/* ================================= */}

          {/* <li className="nav-item navbar-dropdown dropdown-user dropdown">

            <a
              className="nav-link dropdown-toggle hide-arrow"
              href="#"
              onClick={(e) =>
                e.preventDefault()
              }
            >

              <div className="avatar avatar-online">

                <img
                  src={avatar1}
                  alt="Admin"
                  className="w-px-40 h-auto rounded-circle"
                />

              </div>

            </a>


            <ul className="dropdown-menu dropdown-menu-end">

              <li>

                <a
                  className="dropdown-item"
                  href="#"
                  onClick={(e) =>
                    e.preventDefault()
                  }
                >

                  <div className="d-flex">

                    <div className="flex-shrink-0 me-3">

                      <div className="avatar avatar-online">

                        <img
                          src={avatar1}
                          alt="Admin"
                          className="w-px-40 h-auto rounded-circle"
                        />

                      </div>

                    </div>


                    <div className="flex-grow-1">

                      <span className="fw-semibold d-block">

                        Admin

                      </span>

                      <small className="text-muted">

                        Administrator

                      </small>

                    </div>

                  </div>

                </a>

              </li>


              <li>

                <div className="dropdown-divider"></div>

              </li>


              <li>

                <a
                  className="dropdown-item"
                  href="#"
                >

                  <i className="bx bx-user me-2"></i>

                  <span>
                    My Profile
                  </span>

                </a>

              </li>


              <li>

                <a
                  className="dropdown-item"
                  href="#"
                >

                  <i className="bx bx-cog me-2"></i>

                  <span>
                    Settings
                  </span>

                </a>

              </li>


              <li>

                <div className="dropdown-divider"></div>

              </li>


              <li>

                <a
                  className="dropdown-item"
                  href="/login"
                >

                  <i className="bx bx-power-off me-2"></i>

                  <span>
                    Log Out
                  </span>

                </a>

              </li>

            </ul>

          </li> */}

        </ul>

      </div>

    </nav>

    {modalOpen && selectedStudent && (
      <div
        className="modal fade show d-block"
        style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
          <div className="modal-content rounded-3 border-0 shadow-lg">
            <div className="modal-header border-bottom">
              <h5 className="modal-title fw-bold">
                Student Registration Details
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => {
                  setModalOpen(false);
                  setSelectedStudent(null);
                }}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body p-4">
              <div className="row g-3">
                {/* Personal Information */}
                <div className="col-12 mb-2">
                  <h6 className="fw-bold text-primary border-bottom pb-2">
                    <i className="bx bx-user me-1"></i> Personal Information
                  </h6>
                </div>
                <div className="col-md-6 mb-2">
                  <label className="form-label text-muted mb-0">Full Name</label>
                  <div className="fw-semibold text-dark fs-5">{selectedStudent.name || "N/A"}</div>
                </div>
                <div className="col-md-6 mb-2">
                  <label className="form-label text-muted mb-0">Enrollment / Roll Number</label>
                  <div className="fw-semibold text-dark fs-5">{selectedStudent.roll || "N/A"}</div>
                </div>
                <div className="col-md-6 mb-2">
                  <label className="form-label text-muted mb-0">Email Address</label>
                  <div>
                    <a href={`mailto:${selectedStudent.email}`} className="fw-semibold text-primary">
                      {selectedStudent.email || "N/A"}
                    </a>
                  </div>
                </div>
                <div className="col-md-6 mb-2">
                  <label className="form-label text-muted mb-0">Mobile Number</label>
                  <div className="fw-semibold text-dark">{selectedStudent.mobile || "N/A"}</div>
                </div>
                <div className="col-md-6 mb-2">
                  <label className="form-label text-muted mb-0">Department</label>
                  <div>
                    <span className="badge bg-label-info fs-6 px-3 py-2">
                      {selectedStudent.department || "N/A"}
                    </span>
                  </div>
                </div>
                <div className="col-md-6 mb-2">
                  <label className="form-label text-muted mb-0">Date of Birth</label>
                  <div className="fw-semibold text-dark">{selectedStudent.dob || "N/A"}</div>
                </div>
                <div className="col-12 mb-3">
                  <label className="form-label text-muted mb-0">Address</label>
                  <div className="text-secondary bg-light p-2.5 rounded border">
                    {selectedStudent.address || "No address provided"}
                  </div>
                </div>

                {/* Academic Details */}
                <div className="col-12 mt-3 mb-2">
                  <h6 className="fw-bold text-primary border-bottom pb-2">
                    <i className="bx bx-book-open me-1"></i> Academic Information
                  </h6>
                </div>
                <div className="col-md-4 mb-2">
                  <label className="form-label text-muted mb-0">10th Marks (%)</label>
                  <div className="fw-semibold text-dark fs-5">
                    {selectedStudent.mark10 !== undefined && selectedStudent.mark10 !== null ? `${selectedStudent.mark10}%` : "N/A"}
                  </div>
                </div>
                <div className="col-md-4 mb-2">
                  <label className="form-label text-muted mb-0">12th Marks (%)</label>
                  <div className="fw-semibold text-dark fs-5">
                    {selectedStudent.mark12 !== undefined && selectedStudent.mark12 !== null ? `${selectedStudent.mark12}%` : "N/A"}
                  </div>
                </div>
                <div className="col-md-4 mb-2">
                  <label className="form-label text-muted mb-0">Active Backlogs</label>
                  <div>
                    <span className={`badge ${selectedStudent.backlog > 0 ? "bg-label-danger" : "bg-label-success"} fs-6 px-3 py-2`}>
                      {selectedStudent.backlog !== undefined && selectedStudent.backlog !== null ? selectedStudent.backlog : 0}
                    </span>
                  </div>
                </div>
                <div className="col-md-6 mb-2">
                  <label className="form-label text-muted mb-0">Bachelor CGPA</label>
                  <div className="fw-semibold text-dark fs-5">
                    {selectedStudent.bachelorCgpa !== undefined && selectedStudent.bachelorCgpa !== null ? selectedStudent.bachelorCgpa : "N/A"}
                  </div>
                </div>
                <div className="col-md-6 mb-2">
                  <label className="form-label text-muted mb-0">Master CGPA</label>
                  <div className="fw-semibold text-dark fs-5">
                    {selectedStudent.masterCgpa !== undefined && selectedStudent.masterCgpa !== null ? selectedStudent.masterCgpa : "N/A"}
                  </div>
                </div>

                {/* Uploaded Documents */}
                <div className="col-12 mt-3 mb-2">
                  <h6 className="fw-bold text-primary border-bottom pb-2">
                    <i className="bx bx-paperclip me-1"></i> Attachments / Verification Files
                  </h6>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label text-muted mb-1 d-block">Resume</label>
                  {selectedStudent.resume ? (
                    <a
                      href={`http://localhost:5000/uploads/${selectedStudent.resume}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-primary btn-sm w-100 d-flex align-items-center justify-content-center"
                    >
                      <i className="bx bx-link-external me-1"></i> Open Resume
                    </a>
                  ) : (
                    <div className="alert alert-secondary py-2 mb-0 text-center text-muted small">Not Uploaded</div>
                  )}
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label text-muted mb-1 d-block">Graduation Marksheet</label>
                  {selectedStudent.graduationMarksheet ? (
                    <a
                      href={`http://localhost:5000/uploads/${selectedStudent.graduationMarksheet}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-primary btn-sm w-100 d-flex align-items-center justify-content-center"
                    >
                      <i className="bx bx-link-external me-1"></i> Open Marksheet
                    </a>
                  ) : (
                    <div className="alert alert-secondary py-2 mb-0 text-center text-muted small">Not Uploaded</div>
                  )}
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label text-muted mb-1 d-block">Master Marksheet</label>
                  {selectedStudent.masterMarksheet ? (
                    <a
                      href={`http://localhost:5000/uploads/${selectedStudent.masterMarksheet}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-primary btn-sm w-100 d-flex align-items-center justify-content-center"
                    >
                      <i className="bx bx-link-external me-1"></i> Open Marksheet
                    </a>
                  ) : (
                    <div className="alert alert-secondary py-2 mb-0 text-center text-muted small">Not Uploaded</div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer border-top">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  setModalOpen(false);
                  setSelectedStudent(null);
                }}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={async () => {
                  const success = await rejectStudent(selectedStudent._id);
                  if (success) {
                    setModalOpen(false);
                    setSelectedStudent(null);
                  }
                }}
              >
                <i className="bx bx-x me-1"></i> Reject
              </button>
              <button
                type="button"
                className="btn btn-success"
                onClick={async () => {
                  const success = await approveStudent(selectedStudent._id);
                  if (success) {
                    setModalOpen(false);
                    setSelectedStudent(null);
                  }
                }}
              >
                <i className="bx bx-check me-1"></i> Accept
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </>
);
}