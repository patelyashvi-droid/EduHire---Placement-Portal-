import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

function Navbar({ onSidebarToggle }) {
  const [darkMode, setDarkMode] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const [student, setStudent] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  // ==============================
  // LOAD LOGGED-IN STUDENT
  // ==============================
  useEffect(() => {
    try {
      const storedStudent = localStorage.getItem("student");

      if (storedStudent) {
        const parsedStudent = JSON.parse(storedStudent);

        console.log("Student loaded in Navbar:", parsedStudent);

        setStudent(parsedStudent);
      } else {
        console.log("No student found in localStorage");
      }
    } catch (error) {
      console.error("Error reading student from localStorage:", error);
    }
  }, []);

  // ==============================
  // FETCH APPLICATION NOTIFICATIONS
  // ==============================
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const studentId =
          localStorage.getItem("studentId") ||
          student?.studentId ||
          student?.id;

        const emailId =
          localStorage.getItem("emailId") ||
          student?.email;

        const targetId = studentId || emailId;

        console.log("Notification target:", targetId);

        if (!targetId) {
          return;
        }

        const res = await fetch(
          `http://localhost:5000/api/applications/student/${encodeURIComponent(
            targetId
          )}`
        );

        if (!res.ok) {
          console.error(
            "Notification API error:",
            res.status,
            res.statusText
          );
          return;
        }

        const data = await res.json();

        console.log("Application notifications:", data);

        setNotifications(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching navbar notifications:", err);
      }
    };

    if (
      student ||
      localStorage.getItem("studentId") ||
      localStorage.getItem("emailId")
    ) {
      fetchNotifications();
    }
  }, [student]);

  // ==============================
  // THEME TOGGLE
  // ==============================
  const toggleTheme = () => {
    setDarkMode((previousMode) => {
      const newMode = !previousMode;

      if (newMode) {
        document.body.classList.add("dark-mode");
      } else {
        document.body.classList.remove("dark-mode");
      }

      return newMode;
    });
  };

  // ==============================
  // PROFILE TOGGLE
  // ==============================
  const toggleProfile = () => {
    setProfileOpen((previous) => !previous);

    // Close notification dropdown
    setNotificationOpen(false);
  };

  // ==============================
  // NOTIFICATION TOGGLE
  // ==============================
  const toggleNotification = () => {
    setNotificationOpen((previous) => !previous);

    // Close profile dropdown
    setProfileOpen(false);
  };

  // ==============================
  // CLOSE DROPDOWNS WHEN CLICKING OUTSIDE
  // ==============================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ==============================
  // ALERT CHECK
  // ==============================
  const hasAlerts = notifications.some(
    (n) =>
      n.statusId === 2 ||
      n.statusId === 3 ||
      n.status === "Shortlisted" ||
      n.status === "Selected"
  );

  // ==============================
  // STUDENT NAME
  // ==============================
  const studentName =
    student?.name ||
    student?.studentName ||
    student?.fullName ||
    "Student";

  return (
    <nav className="navbar admin-navbar navbar-expand bg-white">
      <div className="container-fluid px-3 px-lg-4">

        {/* ================= SIDEBAR TOGGLE ================= */}
        <button
          className="sidebar-toggle"
          type="button"
          onClick={onSidebarToggle}
          data-sidebar-toggle
          aria-controls="adminSidebar"
          aria-expanded="true"
          aria-label="Toggle sidebar"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* ================= SEARCH ================= */}
        <form
          className="d-none d-md-flex ms-3 flex-grow-1"
          role="search"
        >
          <input
            className="form-control search-input"
            type="search"
            placeholder="Search users, orders, reports"
            aria-label="Search"
          />
        </form>

        {/* ================= RIGHT SIDE ================= */}
        <div className="navbar-actions ms-auto">

          {/* ================= THEME ================= */}
          <button
            className="icon-button theme-toggle"
            type="button"
            onClick={toggleTheme}
            data-theme-toggle
            aria-label="Switch color theme"
            title="Switch color theme"
          >
            <i
              className={
                darkMode
                  ? "bi bi-sun"
                  : "bi bi-moon-stars"
              }
              aria-hidden="true"
            ></i>
          </button>

          {/* ================= NOTIFICATION ================= */}
          <div
            className="dropdown"
            ref={notificationRef}
          >
            <button
              className="icon-button"
              type="button"
              onClick={toggleNotification}
              aria-expanded={notificationOpen}
              aria-haspopup="true"
              aria-label="Notifications"
            >
              {hasAlerts && (
                <span className="notification-dot"></span>
              )}

              <i
                className="bi bi-bell"
                aria-hidden="true"
              ></i>
            </button>

            {notificationOpen && (
              <div
                className="dropdown-menu dropdown-menu-end notification-menu show shadow-lg border-0 rounded-3"
                style={{ minWidth: "300px" }}
              >

                {/* HEADER */}
                <div className="dropdown-header fw-bold text-body d-flex align-items-center justify-content-between p-3 border-bottom">
                  <span>
                    Notifications & Status Updates
                  </span>

                  <span className="badge bg-primary rounded-pill px-2 py-1">
                    {notifications.length}
                  </span>
                </div>

                {/* NO NOTIFICATIONS */}
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted">
                    <i className="bi bi-bell-slash fs-4 d-block mb-1"></i>

                    No notifications yet.
                  </div>
                ) : (
                  notifications
                    .slice(0, 5)
                    .map((item) => (
                      <Link
                        key={
                          item._id ||
                          item.applicationId
                        }
                        to="/status"
                        className="dropdown-item py-2 px-3 border-bottom text-wrap"
                        onClick={() =>
                          setNotificationOpen(false)
                        }
                      >
                        <span
                          className={`fw-bold d-block ${
                            item.status === "Selected"
                              ? "text-success"
                              : item.status === "Shortlisted"
                              ? "text-info"
                              : "text-dark"
                          }`}
                        >
                          {item.status ===
                          "Shortlisted"
                            ? "🌟 Shortlisted!"
                            : item.status ===
                              "Selected"
                            ? "🎉 Selected!"
                            : `Status: ${item.status}`}
                        </span>

                        <span className="d-block text-muted small">
                          {item.companyName} (
                          {item.role}) •{" "}
                          {item.appliedDate}
                        </span>
                      </Link>
                    ))
                )}

                {/* FOOTER */}
                <div className="p-2 text-center border-top bg-light rounded-bottom">
                  <Link
                    to="/status"
                    className="fw-semibold text-primary text-decoration-none"
                    onClick={() =>
                      setNotificationOpen(false)
                    }
                  >
                    View My Application Tracker
                    <i className="bi bi-arrow-right ms-1"></i>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* ================= PROFILE ================= */}
          <div
            className="profile-dropdown"
            ref={profileRef}
          >
            <button
              className={`profile-button ${
                profileOpen ? "show" : ""
              }`}
              type="button"
              onClick={toggleProfile}
              aria-expanded={profileOpen}
              aria-haspopup="true"
            >
              <i className="bi bi-person-circle me-2"></i>

              <span className="profile-name d-none d-sm-inline">
                {studentName}
              </span>

              <i
                className={`bi ${
                  profileOpen
                    ? "bi-chevron-up"
                    : "bi-chevron-down"
                } ms-2`}
                aria-hidden="true"
              ></i>
            </button>

            {/* PROFILE MENU */}
            {profileOpen && (
              <div className="profile-menu">

                <Link
                  to="/profile"
                  className="profile-menu-item"
                  onClick={() =>
                    setProfileOpen(false)
                  }
                >
                  <i className="bi bi-person me-2"></i>
                  Profile
                </Link>

                <Link
                  to="/settings"
                  className="profile-menu-item"
                  onClick={() =>
                    setProfileOpen(false)
                  }
                >
                  <i className="bi bi-gear me-2"></i>
                  Account settings
                </Link>

                <div className="profile-divider"></div>

                {/* SIGN OUT */}
                <Link
                  to="/login"
                  className="profile-menu-item"
                  onClick={() => {
                    localStorage.removeItem("student");
                    localStorage.removeItem("studentId");
                    localStorage.removeItem("emailId");
                    localStorage.removeItem("isLoggedIn");
                    localStorage.removeItem("studentEmail");
                    localStorage.removeItem("id");

                    setStudent(null);
                    setProfileOpen(false);
                  }}
                >
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Sign out
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;