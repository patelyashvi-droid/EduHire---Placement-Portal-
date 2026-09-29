import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Chart from "react-apexcharts";
import logo from "../assets/final.png";

const Dashboard = () => {
  const navigate = useNavigate();

  const [companies, setCompanies] = useState([]);
  const [students, setStudents] = useState([]);

  const [companyCount, setCompanyCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  const [showNotifications, setShowNotifications] = useState(false);

  const [loading, setLoading] = useState(true);

  // =====================================================
  // FETCH DASHBOARD DATA
  // =====================================================

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // ================= COMPANIES =================

      const companyResponse = await fetch(
        "http://localhost:5000/api/companies"
      );

      const companyData = await companyResponse.json();

      console.log("COMPANIES FROM API:", companyData);

      if (Array.isArray(companyData)) {
        setCompanies(companyData);
        setCompanyCount(companyData.length);
      } else {
        setCompanies([]);
        setCompanyCount(0);
      }

      // ================= STUDENTS =================

      const studentResponse = await fetch(
        "http://localhost:5000/api/students"
      );

      const studentData = await studentResponse.json();

      console.log("STUDENTS FROM API:", studentData);

      if (Array.isArray(studentData)) {
        setStudents(studentData);
        setStudentCount(studentData.length);

        const pendingStudents = studentData.filter(
          (student) =>
            student.registrationStatus === "Pending"
        );

        setPendingCount(pendingStudents.length);
      } else {
        setStudents([]);
        setStudentCount(0);
        setPendingCount(0);
      }
    } catch (error) {
      console.error(
        "DASHBOARD DATA FETCH ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // PENDING STUDENTS
  // =====================================================

  const pendingStudentList = students.filter(
    (student) =>
      student.registrationStatus === "Pending"
  );

  // =====================================================
  // COURSE COUNT
  // =====================================================

  const departmentList = [
    "MCA",
    "MBA",
    "M.Tech",
    "MSCIT",
  ];

  const departmentCounts = departmentList.map(
    (department) =>
      students.filter(
        (student) =>
          student.department === department
      ).length
  );

  const maxDeptCount = Math.max(...departmentCounts) || 0;

  // =====================================================
  // COURSE CHART
  // =====================================================

  const courseChartOptions = {
    chart: {
      type: "bar",
      toolbar: {
        show: false,
      },
    },

    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: "50%",
      },
    },

    colors: ["#696cff"],

    dataLabels: {
      enabled: false,
    },

    xaxis: {
      categories: departmentList,
    },

    yaxis: {
      title: {
        text: "Students",
      },
      min: 0,
      tickAmount: maxDeptCount < 4 ? (maxDeptCount === 0 ? 1 : maxDeptCount) : undefined,
      labels: {
        formatter: function (value) {
          return Math.round(value);
        },
      },
    },

    grid: {
      borderColor: "#eeeeee",
    },

    tooltip: {
      y: {
        formatter: function (value) {
          return value + " Students";
        },
      },
    },
  };

  const courseChartSeries = [
    {
      name: "Students",
      data: departmentCounts,
    },
  ];

  // =====================================================
  // REGISTRATION STATUS
  // =====================================================

  const approvedStudents = students.filter(
    (student) =>
      student.registrationStatus === "Approved"
  ).length;

  const pendingStudents = students.filter(
    (student) =>
      student.registrationStatus === "Pending"
  ).length;

  const rejectedStudents = students.filter(
    (student) =>
      student.registrationStatus === "Rejected"
  ).length;

  const placementChartOptions = {
    chart: {
      type: "donut",
    },

    labels: [
      "Approved",
      "Pending",
      "Rejected",
    ],

    colors: [
      "#198754",
      "#ffc107",
      "#dc3545",
    ],

    legend: {
      position: "bottom",
    },

    dataLabels: {
      enabled: true,
    },
  };

  const placementChartSeries = [
    approvedStudents,
    pendingStudents,
    rejectedStudents,
  ];

  // =====================================================
  // OPEN STUDENT MANAGEMENT
  // =====================================================

  const openStudentManagement = () => {
    setShowNotifications(false);

    navigate("/Admin/StudentManagement");
  };

  // =====================================================
  // RETURN
  // =====================================================

  return (
    <div className="container-xxl flex-grow-1 container-p-y">

          {/* HEADING */}

          <div className="mb-4">

            <h2 className="fw-bold mb-1">
              Admin Dashboard
            </h2>

            <p className="text-muted mb-0">
              Welcome to Placement Portal Admin Panel
            </p>

          </div>

          {/* =================================================
              PENDING ALERT
          ================================================= */}

          {pendingCount > 0 && (

            <div className="alert alert-warning d-flex align-items-center mb-4">

              <i className="bi bi-bell-fill fs-5 me-3"></i>

              <div>

                <strong>
                  New Registration Pending
                </strong>

                <div className="small">
                  {pendingCount} student
                  {pendingCount > 1
                    ? "s are"
                    : " is"}{" "}
                  waiting for admin approval.
                </div>

              </div>

            </div>

          )}

          {/* =================================================
              STATISTICS
          ================================================= */}

          <div className="row g-4">

            {/* TOTAL STUDENTS */}

            <div className="col-xl-3 col-md-6">

              <div className="card border-0 shadow-sm h-100">

                <div className="card-body">

                  <div className="d-flex justify-content-between align-items-center">

                    <div>

                      <h6 className="text-muted mb-2">
                        Total Students
                      </h6>

                      <h2 className="fw-bold mb-0">
                        {loading
                          ? "..."
                          : studentCount}
                      </h2>

                    </div>

                    {/* <div className="bg-primary bg-opacity-10 text-primary rounded-3 p-3">

                      <i className="bi bi-people fs-3"></i>

                    </div> */}

                  </div>

                </div>

              </div>

            </div>

            {/* COMPANIES */}

            <div className="col-xl-3 col-md-6">

              <div className="card border-0 shadow-sm h-100">

                <div className="card-body">

                  <div className="d-flex justify-content-between align-items-center">

                    <div>

                      <h6 className="text-muted mb-2">
                        Companies
                      </h6>

                      <h2 className="fw-bold mb-0">
                        {loading
                          ? "..."
                          : companyCount}
                      </h2>

                    </div>

                    {/* <div className="bg-success bg-opacity-10 text-success rounded-3 p-3">

                      <i className="bi bi-building fs-3"></i>

                    </div> */}

                  </div>

                </div>

              </div>

            </div>

            {/* APPROVED */}

            <div className="col-xl-3 col-md-6">

              <div className="card border-0 shadow-sm h-100">

                <div className="card-body">

                  <div className="d-flex justify-content-between align-items-center">

                    <div>

                      <h6 className="text-muted mb-2">
                        Approved Students
                      </h6>

                      <h2 className="fw-bold mb-0">
                        {loading
                          ? "..."
                          : approvedStudents}
                      </h2>

                    </div>

                    {/* <div className="bg-info bg-opacity-10 text-info rounded-3 p-3">

                      <i className="bi bi-person-check fs-3"></i>

                    </div> */}

                  </div>

                </div>

              </div>

            </div>

            {/* PENDING */}

            <div className="col-xl-3 col-md-6">

              <div className="card border-0 shadow-sm h-100">

                <div className="card-body">

                  <div className="d-flex justify-content-between align-items-center">

                    <div>

                      <h6 className="text-muted mb-2">
                        Pending Applications
                      </h6>

                      <h2 className="fw-bold mb-0">
                        {loading
                          ? "..."
                          : pendingCount}
                      </h2>

                    </div>

                    {/* <div className="bg-warning bg-opacity-10 text-warning rounded-3 p-3">

                      <i className="bi bi-hourglass-split fs-3"></i>

                    </div> */}

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              CHARTS
          ================================================= */}

          <div className="row g-4 mt-1">

            {/* COURSE */}

            <div className="col-lg-8">

              <div className="card border-0 shadow-sm h-100">

                <div className="card-body">

                  <h5 className="fw-bold mb-1">
                    Course-wise Students
                  </h5>

                  <p className="text-muted mb-3">
                    Number of students enrolled in each course
                  </p>

                  <Chart
                    options={courseChartOptions}
                    series={courseChartSeries}
                    type="bar"
                    height={350}
                  />

                </div>

              </div>

            </div>

            {/* STATUS */}

            <div className="col-lg-4">

              <div className="card border-0 shadow-sm h-100">

                <div className="card-body">

                  <h5 className="fw-bold mb-1">
                    Registration Status
                  </h5>

                  <p className="text-muted mb-2">
                    Student registration overview
                  </p>

                  {studentCount > 0 ? (

                    <Chart
                      options={
                        placementChartOptions
                      }
                      series={
                        placementChartSeries
                      }
                      type="donut"
                      height={320}
                    />

                  ) : (

                    <div className="text-center text-muted py-5">

                      <i className="bi bi-pie-chart fs-1"></i>

                      <p className="mt-3">
                        No student data available
                      </p>

                    </div>

                  )}

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              RECENT COMPANIES
          ================================================= */}

          <div className="card border-0 shadow-sm mt-4">

            <div className="card-body">

              <div className="d-flex justify-content-between align-items-center mb-3">

                <div>

                  <h5 className="fw-bold mb-1">
                    Recent Companies
                  </h5>

                  <p className="text-muted mb-0">
                    Companies added to the placement portal
                  </p>

                </div>

                <span className="badge bg-primary">
                  {companyCount} Total
                </span>

              </div>

              {companies.length > 0 ? (

                <div className="table-responsive">

                  <table className="table table-hover align-middle">

                    <thead>

                      <tr>

                        <th>#</th>
                        <th>Company</th>
                        <th>Email</th>
                        <th>Location</th>

                      </tr>

                    </thead>

                    <tbody>

                      {companies
                        .slice(0, 5)
                        .map(
                          (company, index) => (

                            <tr
                              key={
                                company._id ||
                                index
                              }
                            >

                              <td>
                                {index + 1}
                              </td>

                              <td className="fw-semibold">
                                {company.name ||
                                  company.companyName ||
                                  "N/A"}
                              </td>

                              <td>
                                {company.email ||
                                  "N/A"}
                              </td>

                              <td>
                                {company.location ||
                                  company.address ||
                                  "N/A"}
                              </td>

                            </tr>

                          )
                        )}

                    </tbody>

                  </table>

                </div>

              ) : (

                <div className="text-center text-muted py-4">

                  <i className="bi bi-building fs-1"></i>

                  <p className="mt-2 mb-0">
                    No companies found.
                  </p>

                </div>

              )}

            </div>

          </div>

          {/* FOOTER */}

          <div className="text-center text-muted mt-4 mb-2">

            <small>
              © 2026 Placement Portal Admin Panel
            </small>

          </div>

    </div>
  );
};

export default Dashboard;