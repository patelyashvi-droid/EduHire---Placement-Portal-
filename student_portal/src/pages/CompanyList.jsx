import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { calculateDriveMatch } from "../utils/matchingEngine";

export default function CompanyList() {
  const [student, setStudent] = useState(null);
  const [drives, setDrives] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("recommended"); // "recommended", "all", "it", "management"
  const [appliedDrives, setAppliedDrives] = useState([]);
  const [toastMessage, setToastMessage] = useState("");
  const [selectedDrive, setSelectedDrive] = useState(null);

  // 1. FETCH LOGGED IN STUDENT DETAILS
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const savedStudentStr = localStorage.getItem("student") || localStorage.getItem("studentData");
        let savedStudent = null;
        if (savedStudentStr) {
          try {
            savedStudent = JSON.parse(savedStudentStr);
            if (savedStudent) setStudent(savedStudent);
          } catch (e) {}
        }

        const studentId = localStorage.getItem("studentId") || savedStudent?.studentId;
        const emailId = localStorage.getItem("emailId") || savedStudent?.email;
        const targetId = studentId || emailId;

        if (targetId) {
          const res = await fetch(`http://localhost:5000/api/students/${encodeURIComponent(targetId)}`);
          if (res.ok) {
            const data = await res.json();
            const finalStudent = data.student || data;
            if (finalStudent && finalStudent.name) {
              setStudent(finalStudent);
              localStorage.setItem("student", JSON.stringify(finalStudent));
            }
          }
        }
      } catch (err) {
        console.error("Error fetching student profile:", err);
      }
    };

    fetchStudent();
  }, []);

  // 2. FETCH DRIVES & COMPANIES FROM BACKEND
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [drivesRes, companiesRes] = await Promise.all([
          fetch("http://localhost:5000/api/drives"),
          fetch("http://localhost:5000/api/companies")
        ]);

        if (drivesRes.ok) {
          const drivesData = await drivesRes.json();
          setDrives(drivesData);
        }

        if (companiesRes.ok) {
          const companiesData = await companiesRes.json();
          setCompanies(companiesData);
        }
      } catch (error) {
        console.error("Error fetching drives/companies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Quick Apply Handler
  const handleQuickApply = async (driveId) => {
    try {
      const studentId = localStorage.getItem("studentId") || student?.studentId || student?.id || student?._id;

      if (!studentId) {
        setToastMessage("Please login to apply for drives.");
        return;
      }

      const response = await fetch("http://localhost:5000/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, driveId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to apply for drive.");
      }

      setAppliedDrives((prev) => [...prev, driveId]);
      setToastMessage(data.message || "Application submitted successfully!");
      setTimeout(() => setToastMessage(""), 3500);
    } catch (err) {
      setToastMessage(err.message || "Applied successfully!");
      setAppliedDrives((prev) => [...prev, driveId]);
      setTimeout(() => setToastMessage(""), 3500);
    }
  };

  // Enrich drives with match score calculation based on logged in student
  const matchedDrives = drives.map((drive) => {
    const matchInfo = calculateDriveMatch(student, drive);
    return { ...drive, matchInfo };
  });

 // Filter drives according to student's department


const studentDepartment = String(student?.department || "")
  .trim()
  .toLowerCase()
  .replace(/[\s._-]/g, "");

const departmentDrives = matchedDrives.filter((drive) => {

  const eligibility = String(drive.eligibility_criteria || "")
    .toLowerCase();

  // Normalize eligibility text
  const normalizedEligibility = eligibility
    .replace(/[\s._-]/g, "");

  // MCA
  if (
    studentDepartment === "mca" ||
    studentDepartment.includes("masterofcomputerapplications")
  ) {
    return (
      normalizedEligibility.includes("mca") ||
      normalizedEligibility.includes("masterofcomputerapplications")
    );
  }

  // MBA
  if (
    studentDepartment === "mba" ||
    studentDepartment.includes("masterofbusinessadministration")
  ) {
    return (
      normalizedEligibility.includes("mba") ||
      normalizedEligibility.includes("masterofbusinessadministration")
    );
  }

  // =========================
  // M.Sc IT / MSCIT
  // =========================
  if (
    studentDepartment === "mscit" ||
    studentDepartment === "mscit" ||
    studentDepartment.includes("msc it") ||
    studentDepartment.includes("masterofcomputerscience")
  ) {
    return (
      normalizedEligibility.includes("mscit") ||
      normalizedEligibility.includes("msc it") ||
      normalizedEligibility.includes("masterofcomputerscience") ||
      normalizedEligibility.includes("computerscienceit") ||
      normalizedEligibility.includes("computer science")
    );
  }

  // =========================
  // M.Tech
  // =========================
  if (
    studentDepartment === "mtech" ||
    studentDepartment.includes("masteroftechnology")
  ) {
    return (
      normalizedEligibility.includes("mtech") ||
      normalizedEligibility.includes("masteroftechnology")
    );
  }

  return false;
});

  // Filter logic
 const filteredDrives = departmentDrives.filter((drive) => {
    // 1. Search Query Filter
    const matchesSearch =
      drive.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drive.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drive.eligibility_criteria.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drive.location.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // 2. Tab Filter
    if (activeTab === "recommended") {
      return drive.matchInfo.matchScore >= 60;
    }

    if (activeTab === "it") {
      const crit = drive.eligibility_criteria.toLowerCase() + " " + drive.role.toLowerCase();
      return (
        crit.includes("mca") ||
        crit.includes("computer") ||
        crit.includes("cs") ||
        crit.includes("it") ||
        crit.includes("b.tech") ||
        crit.includes("btech") ||
        crit.includes("developer") ||
        crit.includes("software")
      );
    }

    if (activeTab === "management") {
      const crit = drive.eligibility_criteria.toLowerCase() + " " + drive.role.toLowerCase();
      return (
        crit.includes("mba") ||
        crit.includes("management") ||
        crit.includes("marketing") ||
        crit.includes("finance") ||
        crit.includes("hr") ||
        crit.includes("analyst")
      );
    }

    return true;
  });

  const recommendedCount = departmentDrives.filter(
  (d) => d.matchInfo.matchScore >= 60
).length;

  // Check if a drive is completed
  const isDriveCompleted = (drive) => {
    if (!drive) return false;
    if (drive.driveStatus === "Completed") return true;
    if (drive.last_date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const parts = drive.last_date.split("-").map(Number);
      if (parts.length === 3) {
        const [y, m, d] = parts;
        const lastDateObj = new Date(y, m - 1, d);
        lastDateObj.setHours(0, 0, 0, 0);
        if (lastDateObj < today) return true;
      }
    }
    return false;
  };

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1100 }}>
          <div className="toast show align-items-center text-white bg-success border-0 shadow-lg p-2">
            <div className="d-flex align-items-center justify-content-between">
              <div className="toast-body fw-semibold">
                <i className="bi bi-check-circle-fill me-2"></i>
                {toastMessage}
              </div>
              <button
                type="button"
                className="btn-close btn-close-white me-2"
                onClick={() => setToastMessage("")}
              ></button>
            </div>
          </div>
        </div>
      )}

      {/* Student Resume & Profile Overview Header */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-gradient text-dark position-relative overflow-hidden" style={{ background: "linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)" }}>
        <div className="row align-items-center g-3">
          <div className="col-lg-8">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm" style={{ width: "56px", height: "56px", fontSize: "1.5rem" }}>
                <i className="bi bi-file-earmark-person-fill"></i>
              </div>
              <div>
                <h4 className="fw-bold mb-1 text-dark">
                  Placement Companies & Drive Recommendations
                </h4>
                <p className="text-muted mb-0 fs-7">
                  Companies are automatically matched against your registered profile and uploaded resume criteria.
                </p>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="bg-white rounded-3 p-3 shadow-sm border border-light">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="fw-semibold fs-7 text-secondary">Registered Resume:</span>
                {student?.resume ? (
                  <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2.5 py-1 fs-8">
                    <i className="bi bi-file-earmark-check-fill me-1"></i> Attached
                  </span>
                ) : (
                  <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill px-2.5 py-1 fs-8">
                    <i className="bi bi-exclamation-circle me-1"></i> Pending Upload
                  </span>
                )}
              </div>
              <div className="d-flex align-items-center justify-content-between fs-8 text-muted">
                <span>Department: <strong className="text-dark">{student?.department || "MCA"}</strong></span>
                <span>CGPA: <strong className="text-dark">{student?.masterCgpa || student?.bachelorCgpa || "N/A"}</strong></span>
                <span>Backlogs: <strong className="text-dark">{student?.backlog ?? 0}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Category Filter Toolbar */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
        <div className="row align-items-center g-3">
          <div className="col-md-6 col-lg-5">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Search companies, roles, skills, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="col-md-6 col-lg-7 text-md-end">
            <div className="btn-group flex-wrap" role="group" aria-label="Drive Filters">
              <button
                type="button"
                className={`btn btn-sm px-3 fw-semibold ${activeTab === "recommended" ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => setActiveTab("recommended")}
              >
                <i className="bi bi-stars me-1 text-warning"></i>
                Recommended for Me ({recommendedCount})
              </button>

              <button
                type="button"
                className={`btn btn-sm px-3 fw-semibold ${activeTab === "all" ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => setActiveTab("all")}
              >
               All Companies ({departmentDrives.length})
              </button>

              <button
                type="button"
                className={`btn btn-sm px-3 fw-semibold ${activeTab === "it" ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => setActiveTab("it")}
              >
                IT & Software
              </button>

              <button
                type="button"
                className={`btn btn-sm px-3 fw-semibold ${activeTab === "management" ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => setActiveTab("management")}
              >
                Management
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Companies & Drives Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-3 text-muted">Matching companies with your resume and eligibility criteria...</p>
        </div>
      ) : filteredDrives.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
          <i className="bi bi-building-exclamation display-4 text-muted mb-3"></i>
          <h5>No Companies Found</h5>
          <p className="text-muted fs-7">
            {activeTab === "recommended"
              ? "No drives directly matched your current criteria. Try switching to 'All Companies'."
              : "No companies match your search parameters."}
          </p>
          <div>
            <button
              className="btn btn-outline-primary rounded-pill px-4"
              onClick={() => { setActiveTab("all"); setSearchQuery(""); }}
            >
              Reset Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {filteredDrives.map((drive) => {
            const isCompleted = isDriveCompleted(drive);
            const isApplied = appliedDrives.includes(drive._id);
            const match = drive.matchInfo;
            const isFit = match.isEligible && match.matchScore >= 50;

            // Apply Button States
            let applyBtnText = "Apply Now";
            let applyBtnClass = "btn-primary";
            let applyBtnDisabled = false;

            if (isCompleted) {
              applyBtnText = "Completed";
              applyBtnClass = "btn-secondary text-white";
              applyBtnDisabled = true;
            } else if (isApplied) {
              applyBtnText = "Applied";
              applyBtnClass = "btn-success";
              applyBtnDisabled = true;
            } else if (!isFit) {
              applyBtnText = "Not Eligible";
              applyBtnClass = "btn-outline-danger opacity-75";
              applyBtnDisabled = true;
            }

            return (
              <div key={drive._id} className="col-12 col-md-6 col-xl-4">
                <div className="card border-0 shadow-sm rounded-4 h-100 p-3 position-relative d-flex flex-column justify-content-between hover-shadow transition-all">
                  <div>
                    {/* Header: Logo, Name & CTC */}
                    <div className="d-flex align-items-start justify-content-between mb-3">
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-primary-subtle text-primary rounded-3 d-flex align-items-center justify-content-center fw-bold fs-5 shadow-sm" style={{ width: "48px", height: "48px" }}>
                          {drive.company?.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h5 className="fw-bold mb-0 text-dark fs-6">{drive.company}</h5>
                          <small className="text-muted"><i className="bi bi-geo-alt me-1"></i>{drive.location}</small>
                        </div>
                      </div>
                      <span className="badge bg-success-subtle text-success fw-bold px-2.5 py-1 fs-8 rounded-pill">
                        {drive.package}
                      </span>
                    </div>

                    {/* Role Title */}
                    <h6 className="fw-bold text-primary mb-2 fs-7">
                      <i className="bi bi-briefcase me-1"></i>{drive.role}
                    </h6>

                    {/* Resume Match Score Badge */}
                    <div className="d-flex align-items-center justify-content-between bg-light rounded-3 p-2 mb-3 border">
                      <span className="fs-8 fw-semibold text-secondary">Resume & Profile Fit:</span>
                      <span className={`badge ${isFit ? match.badgeColor : "bg-danger-subtle text-danger border border-danger-subtle"} rounded-pill px-2.5 py-1 fs-8`}>
                        {isFit ? match.matchLabel : "⚠️ Not Fit"} ({match.matchScore}%)
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-muted fs-8 mb-3 text-truncate-2" style={{ minHeight: "38px" }}>
                      {drive.description}
                    </p>

                    {/* Eligibility Criteria Tags */}
                    <div className="mb-3">
                      <small className="fw-semibold text-dark d-block mb-1 fs-8">Eligibility Breakdown:</small>
                      <ul className="list-unstyled mb-0 fs-8">
                        {match.reasons.slice(0, 3).map((reason, idx) => (
                          <li key={idx} className="text-secondary mb-1 d-flex align-items-center gap-1.5">
                            <i className={`bi ${isFit ? "bi-check-circle-fill text-success" : "bi-exclamation-triangle-fill text-warning-emphasis"} fs-9`}></i>
                            <span className="text-truncate">{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Footer & Action Buttons */}
                  <div className="border-top pt-3 mt-2 d-flex align-items-center justify-content-between">
                    {isCompleted ? (
                      <span className="badge bg-secondary-subtle text-secondary rounded-pill fs-8 px-2.5 py-1">
                        <i className="bi bi-check-all me-1"></i>Completed
                      </span>
                    ) : (
                      <span className="badge bg-info-subtle text-info-emphasis rounded-pill fs-8 px-2.5 py-1">
                        <i className="bi bi-calendar-event me-1"></i>Apply by {drive.last_date}
                      </span>
                    )}

                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-secondary rounded-pill px-3 fs-8"
                        onClick={() => setSelectedDrive(drive)}
                      >
                        Details
                      </button>

                      <button
                        type="button"
                        className={`btn btn-sm rounded-pill px-3 fw-semibold fs-8 ${applyBtnClass}`}
                        onClick={() => handleQuickApply(drive._id)}
                        disabled={applyBtnDisabled}
                        title={!isFit ? "Your registered profile does not meet the eligibility requirements" : isCompleted ? "This drive has completed" : ""}
                      >
                        {isApplied && <i className="bi bi-check-circle-fill me-1"></i>}
                        {applyBtnText}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Company Drive Details Modal */}
      {selectedDrive && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-primary text-white rounded-3 d-flex align-items-center justify-content-center fw-bold fs-4" style={{ width: "50px", height: "50px" }}>
                    {selectedDrive.company?.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h5 className="modal-title fw-bold">{selectedDrive.company}</h5>
                    <span className="text-muted fs-7">{selectedDrive.role} • {selectedDrive.location}</span>
                  </div>
                </div>
                <button type="button" className="btn-close" onClick={() => setSelectedDrive(null)}></button>
              </div>

              <div className="modal-body p-4">
                {/* Status & Eligibility Banner */}
                <div className={`p-3 rounded-3 mb-4 border ${isDriveCompleted(selectedDrive) ? "bg-secondary-subtle border-secondary-subtle" : selectedDrive.matchInfo.isEligible && selectedDrive.matchInfo.matchScore >= 50 ? "bg-success-subtle border-success-subtle" : "bg-danger-subtle border-danger-subtle"}`}>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="fw-bold">
                      <i className={`bi ${isDriveCompleted(selectedDrive) ? "bi-calendar-check" : selectedDrive.matchInfo.isEligible ? "bi-file-earmark-check" : "bi-exclamation-triangle"} me-2`}></i>
                      {isDriveCompleted(selectedDrive) ? "Placement Drive Completed" : selectedDrive.matchInfo.isEligible ? "Resume & Academic Compatibility" : "Eligibility Criteria Not Met"}
                    </span>
                    <span className={`badge ${isDriveCompleted(selectedDrive) ? "bg-secondary" : selectedDrive.matchInfo.badgeColor} rounded-pill px-3 py-1 fs-7`}>
                      {isDriveCompleted(selectedDrive) ? "Completed" : `${selectedDrive.matchInfo.matchScore}% Match`}
                    </span>
                  </div>
                  <ul className="mb-0 fs-7 text-dark ps-3">
                    {selectedDrive.matchInfo.reasons.map((r, i) => (
                      <li key={i} className="mb-1">{r}</li>
                    ))}
                  </ul>
                </div>

                {/* Package & Dates */}
                <div className="row g-3 mb-4">
                  <div className="col-4">
                    <div className="border rounded-3 p-2.5 text-center bg-light">
                      <small className="text-muted d-block fs-8">Package (CTC)</small>
                      <strong className="text-success fs-7">{selectedDrive.package}</strong>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="border rounded-3 p-2.5 text-center bg-light">
                      <small className="text-muted d-block fs-8">Drive Date</small>
                      <strong className="text-dark fs-7">{selectedDrive.drive_date}</strong>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="border rounded-3 p-2.5 text-center bg-light">
                      <small className="text-muted d-block fs-8">Last Date to Apply</small>
                      <strong className="text-danger fs-7">{selectedDrive.last_date}</strong>
                    </div>
                  </div>
                </div>

                {/* Job Description */}
                <h6 className="fw-bold text-dark mb-2">Job Description & Responsibilities:</h6>
                <p className="text-muted fs-7 mb-4">{selectedDrive.description}</p>

                {/* Full Eligibility Criteria */}
                <h6 className="fw-bold text-dark mb-2">Full Eligibility Criteria:</h6>
                <div className="p-3 bg-light rounded-3 border fs-7 text-secondary">
                  {selectedDrive.eligibility_criteria}
                </div>
              </div>

              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setSelectedDrive(null)}>
                  Close
                </button>

                <button
                  type="button"
                  className={`btn rounded-pill px-4 fw-semibold ${
                    isDriveCompleted(selectedDrive)
                      ? "btn-secondary"
                      : appliedDrives.includes(selectedDrive._id)
                      ? "btn-success"
                      : !selectedDrive.matchInfo.isEligible || selectedDrive.matchInfo.matchScore < 50
                      ? "btn-outline-danger"
                      : "btn-primary"
                  }`}
                  onClick={() => {
                    handleQuickApply(selectedDrive._id);
                    setSelectedDrive(null);
                  }}
                  disabled={
                    isDriveCompleted(selectedDrive) ||
                    appliedDrives.includes(selectedDrive._id) ||
                    !selectedDrive.matchInfo.isEligible ||
                    selectedDrive.matchInfo.matchScore < 50
                  }
                >
                  {isDriveCompleted(selectedDrive)
                    ? "Completed"
                    : appliedDrives.includes(selectedDrive._id)
                    ? "Applied"
                    : !selectedDrive.matchInfo.isEligible || selectedDrive.matchInfo.matchScore < 50
                    ? "Not Eligible"
                    : "Submit Application"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}