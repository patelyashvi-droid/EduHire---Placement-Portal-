import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function CreateProfile() {

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {

    const fetchStudentProfile = async () => {

      try {

        // Get logged-in student from localStorage
        const storedStudent = localStorage.getItem("student");
        const emailId = localStorage.getItem("emailId");
        const studentId = localStorage.getItem("studentId");
        const mongoId = localStorage.getItem("id");

        let loggedInStudent = null;
        let targetId = null;

        if (storedStudent) {
          try {
            loggedInStudent = JSON.parse(storedStudent);
            if (loggedInStudent) {
              setStudent(loggedInStudent);
              targetId = loggedInStudent.studentId || loggedInStudent.id || loggedInStudent._id || loggedInStudent.email;
            }
          } catch (e) {
            console.error("Error parsing student from localStorage:", e);
          }
        }

        if (!targetId) {
          targetId = studentId || emailId || mongoId;
        }

        console.log("PROFILE FETCH TARGET ID:", targetId);

        if (!targetId) {
          if (!loggedInStudent) {
            setError("Student login information not found. Please log in again.");
          }
          setLoading(false);
          return;
        }

        // Fetch complete student profile
        const response = await fetch(
          `http://localhost:5000/api/students/${encodeURIComponent(targetId)}`
        );

        const result = await response.json();

        console.log("Profile response:", result);

        if (!response.ok) {
          if (loggedInStudent) {
            setStudent(loggedInStudent);
          } else {
            setError(result.message || "Unable to fetch student profile.");
          }
          setLoading(false);
          return;
        }

        // The API returns the student object directly, or { student: ... }
        const studentData = (result && result.student) ? result.student : result;

        if (studentData && (studentData.name || studentData._id || studentData.email)) {
          setStudent(studentData);
          localStorage.setItem("studentData", JSON.stringify(studentData));
          localStorage.setItem("student", JSON.stringify(studentData));
        } else if (loggedInStudent) {
          setStudent(loggedInStudent);
        } else {
          setError("Student profile data not found.");
        }

      } catch (error) {

        console.error("Profile fetch error:", error);

        const savedData = localStorage.getItem("studentData") || localStorage.getItem("student");
        if (savedData) {
          try {
            setStudent(JSON.parse(savedData));
          } catch (e) {
            setError("Unable to connect to server.");
          }
        } else {
          setError("Unable to connect to server.");
        }

      } finally {

        setLoading(false);

      }

    };

    fetchStudentProfile();

  }, []);

if (loading) {

  return (
    <div className="container py-5">

      <div className="text-center">

        <div
          className="spinner-border text-primary"
          role="status"
        ></div>

        <p className="mt-3 text-muted">
          Loading your profile...
        </p>

      </div>

    </div>
  );

}
 

  if (!student) {
    return (
      <div className="container py-5">

        <div className="alert alert-warning text-center">
          {error || "Student profile data not found."}
        </div>

        <div className="text-center mt-3">

          <Link
            to="/Dashboard"
            className="btn btn-primary"
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back to Dashboard
          </Link>

        </div>

      </div>
    );
  }

  return (
    <div className="container py-4">

      {/* Page Heading */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <h2 className="fw-bold">
            My Profile
          </h2>

          <p className="text-muted mb-0">
            View your personal, academic and document details.
          </p>

        </div>

      </div>


      {/* Profile Card */}

      <div className="card shadow-sm border-0 rounded-4 mb-4">

        <div className="card-body p-4">

          {/* Profile Header */}

          <div className="d-flex align-items-center mb-4">

            <div
              className="bg-primary text-white rounded-circle d-flex justify-content-center align-items-center me-3"
              style={{
                width: "70px",
                height: "70px",
                fontSize: "30px",
              }}
            >

              <i className="bi bi-person"></i>

            </div>


            <div>

              <h4 className="mb-1 fw-bold">
                {student.name}
              </h4>

              <p className="text-muted mb-0">
                Roll No: {student.roll}
              </p>

            </div>

          </div>


          {/* Personal Information */}

          <h5 className="fw-semibold mb-3">
            Personal Information
          </h5>


          <div className="border rounded-3">

            {/* Full Name */}

            <div className="row py-3 px-3 border-bottom">

              <div className="col-md-4 text-muted">
                Full Name
              </div>

              <div className="col-md-8 fw-semibold">
                {student.name}
              </div>

            </div>


            {/* Roll Number */}

            <div className="row py-3 px-3 border-bottom">

              <div className="col-md-4 text-muted">
                Roll Number
              </div>

              <div className="col-md-8 fw-semibold">
                {student.roll}
              </div>

            </div>


            {/* Email */}

            <div className="row py-3 px-3 border-bottom">

              <div className="col-md-4 text-muted">
                Email Address
              </div>

              <div className="col-md-8 fw-semibold">
                {student.email}
              </div>

            </div>


            {/* DOB */}

            <div className="row py-3 px-3 border-bottom">

              <div className="col-md-4 text-muted">
                Date of Birth
              </div>

              <div className="col-md-8 fw-semibold">
                {student.dob}
              </div>

            </div>


            {/* Mobile */}

            <div className="row py-3 px-3 border-bottom">

              <div className="col-md-4 text-muted">
                Mobile Number
              </div>

              <div className="col-md-8 fw-semibold">
                {student.mobile}
              </div>

            </div>


            {/* Address */}

            <div className="row py-3 px-3">

              <div className="col-md-4 text-muted">
                Address
              </div>

              <div className="col-md-8 fw-semibold">
                {student.address}
              </div>

            </div>

          </div>

        </div>

      </div>


      {/* Academic Information */}

      <div className="card shadow-sm border-0 rounded-4 mb-4">

        <div className="card-body p-4">

          <h5 className="fw-semibold mb-3">
            Academic Information
          </h5>


          <div className="border rounded-3">

            {/* 10th */}

            <div className="row py-3 px-3 border-bottom">

              <div className="col-md-6 text-muted">
                10th Marks
              </div>

              <div className="col-md-6 fw-semibold">
                {student.mark10}%
              </div>

            </div>


            {/* 12th */}

            <div className="row py-3 px-3 border-bottom">

              <div className="col-md-6 text-muted">
                12th Marks
              </div>

              <div className="col-md-6 fw-semibold">
                {student.mark12}%
              </div>

            </div>


            {/* Bachelor */}

            <div className="row py-3 px-3 border-bottom">

              <div className="col-md-6 text-muted">
                Bachelor CGPA
              </div>

              <div className="col-md-6 fw-semibold">
                {student.bachelorCgpa}
              </div>

            </div>


            {/* Master */}

            <div className="row py-3 px-3 border-bottom">

              <div className="col-md-6 text-muted">
                Master CGPA
              </div>

              <div className="col-md-6 fw-semibold">
                {student.masterCgpa}
              </div>

            </div>


            {/* Backlogs */}

            <div className="row py-3 px-3 border-bottom">

              <div className="col-md-6 text-muted">
                Number of Backlogs
              </div>

              <div className="col-md-6 fw-semibold">
                {student.backlog ?? 0}
              </div>

            </div>


            {/* Skill */}

            <div className="row py-3 px-3">

              <div className="col-md-6 text-muted">
                Technical Skill
              </div>

              <div className="col-md-6 fw-semibold">
                <span className="badge bg-primary fs-6">
                  {student.skill || "Not Specified"}
                </span>
              </div>

            </div>

          </div>

        </div>

      </div>


      {/* Documents */}

      <div className="card shadow-sm border-0 rounded-4 mb-4">

        <div className="card-body p-4">

          <h5 className="fw-semibold mb-3">
            Documents
          </h5>


          <div className="border rounded-3">

            {/* Resume */}

            <div className="row py-3 px-3 border-bottom align-items-center">

              <div className="col-md-4">

                <i className="bi bi-file-earmark-text text-primary me-2"></i>

                <span className="fw-semibold">
                  Resume
                </span>

              </div>

              <div className="col-md-5 text-muted">

                {student.resume || "Not uploaded"}

              </div>

              <div className="col-md-3 text-md-end">

                <span
                  className={
                    student.resume
                      ? "badge bg-success"
                      : "badge bg-secondary"
                  }
                >
                  {student.resume ? "Uploaded" : "Not Uploaded"}
                </span>

              </div>

            </div>


            {/* Graduation Marksheet */}

            <div className="row py-3 px-3 border-bottom align-items-center">

              <div className="col-md-4">

                <i className="bi bi-file-earmark-image text-primary me-2"></i>

                <span className="fw-semibold">
                  Graduation Marksheet
                </span>

              </div>

              <div className="col-md-5 text-muted">

                {student.graduationMarksheet || "Not uploaded"}

              </div>

              <div className="col-md-3 text-md-end">

                <span
                  className={
                    student.graduationMarksheet
                      ? "badge bg-success"
                      : "badge bg-secondary"
                  }
                >
                  {student.graduationMarksheet
                    ? "Uploaded"
                    : "Not Uploaded"}
                </span>

              </div>

            </div>


            {/* Master Marksheet */}

            <div className="row py-3 px-3 align-items-center">

              <div className="col-md-4">

                <i className="bi bi-file-earmark-image text-primary me-2"></i>

                <span className="fw-semibold">
                  Master Marksheet
                </span>

              </div>

              <div className="col-md-5 text-muted">

                {student.masterMarksheet || "Not uploaded"}

              </div>

              <div className="col-md-3 text-md-end">

                <span
                  className={
                    student.masterMarksheet
                      ? "badge bg-success"
                      : "badge bg-secondary"
                  }
                >
                  {student.masterMarksheet
                    ? "Uploaded"
                    : "Not Uploaded"}
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* Bottom Buttons */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        {/* Back to Dashboard */}

        <Link
          to="/Dashboard"
          className="btn btn-outline-secondary"
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to Dashboard
        </Link>


        {/* Update Profile */}

        <Link
          to="/Updateprofile"
          className="btn btn-primary"
        >
          <i className="bi bi-pencil-square me-2"></i>
          Update Profile
        </Link>

      </div>

    </div>
  );
}

export default CreateProfile;