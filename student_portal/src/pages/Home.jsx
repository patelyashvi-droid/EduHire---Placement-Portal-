import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { calculateDriveMatch } from "../utils/matchingEngine";

function Home() {
  const [driveCategory, setDriveCategory] = useState("all");

  const [drives, setDrives] = useState([]);
  const [student, setStudent] = useState(null);

  const [appliedDrives, setAppliedDrives] = useState([]);

  const [loadingDrives, setLoadingDrives] = useState(true);
  const [loadingStudent, setLoadingStudent] = useState(true);
  const [loadingApplications, setLoadingApplications] = useState(true);

  const [toastMessage, setToastMessage] = useState("");

  // ============================================
  // DASHBOARD COUNTS
  // ============================================

  const [dashboardCounts, setDashboardCounts] = useState({
    totalCompanies: 0,
    upcomingDrives: 0,
    myApplications: 0,
    shortlisted: 0,
  });

  // ============================================
  // FETCH DRIVES
  // ============================================

  const fetchDrives = async () => {
    try {
      setLoadingDrives(true);

      const response = await fetch(
        "http://localhost:5000/api/drives"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to fetch drives"
        );
      }

      setDrives(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("FETCH DRIVES ERROR:", error);
    } finally {
      setLoadingDrives(false);
    }
  };

  // ============================================
  // FETCH STUDENT
  // ============================================

  const fetchStudent = async () => {
    try {
      setLoadingStudent(true);

      const savedStudentStr =
        localStorage.getItem("student") ||
        localStorage.getItem("studentData");

      let savedStudent = null;

      if (savedStudentStr) {
        try {
          savedStudent = JSON.parse(savedStudentStr);

          if (savedStudent) {
            setStudent(savedStudent);
          }
        } catch (error) {
          console.error(
            "Error parsing student from localStorage:",
            error
          );
        }
      }

      const studentId =
        localStorage.getItem("studentId") ||
        savedStudent?.studentId;

      const emailId =
        localStorage.getItem("emailId") ||
        savedStudent?.email;

      console.log("HOME FETCH IDENTIFIERS:", {
        studentId,
        emailId,
      });

      let response = null;

      if (studentId) {
        response = await fetch(
          `http://localhost:5000/api/students/${encodeURIComponent(
            studentId
          )}`
        );
      } else if (emailId) {
        response = await fetch(
          `http://localhost:5000/api/students/email/${encodeURIComponent(
            emailId
          )}`
        );
      }

      if (response && response.ok) {
        const data = await response.json();

        console.log(
          "HOME STUDENT DATA:",
          data
        );

        const finalStudent =
          data.student || data;

        if (finalStudent && !finalStudent.message) {
          setStudent(finalStudent);

          localStorage.setItem(
            "student",
            JSON.stringify(finalStudent)
          );
        }
      }
    } catch (error) {
      console.error(
        "FETCH STUDENT ERROR:",
        error
      );
    } finally {
      setLoadingStudent(false);
    }
  };

  // ============================================
  // FETCH APPLICATIONS
  // ============================================

  const fetchApplications = async () => {
    try {
      setLoadingApplications(true);

      const studentId =
        localStorage.getItem("studentId") ||
        student?.studentId ||
        student?._id;

      if (!studentId) {
        setLoadingApplications(false);
        return;
      }

      /*
       * Change this URL if your backend uses
       * a different application endpoint.
       */

      const response = await fetch(
        `http://localhost:5000/api/applications/student/${encodeURIComponent(
          studentId
        )}`
      );

      if (!response.ok) {
        console.log(
          "Application API response:",
          response.status
        );

        setLoadingApplications(false);
        return;
      }

      const data = await response.json();

      const applications =
        Array.isArray(data)
          ? data
          : data.applications || [];

      setAppliedDrives(
        applications
          .map((application) =>
            application.driveId?._id ||
            application.driveId ||
            application.drive?._id ||
            application.drive ||
            null
          )
          .filter(Boolean)
      );

      // ========================================
      // SHORTLISTED COUNT
      // ========================================

      const shortlistedCount =
        applications.filter((application) => {
          const status = String(
            application.status ||
            application.applicationStatus ||
            ""
          ).toLowerCase();

          return (
            status === "shortlisted" ||
            status === "selected" ||
            status === "shortlist"
          );
        }).length;

      setDashboardCounts((prev) => ({
        ...prev,
        myApplications: applications.length,
        shortlisted: shortlistedCount,
      }));
    } catch (error) {
      console.error(
        "FETCH APPLICATIONS ERROR:",
        error
      );
    } finally {
      setLoadingApplications(false);
    }
  };

  // ============================================
  // INITIAL DATA
  // ============================================

  useEffect(() => {
    fetchStudent();
    fetchDrives();
  }, []);

  // ============================================
  // FETCH APPLICATIONS AFTER STUDENT LOADS
  // ============================================

  useEffect(() => {
    if (student) {
      fetchApplications();
    }
  }, [student]);

  // ============================================
  // UPCOMING DRIVES
  // ============================================

  const upcomingDrives = drives.filter(
    (drive) => {
      if (
        drive.driveStatus === "Upcoming"
      ) {
        return true;
      }

      if (!drive.drive_date) {
        return false;
      }

      const driveDate =
        new Date(drive.drive_date);

      const today = new Date();

      today.setHours(0, 0, 0, 0);
      driveDate.setHours(0, 0, 0, 0);

      return driveDate >= today;
    }
  );

  // ============================================
  // REAL DASHBOARD COUNTS
  // ============================================

  useEffect(() => {
    /*
     * Companies are derived from drives.
     *
     * If multiple drives belong to the same company,
     * the company is counted only once.
     */

    const uniqueCompanies =
      new Set(
        drives
          .map((drive) =>
            String(
              drive.company || ""
            )
              .trim()
              .toLowerCase()
          )
          .filter(Boolean)
      );

    setDashboardCounts((prev) => ({
      ...prev,

      totalCompanies:
        uniqueCompanies.size,

      upcomingDrives:
        upcomingDrives.length,
    }));
  }, [drives]);

  // ============================================
  // FILTER DRIVES
  // ============================================

  const filteredDrives =
    driveCategory === "all"
      ? upcomingDrives
      : upcomingDrives.filter((drive) => {
          const eligibility =
            drive.eligibility_criteria?.toLowerCase() ||
            "";

          const role =
            drive.role?.toLowerCase() || "";

          if (driveCategory === "it") {
            return (
              eligibility.includes("mca") ||
              eligibility.includes("mscit") ||
              eligibility.includes("m.sc") ||
              eligibility.includes("b.tech") ||
              eligibility.includes("btech") ||
              eligibility.includes("computer science") ||
              eligibility.includes(
                "information technology"
              ) ||
              eligibility.includes("it") ||
              role.includes("developer") ||
              role.includes("software") ||
              role.includes("technical")
            );
          }

          if (
            driveCategory === "management"
          ) {
            return (
              eligibility.includes("mba") ||
              eligibility.includes(
                "management"
              ) ||
              eligibility.includes(
                "marketing"
              ) ||
              eligibility.includes("finance") ||
              eligibility.includes("hr") ||
              eligibility.includes(
                "human resource"
              ) ||
              role.includes("manager") ||
              role.includes("analyst")
            );
          }

          return false;
        });

  // ============================================
  // QUICK APPLY
  // ============================================

  const handleQuickApply = async (
    driveId
  ) => {
    try {
      const studentId =
        localStorage.getItem(
          "studentId"
        ) ||
        student?.studentId ||
        student?._id;

      if (!studentId) {
        setToastMessage(
          "Please login again."
        );
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/applications",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            studentId,
            driveId,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to apply"
        );
      }

      setAppliedDrives((prev) => [
        ...prev,
        driveId,
      ]);

      setDashboardCounts((prev) => ({
        ...prev,
        myApplications:
          prev.myApplications + 1,
      }));

      setToastMessage(
        data.message ||
          "Application submitted successfully!"
      );

      setTimeout(() => {
        setToastMessage("");
      }, 3000);
    } catch (error) {
      console.error(
        "QUICK APPLY ERROR:",
        error
      );

      setToastMessage(
        error.message ||
          "Unable to apply for this drive"
      );

      setTimeout(() => {
        setToastMessage("");
      }, 3000);
    }
  };

  // ============================================
  // CHECK COMPLETED DRIVE
  // ============================================

  const isDriveCompleted = (drive) => {
    if (!drive) return false;

    if (
      drive.driveStatus ===
      "Completed"
    ) {
      return true;
    }

    if (drive.last_date) {
      const today = new Date();

      today.setHours(0, 0, 0, 0);

      const parts =
        drive.last_date
          .split("-")
          .map(Number);

      if (parts.length === 3) {
        const [y, m, d] = parts;

        const lastDateObj =
          new Date(y, m - 1, d);

        lastDateObj.setHours(
          0,
          0,
          0,
          0
        );

        if (lastDateObj < today) {
          return true;
        }
      }
    }

    return false;
  };

  // ============================================
  // FORMAT DATE FOR SCHEDULE
  // ============================================

  const formatDriveDate = (date) => {
    if (!date) {
      return {
        month: "N/A",
        day: "--",
      };
    }

    const parsedDate =
      new Date(date);

    if (isNaN(parsedDate)) {
      return {
        month: "N/A",
        day: "--",
      };
    }

    return {
      month:
        parsedDate.toLocaleString(
          "en-US",
          { month: "short" }
        ),

      day: parsedDate.getDate(),
    };
  };

  // ============================================
  // RETURN UI
  // ============================================

  return (
    <div className="container-fluid p-0">

      {/* ======================================
          TOAST
      ====================================== */}

      {toastMessage && (
        <div
          className="position-fixed bottom-0 end-0 p-3"
          style={{
            zIndex: 1100,
          }}
        >
          <div className="toast show align-items-center text-white bg-success border-0 shadow-lg">
            <div className="d-flex">
              <div className="toast-body fw-semibold">
                {toastMessage}
              </div>

              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                onClick={() =>
                  setToastMessage("")
                }
              ></button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================
          HERO
      ====================================== */}

      <div className="dashboard-hero mb-4">

        <div className="row align-items-center g-3">

          <div className="col-12">

            <div className="d-flex align-items-center gap-3">

              <div className="hero-avatar-wrapper">
               <i className="bi bi-person-fill fs-1 me-6"></i>
              </div>

              <div>

                <div className="d-flex align-items-center gap-2 flex-wrap mb-1">

                  <h2 className="text-white mb-0 fw-bold fs-3">

                    Welcome back,{" "}

                    {student?.name ||
                      "Student"}! 👋

                  </h2>

                  <span className="badge bg-white text-primary rounded-pill px-3 py-1 fs-7 fw-semibold">

                    {student?.department ||
                      "Department"}

                  </span>

                </div>

                <div className="d-flex align-items-center gap-3 text-white-50 fs-7 mt-1 flex-wrap">

                  <span>

                    <i className="bi bi-building me-1"></i>

                    Department:

                    <strong className="text-white fw-semibold ms-1">

                      {student?.department ||
                        "N/A"}

                    </strong>

                  </span>

                  <span>•</span>

                  <span>

                    <i className="bi bi-card-heading me-1"></i>

                    Roll No:

                    <strong className="text-white fw-semibold ms-1">

                      {student?.roll ||
                        "N/A"}

                    </strong>

                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ======================================
          REAL KPI CARDS
      ====================================== */}

      <div className="row g-3 mb-4">

        {/* TOTAL COMPANIES */}

        <div className="col-12 col-sm-6 col-xl-3">

          <div className="stat-card-v2">

            <div className="d-flex align-items-center justify-content-between mb-3">

              <div>

                <span className="text-muted fw-medium fs-7 d-block">
                  Total Companies
                </span>

                <h3 className="fw-bold mb-0 mt-1">

                  {dashboardCounts.totalCompanies}

                </h3>

              </div>

              <div className="stat-icon-wrapper stat-icon-primary">

                <i className="bi bi-building"></i>

              </div>

            </div>

            <div className="border-top pt-2 mt-2">

              <Link
                to="/companies"
                className="text-primary text-decoration-none fs-8 fw-semibold"
              >
                Browse Companies
                <i className="bi bi-chevron-right ms-1"></i>
              </Link>

            </div>

          </div>

        </div>

        {/* UPCOMING DRIVES */}

        <div className="col-12 col-sm-6 col-xl-3">

          <div className="stat-card-v2">

            <div className="d-flex align-items-center justify-content-between mb-3">

              <div>

                <span className="text-muted fw-medium fs-7 d-block">
                  Upcoming Drives
                </span>

                <h3 className="fw-bold mb-0 mt-1">

                  {dashboardCounts.upcomingDrives}

                </h3>

              </div>

              <div className="stat-icon-wrapper stat-icon-success">

                <i className="bi bi-briefcase"></i>

              </div>

            </div>

            <div className="border-top pt-2 mt-2">

              <Link
                to="/companies"
                className="text-success text-decoration-none fs-8 fw-semibold"
              >
                View Drives
                <i className="bi bi-chevron-right ms-1"></i>
              </Link>

            </div>

          </div>

        </div>

        {/* MY APPLICATIONS */}

        <div className="col-12 col-sm-6 col-xl-3">

          <div className="stat-card-v2">

            <div className="d-flex align-items-center justify-content-between mb-3">

              <div>

                <span className="text-muted fw-medium fs-7 d-block">
                  My Applications
                </span>

                <h3 className="fw-bold mb-0 mt-1">

                  {loadingApplications
                    ? "..."
                    : dashboardCounts.myApplications}

                </h3>

              </div>

              <div className="stat-icon-wrapper stat-icon-info">

                <i className="bi bi-file-earmark-check"></i>

              </div>

            </div>

            <div className="border-top pt-2 mt-2">

              <Link
                to="/status"
                className="text-info text-decoration-none fs-8 fw-semibold"
              >
                Check Status
                <i className="bi bi-chevron-right ms-1"></i>
              </Link>

            </div>

          </div>

        </div>

        {/* SHORTLISTED */}

        <div className="col-12 col-sm-6 col-xl-3">

          <div className="stat-card-v2">

            <div className="d-flex align-items-center justify-content-between mb-3">

              <div>

                <span className="text-muted fw-medium fs-7 d-block">
                  Shortlisted
                </span>

                <h3 className="fw-bold mb-0 mt-1">

                  {loadingApplications
                    ? "..."
                    : dashboardCounts.shortlisted}

                </h3>

              </div>

              <div className="stat-icon-wrapper stat-icon-purple">

                <i className="bi bi-trophy"></i>

              </div>

            </div>

            <div className="border-top pt-2 mt-2">

              <Link
                to="/status"
                className="text-purple text-decoration-none fs-8 fw-semibold"
              >
                View Applications
                <i className="bi bi-chevron-right ms-1"></i>
              </Link>

            </div>

          </div>

        </div>

      </div>

      {/* ======================================
          MAIN CONTENT
      ====================================== */}

      <div className="row g-4">

        {/* ====================================
            PLACEMENT DRIVES
        ==================================== */}

        <div className="col-lg-8">

          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">

            <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">

              <div>

                <h4 className="fw-bold mb-1">

                  <i className="bi bi-stars text-warning me-2"></i>

                  Upcoming Placement Drives

                </h4>

                <p className="text-muted fs-7 mb-0">

                  Placement drives fetched from the database

                </p>

              </div>

              <div
                className="btn-group btn-group-sm"
                role="group"
              >

                <button
                  type="button"
                  className={`btn ${
                    driveCategory === "all"
                      ? "btn-primary"
                      : "btn-outline-secondary"
                  }`}
                  onClick={() =>
                    setDriveCategory("all")
                  }
                >
                  All Drives
                </button>

                <button
                  type="button"
                  className={`btn ${
                    driveCategory === "it"
                      ? "btn-primary"
                      : "btn-outline-secondary"
                  }`}
                  onClick={() =>
                    setDriveCategory("it")
                  }
                >
                  IT
                </button>

                <button
                  type="button"
                  className={`btn ${
                    driveCategory === "management"
                      ? "btn-primary"
                      : "btn-outline-secondary"
                  }`}
                  onClick={() =>
                    setDriveCategory(
                      "management"
                    )
                  }
                >
                  Management
                </button>

              </div>

            </div>

            <div className="row g-3">

              {loadingDrives ? (

                <div className="col-12 text-center py-5">

                  <div className="spinner-border text-primary"></div>

                  <p className="text-muted mt-2">
                    Loading upcoming drives...
                  </p>

                </div>

              ) : filteredDrives.length === 0 ? (

                <div className="col-12 text-center py-5">

                  <i className="bi bi-calendar-x fs-1 text-muted"></i>

                  <h5 className="mt-3">
                    No Upcoming Drives
                  </h5>

                  <p className="text-muted">
                    There are currently no upcoming placement drives.
                  </p>

                </div>

              ) : (

                filteredDrives.map((drive) => {

                  const isCompleted =
                    isDriveCompleted(
                      drive
                    );

                  const isApplied =
                    appliedDrives.includes(
                      drive._id
                    );

                  const match =
                    calculateDriveMatch(
                      student,
                      drive
                    );

                  const isFit =
                    match.isEligible &&
                    match.matchScore >=
                      50;

                  let applyBtnText =
                    "Quick Apply";

                  let applyBtnClass =
                    "btn-primary";

                  let applyBtnDisabled =
                    false;

                  if (isCompleted) {

                    applyBtnText =
                      "Completed";

                    applyBtnClass =
                      "btn-secondary text-white";

                    applyBtnDisabled =
                      true;

                  } else if (
                    isApplied
                  ) {

                    applyBtnText =
                      "Applied";

                    applyBtnClass =
                      "btn-success";

                    applyBtnDisabled =
                      true;

                  } else if (!isFit) {

                    applyBtnText =
                      "Not Eligible";

                    applyBtnClass =
                      "btn-outline-danger opacity-75";

                    applyBtnDisabled =
                      true;

                  }

                  return (

                    <div
                      key={drive._id}
                      className="col-12 col-md-6"
                    >

                      <div className="drive-card-v2 h-100 d-flex flex-column justify-content-between">

                        <div>

                          <div className="d-flex align-items-start justify-content-between mb-3">

                            <div className="d-flex align-items-center gap-3">

                              <div className="company-logo-badge shadow-sm">

                                {drive.company
                                  ?.substring(
                                    0,
                                    2
                                  )
                                  .toUpperCase()}

                              </div>

                              <div>

                                <h5 className="fw-bold mb-0 fs-6">
                                  {drive.company}
                                </h5>

                                <span className="text-muted fs-8">
                                  {drive.location}
                                </span>

                              </div>

                            </div>

                            <span className="ctc-badge">
                              {drive.package}
                            </span>

                          </div>

                          <div className="d-flex align-items-center justify-content-between mb-2">

                            <h6 className="fw-semibold text-dark mb-0 fs-7">
                              {drive.role}
                            </h6>

                            <span
                              className={`badge ${
                                isFit
                                  ? match.badgeColor
                                  : "bg-danger-subtle text-danger border border-danger-subtle"
                              } rounded-pill fs-8 px-2 py-1`}
                            >
                              {isFit
                                ? match.matchLabel
                                : "⚠️ Not Fit"}{" "}
                              ({match.matchScore}%)
                            </span>

                          </div>

                          <p className="text-muted fs-8 mb-3">
                            {drive.description}
                          </p>

                          <div className="d-flex flex-wrap gap-2 mb-3">

                            <span className="badge bg-light text-secondary border fs-8">

                              <i className="bi bi-mortarboard me-1"></i>

                              {drive.eligibility_criteria}

                            </span>

                            <span className="badge bg-light text-secondary border fs-8">

                              <i className="bi bi-calendar-event me-1"></i>

                              Apply by:{" "}
                              {drive.last_date}

                            </span>

                          </div>

                        </div>

                        <div className="d-flex align-items-center justify-content-between border-top pt-3 mt-2">

                          {isCompleted ? (

                            <span className="badge bg-secondary-subtle text-secondary rounded-pill px-3 py-1">
                              Completed
                            </span>

                          ) : (

                            <span className="badge bg-info-subtle text-info rounded-pill px-3 py-1">
                              {drive.driveStatus ||
                                "Upcoming"}
                            </span>

                          )}

                          <div className="d-flex gap-2">

                            <Link
                              to="/companies"
                              className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                            >
                              Details
                            </Link>

                            <button
                              type="button"
                              className={`btn btn-sm rounded-pill px-3 fw-semibold ${applyBtnClass}`}
                              onClick={() =>
                                handleQuickApply(
                                  drive._id
                                )
                              }
                              disabled={
                                applyBtnDisabled
                              }
                            >
                              {isApplied && (
                                <i className="bi bi-check-circle-fill me-1"></i>
                              )}

                              {applyBtnText}
                            </button>

                          </div>

                        </div>

                      </div>

                    </div>

                  );
                })
              )}

            </div>

          </div>

        </div>

        {/* ====================================
            UPCOMING SCHEDULE
        ==================================== */}

        <div className="col-lg-4">

          <div className="card border-0 shadow-sm rounded-4 p-4">

            <h5 className="fw-bold mb-3">

              <i className="bi bi-calendar3 text-primary me-2"></i>

              Upcoming Schedule

            </h5>

            {loadingDrives ? (

              <div className="text-center py-4">

                <div className="spinner-border spinner-border-sm text-primary"></div>

                <p className="text-muted fs-8 mt-2 mb-0">
                  Loading schedule...
                </p>

              </div>

            ) : upcomingDrives.length === 0 ? (

              <div className="text-center py-4">

                <i className="bi bi-calendar-x fs-2 text-muted"></i>

                <p className="text-muted fs-8 mt-2 mb-0">
                  No upcoming drives.
                </p>

              </div>

            ) : (

              <ul className="list-group list-group-flush border-0">

                {upcomingDrives
                  .slice(0, 5)
                  .map((drive) => {

                    const date =
                      formatDriveDate(
                        drive.drive_date
                      );

                    return (

                      <li
                        key={drive._id}
                        className="list-group-item px-0 py-2 border-0 d-flex align-items-center justify-content-between"
                      >

                        <div className="d-flex align-items-center gap-3">

                          <div
                            className="text-center rounded-3 bg-light px-2 py-1 text-primary fw-bold"
                            style={{
                              minWidth:
                                "48px",
                            }}
                          >

                            <small className="d-block text-uppercase fs-8 text-muted fw-semibold">

                              {date.month}

                            </small>

                            <span className="fs-5">

                              {date.day}

                            </span>

                          </div>

                          <div>

                            <h6 className="fw-semibold mb-0 fs-7">

                              {drive.company}

                            </h6>

                            <small className="text-muted fs-8">

                              {drive.role}

                              {drive.location
                                ? ` • ${drive.location}`
                                : ""}

                            </small>

                          </div>

                        </div>

                        <span className="badge bg-primary-subtle text-primary rounded-pill fs-8">

                          {drive.driveStatus ||
                            "Upcoming"}

                        </span>

                      </li>

                    );

                  })}

              </ul>

            )}

          </div>

        </div>

      </div>

    </div>
  );
}

export default Home;