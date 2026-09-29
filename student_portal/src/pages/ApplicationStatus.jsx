import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function ApplicationStatus() {
  const [student, setStudent] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  // 1. Get logged-in student info
  useEffect(() => {
    const savedStudentStr = localStorage.getItem("student") || localStorage.getItem("studentData");
    if (savedStudentStr) {
      try {
        setStudent(JSON.parse(savedStudentStr));
      } catch (e) {}
    }
  }, []);

  // 2. Fetch student applications
  const fetchStudentApplications = async () => {
    try {
      const studentId = localStorage.getItem("studentId") || student?.studentId || student?.id || student?.email;
      const emailId = localStorage.getItem("emailId") || student?.email;
      const targetId = studentId || emailId;

      if (!targetId) {
        setLoading(false);
        return;
      }

      const res = await fetch(`http://localhost:5000/api/applications/student/${encodeURIComponent(targetId)}`);
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (err) {
      console.error("Error fetching application status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (student || localStorage.getItem("studentId") || localStorage.getItem("emailId")) {
      fetchStudentApplications();
    } else {
      setLoading(false);
    }
  }, [student]);

  const cancelApplication = async (id) => {
    if (window.confirm("Are you sure you want to cancel this application? This action cannot be undone.")) {
      try {
        const res = await fetch(`http://localhost:5000/api/applications/${id}`, {
          method: "DELETE",
        });

        if (res.ok) {
          alert("Application canceled successfully.");
          setApplications((prev) => prev.filter((app) => app._id !== id && app.applicationId !== id));
        } else {
          const errData = await res.json();
          alert(errData.message || "Failed to cancel application.");
        }
      } catch (err) {
        console.error("Cancel application error:", err);
        alert("An error occurred. Please try again.");
      }
    }
  };

  const filteredApps = applications.filter(app => {
    if (filter === "All") return true;
    return app.status === filter || String(app.statusId) === String(filter);
  });

  const shortlistedApps = applications.filter(app => app.statusId === 2 || app.statusId === 3 || app.status === "Shortlisted" || app.status === "Selected");

  const getStatusBadge = (app) => {
    const statusName = app.status || "Applied";
    const sId = Number(app.statusId);
    if (sId === 3 || statusName === "Selected") return "bg-success text-white";
    if (sId === 2 || statusName === "Shortlisted") return "bg-info text-white";
    if (sId === 1 || statusName === "Applied") return "bg-warning text-dark";
    if (sId === 4 || statusName === "Rejected") return "bg-danger text-white";
    return "bg-secondary text-white";
  };

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      {/* Page Heading */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1">My Application Status Tracker</h3>
          <p className="text-muted mb-0">Track real-time status IDs, descriptions, and shortlist decisions for your applications</p>
        </div>
        <Link to="/companies" className="btn btn-primary rounded-pill px-4">
          <i className="bi bi-building me-2"></i>Explore Companies
        </Link>
      </div>

      {/* Shortlisted Announcement Highlight Banner */}
     {/* Dynamic Status Announcement */}
{shortlistedApps.length > 0 && (
  <div
    className={`alert border-0 shadow-sm rounded-4 p-4 mb-4 position-relative overflow-hidden ${
      applications.some(
        app => Number(app.statusId) === 3 || app.status === "Selected"
      )
        ? "alert-success"
        : "alert-info"
    }`}
  >
    <div className="d-flex align-items-center gap-3">

      <div
        className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm ${
          applications.some(
            app => Number(app.statusId) === 3 || app.status === "Selected"
          )
            ? "bg-white text-success"
            : "bg-white text-info"
        }`}
        style={{
          width: "50px",
          height: "50px",
          fontSize: "1.5rem"
        }}
      >
        <i
          className={
            applications.some(
              app => Number(app.statusId) === 3 || app.status === "Selected"
            )
              ? "bi bi-trophy-fill"
              : "bi bi-star-fill"
          }
        ></i>
      </div>

      <div>
        {applications.some(
          app => Number(app.statusId) === 3 || app.status === "Selected"
        ) ? (
          <>
            <h5 className="fw-bold mb-1">
              🎉 Congratulations! You have been Selected!
            </h5>

            <p className="mb-0">
              {applications
                .filter(
                  app =>
                    Number(app.statusId) === 3 ||
                    app.status === "Selected"
                )
                .map(
                  app =>
                    `${app.companyName} (${app.role}) - Selected`
                )
                .join(" • ")}
            </p>
          </>
        ) : (
          <>
            <h5 className="fw-bold mb-1">
              🎉 You have been Shortlisted!
            </h5>

            <p className="mb-0">
              {applications
                .filter(
                  app =>
                    Number(app.statusId) === 2 ||
                    app.status === "Shortlisted"
                )
                .map(
                  app =>
                    `${app.companyName} (${app.role}) - Shortlisted`
                )
                .join(" • ")}
            </p>
          </>
        )}
      </div>

    </div>
  </div>
)}

      {/* Filter Tabs */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <span className="fw-bold fs-7 text-dark">Filter Status:</span>
          <div className="btn-group flex-wrap" role="group" aria-label="Status Filters">
            {["All", "Applied", "Shortlisted", "Selected", "Rejected"].map(st => (
              <button
                key={st}
                type="button"
                className={`btn btn-sm px-3 fw-semibold ${filter === st ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => setFilter(st)}
              >
                {st} {st !== "All" && `(${applications.filter(a => a.status === st || (st === "Applied" && a.statusId === 1) || (st === "Shortlisted" && a.statusId === 2) || (st === "Selected" && a.statusId === 3) || (st === "Rejected" && a.statusId === 4)).length})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Applications Cards Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2 text-muted">Fetching your application updates...</p>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
          <i className="bi bi-card-checklist display-4 text-muted mb-3"></i>
          <h5>No Applications Found</h5>
          <p className="text-muted fs-7">
            {filter === "All"
              ? "You haven't submitted any job applications yet."
              : `No applications currently have status '${filter}'.`}
          </p>
          <div>
            <Link to="/companies" className="btn btn-outline-primary rounded-pill px-4">
              Browse Open Placement Drives
            </Link>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {filteredApps.map(app => {
            const statusName = app.status || "Applied";
            const sId = Number(app.statusId) || 1;
            const isShortlisted = sId === 2 || statusName === "Shortlisted";
            const isSelected = sId === 3 || statusName === "Selected";

            return (
              <div key={app._id || app.applicationId} className="col-12 col-md-6 col-xl-4">
                <div className="card border-0 shadow-sm rounded-4 h-100 p-4 d-flex flex-column justify-content-between position-relative">
                  <div>
                    {/* Company & Role Header */}
                    <div className="d-flex align-items-start justify-content-between mb-3">
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-primary-subtle text-primary rounded-3 d-flex align-items-center justify-content-center fw-bold fs-5 shadow-sm" style={{ width: "48px", height: "48px" }}>
                          {(app.companyName || "C").substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h5 className="fw-bold mb-0 text-dark fs-6">{app.companyName}</h5>
                          <small className="text-muted"><i className="bi bi-briefcase me-1"></i>{app.role}</small>
                        </div>
                      </div>

                      <span className={`badge rounded-pill px-3 py-1.5 fs-8 ${getStatusBadge(app)}`}>
                        ID {sId}: {statusName}
                      </span>
                    </div>

                    {/* Status Description from DB */}
                    {app.description && (
                      <div className="p-2 px-3 rounded-3 mb-3 bg-light text-secondary border fs-8">
                        <small className="fw-bold text-dark d-block">Status Info:</small>
                        {app.description}
                      </div>
                    )}

                    {/* Notification Message if Shortlisted/Selected */}
                    {app.notificationMessage && (
                      <div className={`p-3 rounded-3 mb-3 border fs-8 ${isShortlisted ? 'bg-info-subtle border-info-subtle text-info-emphasis' : isSelected ? 'bg-success-subtle border-success-subtle text-success-emphasis' : 'bg-light text-secondary'}`}>
                        <i className="bi bi-bell-fill me-1.5"></i>
                        {app.notificationMessage}
                      </div>
                    )}

                    {/* Status Timeline Stepper */}
                    <div className="my-3">
                      <small className="fw-semibold text-muted d-block mb-2 fs-8">Application Progress:</small>
                      <div className="d-flex align-items-center justify-content-between position-relative px-2">
                        <div className="text-center">
                          <div className="rounded-circle bg-success text-white d-inline-flex align-items-center justify-content-center" style={{ width: "28px", height: "28px", fontSize: "12px" }}>
                            <i className="bi bi-check"></i>
                          </div>
                          <small className="d-block text-muted fs-9 mt-1 fw-semibold">Applied (1)</small>
                        </div>

                        <div className={`flex-grow-1 mx-2 ${isShortlisted || isSelected ? 'border-top border-success border-2' : 'border-top border-2'}`} style={{ height: "0" }}></div>

                        <div className="text-center">
                          <div className={`rounded-circle d-inline-flex align-items-center justify-content-center ${isShortlisted || isSelected ? 'bg-info text-white' : 'bg-light text-muted border'}`} style={{ width: "28px", height: "28px", fontSize: "12px" }}>
                            <i className="bi bi-star-fill"></i>
                          </div>
                          <small className={`d-block fs-9 mt-1 fw-semibold ${isShortlisted || isSelected ? 'text-info' : 'text-muted'}`}>
                            Shortlisted (2)
                          </small>
                        </div>

                        <div className={`flex-grow-1 mx-2 ${isSelected ? 'border-top border-success border-2' : 'border-top border-2'}`} style={{ height: "0" }}></div>

                        <div className="text-center">
                          <div className={`rounded-circle d-inline-flex align-items-center justify-content-center ${isSelected ? 'bg-success text-white' : 'bg-light text-muted border'}`} style={{ width: "28px", height: "28px", fontSize: "12px" }}>
                            <i className="bi bi-trophy-fill"></i>
                          </div>
                          <small className={`d-block fs-9 mt-1 fw-semibold ${isSelected ? 'text-success' : 'text-muted'}`}>
                            Selected (3)
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cancel Button */}
                  {sId !== 3 && sId !== 4 && (
                    <div className="mt-3 mb-1">
                      <button
                        className="btn btn-sm btn-outline-danger w-100 rounded-pill fs-8"
                        onClick={() => cancelApplication(app._id || app.applicationId)}
                      >
                        <i className="bi bi-x-circle me-1"></i> Cancel Application
                      </button>
                    </div>
                  )}

                  {/* Footer Details */}
                  <div className="border-top pt-3 mt-3 d-flex align-items-center justify-content-between fs-8 text-muted">
                    <span>App ID: <strong className="text-dark">{app.applicationId || "N/A"}</strong></span>
                    <span>Applied On: <strong className="text-dark">{app.appliedDate || new Date(app.appliedAt).toISOString().split('T')[0]}</strong></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}