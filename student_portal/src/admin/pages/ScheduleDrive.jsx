import { useState } from "react";

export default function ScheduleDrive({ onClose, onDriveAdded }) {

  const [formData, setFormData] = useState({
    company: "",
    role: "",
    description: "",
    eligibility_criteria: "",
    package: "",
    drive_date: "",
    last_date: "",
    location: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  console.log("FORM DATA:", formData);

  setLoading(true);

  try {
    const response = await fetch(
      "http://localhost:5000/api/drives/add",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      }
    );

    console.log("RESPONSE STATUS:", response.status);

    const text = await response.text();

    console.log("RAW RESPONSE:", text);

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(
        "Backend did not return JSON. Check your backend route."
      );
    }

    console.log("RESPONSE DATA:", data);

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to schedule drive"
      );
    }

    alert("Drive scheduled successfully!");

    if (onDriveAdded) {
      onDriveAdded(data.drive);
    }

    if (onClose) {
      onClose();
    }

  } catch (error) {

    console.error("SCHEDULE DRIVE ERROR:", error);

    alert(error.message);

  } finally {

    setLoading(false);

  }
};


  return (
    <div className="card mb-4">

      <div className="card-header d-flex justify-content-between align-items-center">

        <h5 className="mb-0">
          <i className="bx bx-calendar-plus me-2"></i>
          Schedule New Placement Drive
        </h5>

        <button
          type="button"
          className="btn-close"
          onClick={onClose}
        ></button>

      </div>


      <div className="card-body">

        <form onSubmit={handleSubmit}>

          <div className="row">

            {/* Company */}
            <div className="col-md-6 mb-3">

              <label className="form-label">
                Company Name
              </label>

              <input
                type="text"
                name="company"
                className="form-control"
                placeholder="e.g. Cognizant"
                value={formData.company}
                onChange={handleChange}
                required
              />

            </div>


            {/* Role */}
            <div className="col-md-6 mb-3">

              <label className="form-label">
                Role
              </label>

              <input
                type="text"
                name="role"
                className="form-control"
                placeholder="e.g. Business Analyst"
                value={formData.role}
                onChange={handleChange}
                required
              />

            </div>


            {/* Description */}
            <div className="col-12 mb-3">

              <label className="form-label">
                Job Description
              </label>

              <textarea
                name="description"
                className="form-control"
                rows="3"
                placeholder="Enter job description"
                value={formData.description}
                onChange={handleChange}
                required
              ></textarea>

            </div>


            {/* Eligibility */}
            <div className="col-md-6 mb-3">

              <label className="form-label">
                Eligibility Criteria
              </label>

              <textarea
                name="eligibility_criteria"
                className="form-control"
                rows="3"
                placeholder="e.g. MBA Finance, 60% minimum"
                value={formData.eligibility_criteria}
                onChange={handleChange}
                required
              ></textarea>

            </div>


            {/* Package */}
            <div className="col-md-6 mb-3">

              <label className="form-label">
                Package
              </label>

              <input
                type="text"
                name="package"
                className="form-control"
                placeholder="e.g. 6 LPA"
                value={formData.package}
                onChange={handleChange}
                required
              />

            </div>


            {/* Last Date */}
            <div className="col-md-6 mb-3">

              <label className="form-label">
                Last Date to Apply
              </label>

              <input
                type="date"
                name="last_date"
                className="form-control"
                value={formData.last_date}
                onChange={handleChange}
                required
              />

            </div>


            {/* Drive Date */}
            <div className="col-md-6 mb-3">

              <label className="form-label">
                Drive Date
              </label>

              <input
                type="date"
                name="drive_date"
                className="form-control"
                value={formData.drive_date}
                onChange={handleChange}
                required
              />

            </div>


            {/* Location */}
            <div className="col-md-6 mb-3">

              <label className="form-label">
                Venue / Location
              </label>

              <input
                type="text"
                name="location"
                className="form-control"
                placeholder="e.g. Campus Auditorium"
                value={formData.location}
                onChange={handleChange}
                required
              />

            </div>

          </div>


          <div className="d-flex gap-2">

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Scheduling...
                </>
              ) : (
                <>
                  <i className="bx bx-calendar-check me-1"></i>
                  Schedule Drive
                </>
              )}

            </button>


            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}