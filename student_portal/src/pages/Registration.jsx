
import logo from "../assets/final.png";
import logo2 from "../assets/register.jpg";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function Registration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    roll: "",
    department: "",
    email: "",
    password: "",
    dob: "",
    mark10: "",
    mark12: "",
    mobile: "",
    bachelorCgpa: "",
    masterCgpa: "",
    backlog: "",
    skill: "",
    address: "",
    resume: null,
    graduationMarksheet: null,
    masterMarksheet: null,
  });

  const [errors, setErrors] = useState({});
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const [registrationMessage, setRegistrationMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // HANDLE INPUT CHANGE
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      const selectedFile = files && files.length > 0 ? files[0] : null;

      if (selectedFile) {
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
        const allowedExtensions = [".jpg", ".jpeg", ".png", ".pdf"];
        const fileExt = selectedFile.name.substring(selectedFile.name.lastIndexOf(".")).toLowerCase();

        if (!allowedTypes.includes(selectedFile.type) && !allowedExtensions.includes(fileExt)) {
          setErrors((prev) => ({
            ...prev,
            [name]: "Only JPG, PNG, and PDF files are allowed",
          }));
          setFormData((prev) => ({
            ...prev,
            [name]: null,
          }));
          return;
        }
      }

      setFormData((prev) => ({
        ...prev,
        [name]: selectedFile,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Remove error when user corrects the field
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // HANDLE REGISTRATION
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    // REQUIRED FIELD VALIDATION

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.roll.trim()) {
      newErrors.roll = "Roll number is required";
    }

    if (!formData.department) {
      newErrors.department = "Department is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password =
        "Password must be at least 6 characters";
    }

    if (!formData.dob) {
      newErrors.dob = "Date of birth is required";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.mark10) {
      newErrors.mark10 = "10th marks are required";
    }

    if (!formData.mark12) {
      newErrors.mark12 = "12th marks are required";
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^[0-9]{10}$/.test(formData.mobile)) {
      newErrors.mobile =
        "Mobile number must be 10 digits";
    }

    if (!formData.bachelorCgpa) {
      newErrors.bachelorCgpa =
        "Bachelor CGPA is required";
    }

    if (!formData.masterCgpa) {
      newErrors.masterCgpa =
        "Master CGPA is required";
    }

    if (formData.backlog === "") {
      newErrors.backlog =
        "Please enter backlog count";
    }

    // SKILL VALIDATION
    if (!formData.skill) {
      newErrors.skill = "Skill is required";
    }

    const validateFile = (file, fieldName, displayName) => {
      if (!file) {
        newErrors[fieldName] = `${displayName} is required`;
        return;
      }
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
      const allowedExtensions = [".jpg", ".jpeg", ".png", ".pdf"];
      const fileExt = file.name ? file.name.substring(file.name.lastIndexOf(".")).toLowerCase() : "";

      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExt)) {
        newErrors[fieldName] = `Only JPG, PNG, and PDF files are allowed for ${displayName}`;
      }
    };

    validateFile(formData.graduationMarksheet, "graduationMarksheet", "Graduation marksheet");
    validateFile(formData.masterMarksheet, "masterMarksheet", "Master marksheet");
    validateFile(formData.resume, "resume", "Resume");

    setErrors(newErrors);

    // Stop if validation errors exist
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    // SEND DATA TO BACKEND
    try {
      setLoading(true);

      const data = new FormData();

      data.append("name", formData.name);
      data.append("roll", formData.roll);
      data.append("department", formData.department);
      data.append("email", formData.email);
      data.append("password", formData.password);

      data.append("dob", formData.dob);
      data.append("mobile", formData.mobile);
      data.append("address", formData.address);

      data.append("mark10", formData.mark10);
      data.append("mark12", formData.mark12);

      data.append(
        "bachelorCgpa",
        formData.bachelorCgpa
      );

      data.append(
        "masterCgpa",
        formData.masterCgpa
      );

      data.append(
        "backlog",
        formData.backlog
      );

      // SKILL
      data.append("skill", formData.skill);

      // Files
      data.append("resume", formData.resume);

      data.append(
        "graduationMarksheet",
        formData.graduationMarksheet
      );

      data.append(
        "masterMarksheet",
        formData.masterMarksheet
      );

      console.log("Submitting registration...");

      const response = await fetch(
        "http://localhost:5000/api/students/register",
        {
          method: "POST",
          body: data,
        }
      );

      // HANDLE RESPONSE SAFELY
      const contentType =
        response.headers.get("content-type");

      let result = {};

      if (
        contentType &&
        contentType.includes("application/json")
      ) {
        result = await response.json();
      } else {
        const text = await response.text();

        console.error(
          "Backend returned non-JSON:",
          text
        );

        throw new Error(
          "Backend returned an invalid response."
        );
      }

      console.log(
        "Registration response:",
        result
      );

      // SUCCESS
      if (response.ok) {
        setRegistrationStatus("Pending");

        setRegistrationMessage(
          result.message ||
            "Your registration is pending approval from admin."
        );
      }

      // REJECTED / ERROR
      else {
        const status =
          result.status ||
          result.registrationStatus ||
          "Rejected";

        setRegistrationStatus(status);

        setRegistrationMessage(
          result.message ||
            "Registration was rejected."
        );
      }
    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      setRegistrationStatus("Error");

      setRegistrationMessage(
        error.message ||
          "Unable to connect to server."
      );
    } finally {
      setLoading(false);
    }
  };

  // POLL FOR STATUS CHANGE
  useEffect(() => {
    if (registrationStatus !== "Pending") return;

    const intervalId = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/students/email/${formData.email}`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.registrationStatus === "Approved") {
            clearInterval(intervalId);
            setRegistrationStatus("ApprovedSuccess");
            setRegistrationMessage("Your registration has been approved by admin! You are being redirected to the login page...");
            // Redirect after 3 seconds
            setTimeout(() => {
              navigate("/login");
            }, 3000);
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [registrationStatus, formData.email, navigate]);

  // APPROVED SUCCESS SCREEN
  if (registrationStatus === "ApprovedSuccess") {
    return (
      <div className="container-fluid min-vh-100 d-flex justify-content-center align-items-center bg-light">
        <div
          className="card shadow p-5 rounded-4 text-center"
          style={{
            width: "600px",
            maxWidth: "100%",
          }}
        >
          <div className="mb-4">
            <i
              className="bi bi-check-circle-fill text-success"
              style={{
                fontSize: "70px",
              }}
            ></i>
          </div>

          <h3 className="fw-bold text-success">
            Registration Approved!
          </h3>

          <p className="text-muted mt-3">
            {registrationMessage}
          </p>

          <div className="alert alert-success mt-4">
            <i className="bi bi-info-circle me-2"></i>
            You are being redirected to the login page...
          </div>
        </div>
      </div>
    );
  }

  // PENDING SCREEN
  if (registrationStatus === "Pending") {
    return (
      <div className="container-fluid min-vh-100 d-flex justify-content-center align-items-center bg-light">
        <div
          className="card shadow p-5 rounded-4 text-center"
          style={{
            width: "600px",
            maxWidth: "100%",
          }}
        >
          <div className="mb-4">
            <i
              className="bi bi-hourglass-split text-warning"
              style={{
                fontSize: "70px",
              }}
            ></i>
          </div>

          <h3 className="fw-bold">
            Registration Pending
          </h3>

          <p className="text-muted mt-3">
            {registrationMessage}
          </p>

          <div className="alert alert-warning mt-4">
            <i className="bi bi-info-circle me-2"></i>

            Your account cannot be used to login
            until the administrator approves your
            registration.
          </div>

          <p className="small text-muted">
            Please wait for the admin to review
            your application.
          </p>
        </div>
      </div>
    );
  }

  // REJECTED SCREEN
  if (
    registrationStatus === "Rejected" ||
    registrationStatus === "rejected"
  ) {
    return (
      <div className="container-fluid min-vh-100 d-flex justify-content-center align-items-center bg-light">
        <div
          className="card shadow p-5 rounded-4 text-center"
          style={{
            width: "600px",
            maxWidth: "100%",
          }}
        >
          <div className="mb-4">
            <i
              className="bi bi-x-circle-fill text-danger"
              style={{
                fontSize: "70px",
              }}
            ></i>
          </div>

          <h3 className="fw-bold text-danger">
            Registration Rejected
          </h3>

          <p className="text-muted mt-3">
            {registrationMessage}
          </p>

          <div className="alert alert-danger mt-4">
            <i className="bi bi-exclamation-triangle me-2"></i>

            Your registration has been rejected
            by the administrator.
          </div>

          <button
            className="btn btn-primary mt-3"
            onClick={() => {
              setRegistrationStatus(null);
              setRegistrationMessage("");
            }}
          >
            Register Again
          </button>
        </div>
      </div>
    );
  }

  // ERROR SCREEN
  if (registrationStatus === "Error") {
    return (
      <div className="container-fluid min-vh-100 d-flex justify-content-center align-items-center bg-light">
        <div
          className="card shadow p-5 rounded-4 text-center"
          style={{
            width: "600px",
            maxWidth: "100%",
          }}
        >
          <i
            className="bi bi-exclamation-triangle-fill text-danger"
            style={{
              fontSize: "70px",
            }}
          ></i>

          <h3 className="mt-3">
            Registration Failed
          </h3>

          <p className="text-muted">
            {registrationMessage}
          </p>

          <button
            className="btn btn-primary"
            onClick={() => {
              setRegistrationStatus(null);
              setRegistrationMessage("");
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // REGISTRATION FORM
  return (
    <div className="container-fluid min-vh-100 d-flex justify-content-center align-items-center bg-light py-5">
      <div
        className="card shadow p-4 rounded-4"
        style={{
          width: "600px",
          maxWidth: "100%",
        }}
      >

        {/* LOGO + TITLE */}
        <div className="text-center mb-3">
          <div className="d-flex justify-content-center align-items-center gap-3">
            <img
              src={logo}
              alt="logo"
              width="75"
              height="75"
              className="rounded"
            />

            <h4 className="mb-0">
              EduHire - Elevating College to Career
            </h4>
          </div>
        </div>

        {/* REGISTRATION IMAGE */}
        <div className="mb-4 text-center">
          <img
            src={logo2}
            alt="registration"
            className="img-fluid rounded"
            style={{
              width: "70%",
              height: "100px",
              objectFit: "contain",
            }}
          />
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit}>

          {/* HEADING */}
          <div className="mb-4">
            <h2 className="h4">
              Create Your Account
            </h2>

            <p className="text-muted">
              Enter your academic and personal details.
            </p>
          </div>

          {/* FULL NAME */}
          <div className="mb-3 text-start">
            <label className="form-label">
              Full Name
            </label>

            <input
              type="text"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
            />

            {errors.name && (
              <div className="text-danger small mt-1">
                {errors.name}
              </div>
            )}
          </div>

          {/* ROLL NUMBER */}
          <div className="mb-3 text-start">
            <label className="form-label">
              Roll Number
            </label>

            <input
              type="text"
              name="roll"
              className="form-control"
              value={formData.roll}
              onChange={handleChange}
              placeholder="Enter your roll number"
            />

            {errors.roll && (
              <div className="text-danger small mt-1">
                {errors.roll}
              </div>
            )}
          </div>

          {/* DEPARTMENT */}
          <div className="mb-3 text-start">
            <label className="form-label">
              Department
            </label>

            <select
              name="department"
              className="form-select"
              value={formData.department}
              onChange={handleChange}
            >
              <option value="">
                Select Department
              </option>

              <option value="MCA">
                MCA
              </option>

              <option value="M.Tech">
                M.Tech
              </option>

              <option value="MBA">
                MBA
              </option>

              <option value="MSCIT">
                MSCIT
              </option>
            </select>

            {errors.department && (
              <div className="text-danger small mt-1">
                {errors.department}
              </div>
            )}
          </div>

          {/* ADDRESS */}
          <div className="mb-3 text-start">
            <label className="form-label">
              Address
            </label>

            <textarea
              name="address"
              rows="3"
              className="form-control"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter your full address"
            ></textarea>

            {errors.address && (
              <div className="text-danger small mt-1">
                {errors.address}
              </div>
            )}
          </div>

          {/* EMAIL */}
          <div className="mb-3 text-start">
            <label className="form-label">
              Email Address
            </label>

            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />

            {errors.email && (
              <div className="text-danger small mt-1">
                {errors.email}
              </div>
            )}
          </div>

          {/* PASSWORD */}
          <div className="mb-3 text-start">
            <label className="form-label">
              Password
            </label>

            <input
              type="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
            />

            {errors.password && (
              <div className="text-danger small mt-1">
                {errors.password}
              </div>
            )}
          </div>

          {/* DATE OF BIRTH */}
          <div className="mb-3 text-start">
            <label className="form-label">
              Date of Birth
            </label>

            <input
              type="date"
              name="dob"
              className="form-control"
              value={formData.dob}
              onChange={handleChange}
            />

            {errors.dob && (
              <div className="text-danger small mt-1">
                {errors.dob}
              </div>
            )}
          </div>

          {/* 10TH + 12TH */}
          <div className="row">
            <div className="col-md-6 mb-3 text-start">
              <label className="form-label">
                10th Marks (%)
              </label>

              <input
                type="number"
                name="mark10"
                className="form-control"
                value={formData.mark10}
                onChange={handleChange}
                placeholder="10th marks"
                min="0"
                max="100"
              />

              {errors.mark10 && (
                <div className="text-danger small mt-1">
                  {errors.mark10}
                </div>
              )}
            </div>

            <div className="col-md-6 mb-3 text-start">
              <label className="form-label">
                12th Marks (%)
              </label>

              <input
                type="number"
                name="mark12"
                className="form-control"
                value={formData.mark12}
                onChange={handleChange}
                placeholder="12th marks"
                min="0"
                max="100"
              />

              {errors.mark12 && (
                <div className="text-danger small mt-1">
                  {errors.mark12}
                </div>
              )}
            </div>
          </div>

          {/* MOBILE */}
          <div className="mb-3 text-start">
            <label className="form-label">
              Mobile Number
            </label>

            <input
              type="tel"
              name="mobile"
              className="form-control"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="Enter 10 digit mobile number"
              maxLength="10"
            />

            {errors.mobile && (
              <div className="text-danger small mt-1">
                {errors.mobile}
              </div>
            )}
          </div>

          {/* BACHELOR + MASTER CGPA */}
          <div className="row">
            <div className="col-md-6 mb-3 text-start">
              <label className="form-label">
                Bachelor CGPA
              </label>

              <input
                type="number"
                name="bachelorCgpa"
                className="form-control"
                value={formData.bachelorCgpa}
                onChange={handleChange}
                placeholder="Bachelor CGPA"
                min="0"
                max="10"
                step="0.01"
              />

              {errors.bachelorCgpa && (
                <div className="text-danger small mt-1">
                  {errors.bachelorCgpa}
                </div>
              )}
            </div>

            <div className="col-md-6 mb-3 text-start">
              <label className="form-label">
                Master CGPA
              </label>

              <input
                type="number"
                name="masterCgpa"
                className="form-control"
                value={formData.masterCgpa}
                onChange={handleChange}
                placeholder="Master CGPA"
                min="0"
                max="10"
                step="0.01"
              />

              {errors.masterCgpa && (
                <div className="text-danger small mt-1">
                  {errors.masterCgpa}
                </div>
              )}
            </div>
          </div>

          {/* BACKLOG */}
          <div className="mb-3 text-start">
            <label className="form-label">
              Number of Backlogs
            </label>

            <input
              type="number"
              name="backlog"
              className="form-control"
              value={formData.backlog}
              onChange={handleChange}
              placeholder="Enter number of backlogs"
              min="0"
            />

            {errors.backlog && (
              <div className="text-danger small mt-1">
                {errors.backlog}
              </div>
            )}
          </div>

          {/* SKILL DROPDOWN */}
          <div className="mb-3 text-start">
            <label className="form-label">
              Skill
            </label>

            <select
              name="skill"
              className="form-select"
              value={formData.skill}
              onChange={handleChange}
            >
              <option value="">
                Select Skill
              </option>

              <option value="Java">
                Java
              </option>

              <option value="Python">
                Python
              </option>

              <option value="JavaScript">
                JavaScript
              </option>

              <option value="React">
                React
              </option>

              <option value="Node.js">
                Node.js
              </option>

              <option value="MongoDB">
                MongoDB
              </option>

              <option value="C">
                C
              </option>

              <option value="C++">
                C++
              </option>

              <option value="HTML/CSS">
                HTML/CSS
              </option>

            </select>

            {errors.skill && (
              <div className="text-danger small mt-1">
                {errors.skill}
              </div>
            )}
          </div>

          {/* GRADUATION MARKSHEET */}
          <div className="mb-3 text-start">
            <label className="form-label">
              Graduation Marksheet (JPG, PNG, PDF)
            </label>

            <input
              type="file"
              name="graduationMarksheet"
              className="form-control"
              onChange={handleChange}
              accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
            />

            {errors.graduationMarksheet && (
              <div className="text-danger small mt-1">
                {errors.graduationMarksheet}
              </div>
            )}
            <div className="form-text">
              Only JPG, PNG, and PDF files are allowed.
            </div>
          </div>

          {/* MASTER MARKSHEET */}
          <div className="mb-4 text-start">
            <label className="form-label">
              Master Marksheet (JPG, PNG, PDF)
            </label>

            <input
              type="file"
              name="masterMarksheet"
              className="form-control"
              onChange={handleChange}
              accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
            />

            {errors.masterMarksheet && (
              <div className="text-danger small mt-1">
                {errors.masterMarksheet}
              </div>
            )}
            <div className="form-text">
              Only JPG, PNG, and PDF files are allowed.
            </div>
          </div>

          {/* RESUME */}
          <div className="mb-3 text-start">
            <label className="form-label">
              Resume (JPG, PNG, PDF)
            </label>

            <input
              type="file"
              name="resume"
              className="form-control"
              onChange={handleChange}
              accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
            />

            {errors.resume && (
              <div className="text-danger small mt-1">
                {errors.resume}
              </div>
            )}

            <div className="form-text">
              Only JPG, PNG, and PDF files are allowed.
            </div>
          </div>

          {/* REGISTER BUTTON */}
          <button
            className="btn btn-primary w-100"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                ></span>

                Submitting...
              </>
            ) : (
              <>
                <i className="bi bi-person-plus me-2"></i>
                Create Account
              </>
            )}
          </button>

        </form>

        {/* LOGIN LINK */}
        <div className="text-center mt-3">
          Already have an account?

          <Link
            to="/login"
            className="fw-semibold ms-1"
          >
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}

export default Registration;

