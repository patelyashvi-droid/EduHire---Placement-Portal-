//import React from "react";

// import avatar1 from "../assets/images/avatar/wipro.png";
// import avatar2 from "../assets/images/avatar/nintech.png";
// import avatar3 from "../assets/images/avatar/hcl.png";
// import avatar4 from "../assets/images/avatar/techmahindra.png";
// import avatar5 from "../assets/images/avatar/ksolve.png";

import { useEffect, useState } from "react";
import {Link } from "react-router-dom";

function ApplyCompany() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    // ============================================
    // FETCH LOGGED-IN STUDENT'S APPLICATIONS
    // ============================================

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                setLoading(true);
                setError("");

                // Get logged-in student information
                const savedStudent =
                    localStorage.getItem("student") ||
                    localStorage.getItem("studentData");

                let student = null;

                if (savedStudent) {
                    try {
                        student = JSON.parse(savedStudent);
                    } catch (err) {
                        console.error(
                            "Unable to parse saved student:",
                            err
                        );
                    }
                }

                // Try all the keys your project may be using
                const studentId =
                    localStorage.getItem("studentId") ||
                    student?.studentId ||
                    student?.id ||
                    student?._id ||
                    localStorage.getItem("emailId") ||
                    student?.email;

                if (!studentId) {
                    setError(
                        "Student information not found. Please login again."
                    );
                    setLoading(false);
                    return;
                }

                console.log(
                    "Fetching applications for student:",
                    studentId
                );

                const response = await fetch(
                    `http://localhost:5000/api/applications/student/${encodeURIComponent(
                        studentId
                    )}`
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                            "Unable to fetch applications"
                    );
                }

                console.log(
                    "Student applications:",
                    data
                );

                setApplications(
                    Array.isArray(data) ? data : []
                );
            } catch (err) {
                console.error(
                    "FETCH APPLICATIONS ERROR:",
                    err
                );

                setError(
                    err.message ||
                        "Unable to fetch your applications."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, []);

    // ============================================
    // STATUS CLASS
    // ============================================

    const getStatusClass = (status) => {
        switch (status) {
            case "Applied":
                return "badge text-bg-primary";

            case "Shortlisted":
                return "badge text-bg-success";

            case "Selected":
                return "badge text-bg-success";

            case "Rejected":
                return "badge text-bg-danger";

            case "Pending":
                return "badge text-bg-warning";

            default:
                return "badge text-bg-secondary";
        }
    };

    // ============================================
    // SUMMARY COUNTS
    // ============================================

    const totalApplications = applications.length;

    const appliedCount = applications.filter(
        (application) =>
            application.status === "Applied"
    ).length;

    const shortlistedCount = applications.filter(
        (application) =>
            application.status === "Shortlisted"
    ).length;

    const selectedCount = applications.filter(
        (application) =>
            application.status === "Selected"
    ).length;

    // ============================================
    // SEARCH
    // ============================================

    const filteredApplications =
        applications.filter((application) => {
            const search =
                searchQuery.toLowerCase();

            return (
                application.companyName
                    ?.toLowerCase()
                    .includes(search) ||
                application.role
                    ?.toLowerCase()
                    .includes(search) ||
                application.status
                    ?.toLowerCase()
                    .includes(search)
            );
        });

    // ============================================
    // FORMAT DATE
    // ============================================

    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

        try {
            return new Date(date).toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                }
            );
        } catch (error) {
            return date;
        }
    };

    // ============================================
    // UI
    // ============================================

    return (
        <main className="dashboard-content">

            <div className="container-fluid px-3 px-lg-4 py-4">

                {/* =========================================
                    PAGE HEADING
                ========================================= */}

                <div className="page-heading">

                    <div className="page-heading-copy">

                        <span className="page-icon">

                            <i
                                className="bi bi-people"
                                aria-hidden="true"
                            ></i>

                        </span>

                        <div>

                            <p className="eyebrow mb-1">
                                Placement
                            </p>

                            <h1 className="h3 mb-1">
                                Applied Company
                            </h1>

                            <p className="text-muted mb-0">
                                View the companies you have
                                applied to and track your
                                application status.
                            </p>

                        </div>

                    </div>

                </div>


                {/* =========================================
                    SUMMARY CARDS
                ========================================= */}

                <section
                    className="row g-3 mt-1"
                    aria-label="Application summary"
                >

                    {/* Total Applications */}

                    <div className="col-12 col-sm-6 col-xl-3">

                        <article className="metric-card metric-primary">

                            <div className="metric-top">

                                <span className="metric-label">
                                    Total Applications
                                </span>

                                <span className="metric-icon">

                                    <i
                                        className="bi bi-briefcase"
                                        aria-hidden="true"
                                    ></i>

                                </span>

                            </div>

                            <div className="metric-value">
                                {totalApplications}
                            </div>

                            <div className="metric-meta">

                                <span>
                                    companies applied
                                </span>

                            </div>

                        </article>

                    </div>


                    {/* Applied */}

                    <div className="col-12 col-sm-6 col-xl-3">

                        <article className="metric-card metric-success">

                            <div className="metric-top">

                                <span className="metric-label">
                                    Applied
                                </span>

                                <span className="metric-icon">

                                    <i
                                        className="bi bi-send"
                                        aria-hidden="true"
                                    ></i>

                                </span>

                            </div>

                            <div className="metric-value">
                                {appliedCount}
                            </div>

                            <div className="metric-meta">

                                <span>
                                    applications submitted
                                </span>

                            </div>

                        </article>

                    </div>


                    {/* Shortlisted */}

                    <div className="col-12 col-sm-6 col-xl-3">

                        <article className="metric-card metric-warning">

                            <div className="metric-top">

                                <span className="metric-label">
                                    Shortlisted
                                </span>

                                <span className="metric-icon">

                                    <i
                                        className="bi bi-star"
                                        aria-hidden="true"
                                    ></i>

                                </span>

                            </div>

                            <div className="metric-value">
                                {shortlistedCount}
                            </div>

                            <div className="metric-meta">

                                <span>
                                    applications shortlisted
                                </span>

                            </div>

                        </article>

                    </div>


                    {/* Selected */}

                    <div className="col-12 col-sm-6 col-xl-3">

                        <article className="metric-card metric-danger">

                            <div className="metric-top">

                                <span className="metric-label">
                                    Selected
                                </span>

                                <span className="metric-icon">

                                    <i
                                        className="bi bi-check-circle"
                                        aria-hidden="true"
                                    ></i>

                                </span>

                            </div>

                            <div className="metric-value">
                                {selectedCount}
                            </div>

                            <div className="metric-meta">

                                <span>
                                    selected applications
                                </span>

                            </div>

                        </article>

                    </div>

                </section>


                {/* =========================================
                    APPLICATION TABLE
                ========================================= */}

                <section className="panel mt-3">

                    <div className="panel-header">

                        <div>

                            <h2 className="h5 mb-1 section-title">

                                <i
                                    className="bi bi-table"
                                    aria-hidden="true"
                                ></i>

                                <span>
                                    My Applied Companies
                                </span>

                            </h2>

                            <p className="text-muted mb-0">
                                Companies where you have
                                submitted an application.
                            </p>

                        </div>


                        {/* Search */}

                        <div className="d-flex flex-wrap gap-2">

                            <input
                                className="form-control form-control-sm table-search"
                                type="search"
                                placeholder="Search companies"
                                aria-label="Search companies"
                                value={searchQuery}
                                onChange={(e) =>
                                    setSearchQuery(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                    </div>


                    {/* =====================================
                        TABLE
                    ===================================== */}

                    <div className="table-responsive">

                        <table
                            className="table align-middle mb-0"
                            id="applicationsTable"
                        >

                            <thead>

                                <tr>

                                    <th scope="col">
                                        Company
                                    </th>

                                    <th scope="col">
                                        Role
                                    </th>

                                    <th scope="col">
                                        Status
                                    </th>

                                    <th scope="col">
                                        Applied
                                    </th>

                                    <th
                                        scope="col"
                                        className="text-end"
                                    >
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {/* LOADING */}

                                {loading && (

                                    <tr>

                                        <td
                                            colSpan="5"
                                            className="text-center py-5"
                                        >

                                            <div
                                                className="spinner-border text-primary"
                                                role="status"
                                            >
                                                <span className="visually-hidden">
                                                    Loading...
                                                </span>
                                            </div>

                                            <p className="text-muted mt-3 mb-0">
                                                Loading your applications...
                                            </p>

                                        </td>

                                    </tr>

                                )}


                                {/* ERROR */}

                                {!loading && error && (

                                    <tr>

                                        <td
                                            colSpan="5"
                                            className="text-center py-5"
                                        >

                                            <i
                                                className="bi bi-exclamation-circle text-danger"
                                                style={{
                                                    fontSize:
                                                        "2rem",
                                                }}
                                            ></i>

                                            <p className="text-danger mt-3 mb-0">
                                                {error}
                                            </p>

                                        </td>

                                    </tr>

                                )}


                                {/* NO APPLICATIONS */}

                                {!loading &&
                                    !error &&
                                    filteredApplications.length ===
                                        0 && (

                                        <tr>

                                            <td
                                                colSpan="5"
                                                className="text-center py-5"
                                            >

                                                <i
                                                    className="bi bi-building-exclamation"
                                                    style={{
                                                        fontSize:
                                                            "2.5rem",
                                                        color:
                                                            "#94a3b8",
                                                    }}
                                                ></i>

                                                <h5 className="mt-3">
                                                    No Applied Companies
                                                </h5>

                                                <p className="text-muted mb-0">

                                                    {searchQuery
                                                        ? "No applications match your search."
                                                        : "You have not applied to any companies yet."}

                                                </p>

                                            </td>

                                        </tr>

                                    )}


                                {/* APPLICATIONS */}

                                {!loading &&
                                    !error &&
                                    filteredApplications.map(
                                        (application) => (

                                            <tr
                                                key={
                                                    application._id ||
                                                    application.applicationId
                                                }
                                            >

                                                {/* COMPANY */}

                                                <td>

                                                    <div className="d-flex align-items-center gap-2">

                                                        <div
                                                            className="rounded-circle d-flex align-items-center justify-content-center"
                                                            style={{
                                                                width:
                                                                    "40px",
                                                                height:
                                                                    "40px",
                                                                backgroundColor:
                                                                    "#eef2ff",
                                                            }}
                                                        >

                                                            <i
                                                                className="bi bi-building"
                                                                style={{
                                                                    color:
                                                                        "#2563eb",
                                                                }}
                                                            ></i>

                                                        </div>

                                                        <div>

                                                            <p className="fw-semibold mb-0">
                                                                {
                                                                    application.companyName
                                                                }
                                                            </p>

                                                            <p className="text-muted small mb-0">

                                                                {application.studentEmail ||
                                                                    ""}

                                                            </p>

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* ROLE */}

                                                <td>

                                                    {application.role ||
                                                        "-"}

                                                </td>


                                                {/* STATUS */}

                                                <td>

                                                    <span
                                                        className={getStatusClass(
                                                            application.status ||
                                                                application.applicationStatus
                                                        )}
                                                    >

                                                        {application.status ||
                                                            application.applicationStatus ||
                                                            "Applied"}

                                                    </span>

                                                </td>


                                                {/* APPLIED DATE */}

                                                <td>

                                                    {formatDate(
                                                        application.appliedDate ||
                                                            application.appliedAt
                                                    )}

                                                </td>


                                                {/* ACTION */}

                                                <td className="text-end">

                                                   <Link to="/status">

                                                        <i
                                                            className="bi bi-eye"
                                                            aria-hidden="true"
                                                        ></i>{" "}

                                                        View

                                                    </Link>

                                                </td>

                                            </tr>

                                        )
                                    )}

                            </tbody>

                        </table>

                    </div>


                    {/* =====================================
                        FOOTER
                    ===================================== */}

                    <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mt-3">

                        <p className="text-muted small mb-0">

                            Showing{" "}
                            {filteredApplications.length}{" "}
                            of{" "}
                            {applications.length}{" "}
                            applications

                        </p>

                    </div>

                </section>

            </div>

        </main>
    );
}

export default ApplyCompany;
