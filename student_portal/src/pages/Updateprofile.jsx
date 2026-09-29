import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Updateprofile() {
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);

  const [formData, setFormData] = useState({
    bachelorCgpa: "",
    masterCgpa: "",
    skill: "",
    resume: "",
    graduationMarksheet: "",
    masterMarksheet: "",
  });

  useEffect(() => {
    const fetchForUpdate = async () => {
      let studentData = null;
      const savedData = localStorage.getItem("studentData") || localStorage.getItem("student");
      if (savedData) {
        try {
          studentData = JSON.parse(savedData);
        } catch (e) {
          console.error("Error parsing saved student data:", e);
        }
      }

      const emailId = localStorage.getItem("emailId") || studentData?.email;
      const studentId = localStorage.getItem("studentId") || studentData?.studentId || studentData?.id || studentData?._id;

      const targetId = studentId || emailId;
      if (targetId) {
        try {
          const res = await fetch(`http://localhost:5000/api/students/${encodeURIComponent(targetId)}`);
          if (res.ok) {
            const fetched = await res.json();
            const data = (fetched && fetched.student) ? fetched.student : fetched;
            if (data && (data.name || data._id)) {
              studentData = data;
              localStorage.setItem("studentData", JSON.stringify(data));
              localStorage.setItem("student", JSON.stringify(data));
            }
          }
        } catch (e) {
          console.error("Error fetching student for update:", e);
        }
      }

      if (studentData) {
        setStudent(studentData);
        setFormData({
          bachelorCgpa: studentData.bachelorCgpa || "",
          masterCgpa: studentData.masterCgpa || "",
          skill: studentData.skill || "",
          resume: studentData.resume || "",
          graduationMarksheet: studentData.graduationMarksheet || "",
          masterMarksheet: studentData.masterMarksheet || "",
        });
      }
    };

    fetchForUpdate();
  }, []);

  if (!student) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning text-center">
          Student profile data not found.
        </div>

        <div className="text-center">
          <Link
            to="/Dashboard"
            className="btn btn-primary"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Handle editable fields

  // Handle text/number fields
    const handleChange = (e) => {
  const { name, value } = e.target;

  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
};
 const handleFileChange = (e) => {
  const { name, files } = e.target;

  if (files && files[0]) {
    setFormData({
      ...formData,
      [name]: files[0].name,
    });
  }
};

  // Save changes
  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedStudent = {
      ...student,
      bachelorCgpa: formData.bachelorCgpa,
      masterCgpa: formData.masterCgpa,
      skill: formData.skill,
      resume: formData.resume,
      graduationMarksheet: formData.graduationMarksheet,
      masterMarksheet: formData.masterMarksheet,
    };

    try {
      const studentIdentifier = student._id || student.studentId || student.email;
      await fetch(`http://localhost:5000/api/students/${studentIdentifier}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bachelorCgpa: formData.bachelorCgpa,
          masterCgpa: formData.masterCgpa,
          skill: formData.skill,
        }),
      });
    } catch (err) {
      console.error("Error saving updated profile to server:", err);
    }

    localStorage.setItem(
      "studentData",
      JSON.stringify(updatedStudent)
    );
    localStorage.setItem(
      "student",
      JSON.stringify(updatedStudent)
    );

    alert("Profile updated successfully!");

    navigate("/Profile");
  };

  return (
    <div className="container py-4">

      {/* Page Heading */}
      <div className="mb-4">
        <h2 className="fw-bold">
          Update Profile
        </h2>

        <p className="text-muted">
          You can update your academic details and resume.
        </p>
      </div>


      <form onSubmit={handleSubmit}>

        {/* ================= PERSONAL INFORMATION ================= */}

        <div className="card shadow-sm border-0 rounded-4 mb-4">

          <div className="card-body p-4">

            <h5 className="fw-semibold mb-3">
              Personal Information
            </h5>

            {/* Full Name */}
            <div className="mb-3">
              <label className="form-label">
                Full Name
              </label>

              <input
                type="text"
                className="form-control"
                value={student.name || ""}
                disabled
              />
            </div>

            {/* Roll Number */}
            <div className="mb-3">
              <label className="form-label">
                Roll Number
              </label>

              <input
                type="text"
                className="form-control"
                value={student.roll || ""}
                disabled
              />
            </div>

            {/* Email */}
            <div className="mb-3">
              <label className="form-label">
                Email Address
              </label>

              <input
                type="email"
                className="form-control"
                value={student.email || ""}
                disabled
              />
            </div>

            {/* DOB */}
            <div className="mb-3">
              <label className="form-label">
                Date of Birth
              </label>

              <input
                type="text"
                className="form-control"
                value={student.dob || ""}
                disabled
              />
            </div>

            {/* Mobile */}
            <div className="mb-3">
              <label className="form-label">
                Mobile Number
              </label>

              <input
                type="text"
                className="form-control"
                value={student.mobile || ""}
                disabled
              />
            </div>

            {/* Address */}
            <div className="mb-3">
              <label className="form-label">
                Address
              </label>

              <textarea
                className="form-control"
                rows="3"
                value={student.address || ""}
                disabled
              />
            </div>

          </div>
        </div>


        {/* ================= ACADEMIC INFORMATION ================= */}

        <div className="card shadow-sm border-0 rounded-4 mb-4">

          <div className="card-body p-4">

            <h5 className="fw-semibold mb-3">
              Academic Information
            </h5>

            {/* 10th Marks - DISABLED */}
            <div className="mb-3">
              <label className="form-label">
                10th Marks
              </label>

              <input
                type="text"
                className="form-control"
                value={
                  student.mark10
                    ? `${student.mark10}%`
                    : ""
                }
                disabled
              />
            </div>

            {/* 12th Marks - DISABLED */}
            <div className="mb-3">
              <label className="form-label">
                12th Marks
              </label>

              <input
                type="text"
                className="form-control"
                value={
                  student.mark12
                    ? `${student.mark12}%`
                    : ""
                }
                disabled
              />
            </div>

            {/* Bachelor CGPA - EDITABLE */}
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Bachelor's CGPA
              </label>

              <input
                type="number"
                name="bachelorCgpa"
                className="form-control"
                value={formData.bachelorCgpa}
                onChange={handleChange}
                min="0"
                max="10"
                step="0.01"
                placeholder="Enter Bachelor's CGPA"
              />

              <small className="text-muted">
                You can update this field.
              </small>
            </div>

            {/* Master CGPA - EDITABLE */}
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Master's CGPA
              </label>

              <input
                type="number"
                name="masterCgpa"
                className="form-control"
                value={formData.masterCgpa}
                onChange={handleChange}
                min="0"
                max="10"
                step="0.01"
                placeholder="Enter Master's CGPA"
              />

              <small className="text-muted">
                You can update this field.
              </small>
            </div>

            {/* Backlogs - DISABLED */}
            <div className="mb-3">
              <label className="form-label">
                Number of Backlogs
              </label>

              <input
                type="text"
                className="form-control"
                value={student.backlog ?? 0}
                disabled
              />
            </div>

            {/* Technical Skill - EDITABLE */}
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Technical Skill
              </label>

              <select
                name="skill"
                className="form-select"
                value={formData.skill}
                onChange={handleChange}
              >
                <option value="">Select Skill</option>
                <option value="Java">Java</option>
                <option value="Python">Python</option>
                <option value="JavaScript">JavaScript</option>
                <option value="React">React</option>
                <option value="Node.js">Node.js</option>
                <option value="MongoDB">MongoDB</option>
                <option value="C">C</option>
                <option value="C++">C++</option>
                <option value="HTML/CSS">HTML/CSS</option>
              </select>

              <small className="text-muted">
                You can update your primary skill.
              </small>
            </div>

          </div>
        </div>


       {/* ================= DOCUMENTS ================= */}

        <div className="card shadow-sm border-0 rounded-4 mb-4">

        <div className="card-body p-4">

            <h5 className="fw-semibold mb-3">
            Documents
            </h5>

            {/* Resume */}
            <div className="mb-4">

            <label className="form-label fw-semibold">
                Resume
            </label>

            <input
                type="file"
                name="resume"
                className="form-control"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
            />

            {formData.resume && (
                <small className="text-muted d-block mt-2">
                Current Resume: {formData.resume}
                </small>
            )}

            </div>


            {/* Graduation Marksheet */}
            <div className="mb-4">

            <label className="form-label fw-semibold">
                Graduation Marksheet
            </label>

            <input
                type="file"
                name="graduationMarksheet"
                className="form-control"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
            />

            {formData.graduationMarksheet && (
                <small className="text-muted d-block mt-2">
                Current Graduation Marksheet:{" "}
                {formData.graduationMarksheet}
                </small>
            )}

            </div>


            {/* Master's Marksheet */}
            <div className="mb-3">

            <label className="form-label fw-semibold">
                Master's Marksheet
            </label>

            <input
                type="file"
                name="masterMarksheet"
                className="form-control"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
            />

            {formData.masterMarksheet && (
                <small className="text-muted d-block mt-2">
                Current Master's Marksheet:{" "}
                {formData.masterMarksheet}
                </small>
            )}

            </div>

        </div>
        </div>


        {/* ================= BUTTONS ================= */}

        <div className="d-flex justify-content-between mb-4">

          <Link
            to="/CreateProfile"
            className="btn btn-outline-secondary"
          >
            <i className="bi bi-arrow-left me-2"></i>
            Cancel
          </Link>

          <button
            type="submit"
            className="btn btn-primary"
          >
            <i className="bi bi-check-circle me-2"></i>
            Save Changes
          </button>

        </div>

      </form>

    </div>
  );
}

export default Updateprofile;