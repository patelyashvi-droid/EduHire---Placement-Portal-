import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";

export default function ExcelReport() {
  const [companies, setCompanies] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("All Companies");
  const [loading, setLoading] = useState(true);

  // Fetch Companies & Applications from Backend Database
  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch companies master list
      const compRes = await fetch("http://localhost:5000/api/companies");
      let compList = [];
      if (compRes.ok) {
        const compData = await compRes.json();
        if (Array.isArray(compData)) {
          compList = compData.map((c) => c.name || c.companyName).filter(Boolean);
        }
      }

      // Fetch applications list
      const appRes = await fetch("http://localhost:5000/api/applications");
      let appList = [];
      if (appRes.ok) {
        appList = await appRes.json();
        if (Array.isArray(appList)) {
          setApplications(appList);
          const appCompNames = appList.map((a) => a.companyName).filter(Boolean);
          compList = Array.from(new Set([...compList, ...appCompNames]));
        }
      }

      const finalCompanyList = ["All Companies", ...compList];
      setCompanies(finalCompanyList);
      if (finalCompanyList.length > 0) {
        setSelectedCompany(finalCompanyList[0]);
      }
    } catch (err) {
      console.error("Error fetching Excel report data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter applications by selected company
  const filteredStudents = applications.filter((app) => {
    if (selectedCompany === "All Companies") return true;
    return (app.companyName || "").trim().toLowerCase() === selectedCompany.trim().toLowerCase();
  });

  // Generate and download Excel Report (.xlsx)
  const generateExcel = async () => {
    if (filteredStudents.length === 0) {
      alert("No student data available to export for the selected company.");
      return;
    }

    const reportData = filteredStudents.map((app, index) => ({
      No: index + 1,
      "Student Name": app.studentName || "N/A",
      "Student Email": app.studentEmail || "N/A",
      Department: app.department || "N/A",
      Company: app.companyName || selectedCompany,
      "Application Status": app.status || app.applicationStatus || "Applied",
    }));

    const worksheet = XLSX.utils.json_to_sheet(reportData);

    // Auto-width adjustment for columns
    const max_cols = [
      { wch: 6 },
      { wch: 25 },
      { wch: 30 },
      { wch: 20 },
      { wch: 25 },
      { wch: 20 },
    ];
    worksheet["!cols"] = max_cols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Student Applications");

    const sanitizedFileName = (selectedCompany || "Placement").replace(/[^a-zA-Z0-9_-]/g, "_");
    XLSX.writeFile(workbook, `${sanitizedFileName}_Student_Report.xlsx`);

    // Calculate metrics for database report entry
    const total_applications = filteredStudents.length;
    const selected = filteredStudents.filter((s) => s.status === "Selected" || s.status === "Placed" || s.applicationStatus === "Selected" || s.applicationStatus === "Placed").length;
    const shortlisted = filteredStudents.filter((s) => s.status === "Shortlisted" || s.applicationStatus === "Shortlisted").length;
    const rejected = filteredStudents.filter((s) => s.status === "Rejected" || s.applicationStatus === "Rejected").length;

    const reportId = "REP" + Date.now() + Math.floor(Math.random() * 1000);
    const driveId = selectedCompany === "All Companies" ? "ALL" : (filteredStudents[0]?.driveId || "N/A");

    try {
      const response = await fetch("http://localhost:5000/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportId,
          driveId,
          total_applications,
          selected,
          rejected,
          shortlisted,
          report_generated_on: new Date().toISOString()
        })
      });

      if (response.ok) {
        console.log("Report saved to database successfully.");
      } else {
        console.error("Failed to save report to database.");
      }
    } catch (err) {
      console.error("Error saving report to database:", err);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Selected":
        return "bg-success text-white";
      case "Shortlisted":
        return "bg-info text-white";
      case "Applied":
        return "bg-warning text-dark";
      case "Rejected":
        return "bg-danger text-white";
      default:
        return "bg-secondary text-white";
    }
  };

  return (
    <div className="container-xxl flex-grow-1 container-p-y">
      {/* Heading */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Company Excel Placement Report</h4>
          <p className="text-muted mb-0">Generate company-wise student placement reports from live database</p>
        </div>
      </div>

      {/* Control Card */}
      <div className="card border-0 shadow-sm mb-4 rounded-4">
        <div className="card-body p-4">
          <h5 className="fw-bold mb-3">Generate Company Report</h5>

          <div className="row align-items-end g-3">
            {/* Select Company Dropdown */}
            <div className="col-md-6">
              <label className="form-label fw-semibold text-secondary">Select Company</label>
              <select
                className="form-select form-select-lg fw-semibold"
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
              >
                {companies.map((company) => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </select>
            </div>

            {/* Generate Excel Button */}
            <div className="col-md-6">
              <button
                type="button"
                className="btn btn-success btn-lg fw-bold px-4"
                onClick={generateExcel}
                disabled={loading || filteredStudents.length === 0}
              >
                <i className="bx bx-spreadsheet me-2 fs-5"></i>
                Generate Excel Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row g-4 mb-4">
        {/* Selected Company Card */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body d-flex align-items-center">
              <div className="bg-primary bg-opacity-10 text-primary rounded-3 p-3 me-3 d-flex align-items-center justify-content-center" style={{ width: "56px", height: "56px" }}>
                <i className="bx bx-buildings fs-2"></i>
              </div>
              <div>
                <h6 className="text-muted mb-1">Selected Company</h6>
                <h5 className="fw-bold mb-0 text-primary">{selectedCompany}</h5>
              </div>
            </div>
          </div>
        </div>

        {/* Total Applicants Card */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body d-flex align-items-center">
              <div className="bg-info bg-opacity-10 text-info rounded-3 p-3 me-3 d-flex align-items-center justify-content-center" style={{ width: "56px", height: "56px" }}>
                <i className="bx bx-group fs-2"></i>
              </div>
              <div>
                <h6 className="text-muted mb-1">Total Applicants</h6>
                <h5 className="fw-bold mb-0 text-info">{filteredStudents.length}</h5>
              </div>
            </div>
          </div>
        </div>

        {/* Selected / Placed Card */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body d-flex align-items-center">
              <div className="bg-success bg-opacity-10 text-success rounded-3 p-3 me-3 d-flex align-items-center justify-content-center" style={{ width: "56px", height: "56px" }}>
                <i className="bx bx-user-check fs-2"></i>
              </div>
              <div>
                <h6 className="text-muted mb-1">Selected / Placed</h6>
                <h5 className="fw-bold mb-0 text-success">
                  {filteredStudents.filter((s) => s.status === "Selected" || s.status === "Placed").length}
                </h5>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Student List Table Card */}
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
          <div>
            <h5 className="fw-bold mb-1">{selectedCompany} - Student List</h5>
            <small className="text-muted">Student applicants registered for {selectedCompany}</small>
          </div>
          <span className="badge bg-primary px-3 py-2 fs-7">{filteredStudents.length} Students</span>
        </div>

        <div className="table-responsive text-nowrap">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-2 text-muted">Loading company student report...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-inbox fs-1"></i>
              <h5 className="mt-2">No Student Applications Found</h5>
              <p className="fs-7 mb-0">No applicant records match the selected company.</p>
            </div>
          ) : (
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: "60px" }}>#</th>
                  <th>Student Name</th>
                  <th>Student Email</th>
                  <th>Department</th>
                  <th>Company</th>
                  <th>Application Status</th>
                </tr>
              </thead>
              <tbody className="table-border-bottom-0">
                {filteredStudents.map((student, index) => (
                  <tr key={student._id || student.applicationId || index}>
                    <td>
                      <span className="fw-semibold text-secondary">{index + 1}</span>
                    </td>
                    <td>
                      <strong className="text-dark">{student.studentName}</strong>
                    </td>
                    <td>
                      <span className="text-body">{student.studentEmail}</span>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border px-2.5 py-1">
                        {student.department || "N/A"}
                      </span>
                    </td>
                    <td>
                      <strong className="text-primary">{student.companyName || selectedCompany}</strong>
                    </td>
                    <td>
                      <span className={`badge rounded-pill px-3 py-1.5 ${getStatusBadgeClass(student.status || student.applicationStatus)}`}>
                        {student.status || student.applicationStatus || "Applied"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
