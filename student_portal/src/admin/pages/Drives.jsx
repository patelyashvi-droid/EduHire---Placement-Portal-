import  { useEffect, useState } from "react";
import ScheduleDrive from "./ScheduleDrive";

export default function Drives() {
  const [drives, setDrives] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // ============================
  // FETCH DRIVES
  // ============================

  const fetchDrives = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/drives"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to fetch drives"
        );
      }

      setDrives(data);

    } catch (error) {
      console.error("FETCH DRIVES ERROR:", error);

      alert("Unable to load placement drives");

    } finally {
      setLoading(false);
    }
  };


  // ============================
  // FETCH ON PAGE LOAD
  // ============================

  useEffect(() => {
    fetchDrives();
  }, []);


  // ============================
  // ADD NEW DRIVE
  // ============================

  const handleDriveAdded = (newDrive) => {
    setDrives((prevDrives) => [
      newDrive,
      ...prevDrives
    ]);
  };


 


  // ============================
  // FORMAT DATE
  // ============================

  const formatDate = (date) => {

    if (!date) {
      return "";
    }

    const [year, month, day] = date
      .split("-");

    return `${day}-${month}-${year}`;
  };


  // ============================
  // LOADING
  // ============================

  if (loading) {
    return (
      <div className="container-xxl flex-grow-1 container-p-y">

        <div className="text-center mt-5">

          <div className="spinner-border text-primary"></div>

          <p className="mt-2">
            Loading placement drives...
          </p>

        </div>

      </div>
    );
  }


  // ============================
  // MAIN PAGE
  // ============================

  return (
    <div className="container-xxl flex-grow-1 container-p-y">

      {/* ============================
          HEADER
      ============================ */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <h4 className="fw-bold mb-1">
            Placement Drives
          </h4>

          <p className="text-muted mb-0">
            Manage upcoming and ongoing recruitment drives
          </p>

        </div>


        <button
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >

          <i className="bx bx-calendar-plus me-1"></i>

          Schedule New Drive

        </button>

      </div>


      {/* ============================
          SCHEDULE DRIVE FORM
      ============================ */}

      {showForm && (
        <ScheduleDrive
          onClose={() => setShowForm(false)}
          onDriveAdded={handleDriveAdded}
        />
      )}


      {/* ============================
          DRIVE CARDS
      ============================ */}

      <div className="row">

        {drives.length === 0 ? (

          /* ============================
             NO DRIVES
          ============================ */

          <div className="col-12">

            <div className="card">

              <div className="card-body text-center">

                <i className="bx bx-calendar-x fs-1 text-muted"></i>

                <h5 className="mt-2">
                  No Placement Drives
                </h5>

                <p className="text-muted">
                  Click "Schedule New Drive" to create a placement drive.
                </p>

              </div>

            </div>

          </div>

        ) : (

          /* ============================
             DISPLAY DRIVES
          ============================ */

          drives.map((drive) => {

            // Calculate status once
            // const status = getDriveStatus(
            //   drive.drive_date
            // );

            return (

              <div
                className="col-md-6 col-lg-4 mb-4"
                key={drive._id}
              >

                <div className="card h-100">

                  <div className="card-body">


                    {/* ============================
                        COMPANY + STATUS
                    ============================ */}

                    <div className="d-flex justify-content-between align-items-start mb-3">

                      <div>

                        <h5 className="card-title mb-1">
                          {drive.company}
                        </h5>

                      </div>


                      {/* STATUS BADGE */}

                      <span
                          className={`badge ${
                            drive.driveStatus === "Scheduled"
                              ? "bg-label-primary"
                              : drive.driveStatus === "Upcoming"
                              ? "bg-label-info"
                              : "bg-label-secondary"
                          }`}
                        >
                          {drive.driveStatus}
                        </span>

                    </div>


                    {/* ============================
                        DRIVE INFORMATION
                    ============================ */}

                    <div className="mb-3">


                      {/* ROLE */}

                      <div className="d-flex align-items-start mb-2">

                        <i className="bx bx-briefcase me-2 text-primary"></i>

                        <small>

                          <strong>
                            Role:
                          </strong>{" "}

                          {drive.role}

                        </small>

                      </div>


                      {/* DESCRIPTION */}

                      <div className="d-flex align-items-start mb-2">

                        <i className="bx bx-detail me-2 text-primary"></i>

                        <small>

                          <strong>
                            Description:
                          </strong>{" "}

                          {drive.description}

                        </small>

                      </div>


                      {/* ELIGIBILITY */}

                      <div className="d-flex align-items-start mb-2">

                        <i className="bx bx-check-shield me-2 text-primary"></i>

                        <small>

                          <strong>
                            Eligibility:
                          </strong>{" "}

                          {drive.eligibility_criteria}

                        </small>

                      </div>


                      {/* PACKAGE */}

                      <div className="d-flex align-items-center mb-2">

                        <i className="bx bx-money me-2 text-primary"></i>

                        <small>

                          <strong>
                            Package:
                          </strong>{" "}

                          {drive.package}

                        </small>

                      </div>


                      {/* DRIVE DATE */}

                      <div className="d-flex align-items-center mb-2">

                        <i className="bx bx-calendar me-2 text-primary"></i>

                        <small>

                          <strong>
                            Drive Date:
                          </strong>{" "}

                          {formatDate(
                            drive.drive_date
                          )}

                        </small>

                      </div>


                      {/* LAST DATE */}

                      <div className="d-flex align-items-center mb-2">

                        <i className="bx bx-calendar-x me-2 text-primary"></i>

                        <small>

                          <strong>
                            Last Date to Apply:
                          </strong>{" "}

                          {formatDate(
                            drive.last_date
                          )}

                        </small>

                      </div>


                      {/* LOCATION */}

                      <div className="d-flex align-items-center mb-2">

                        <i className="bx bx-map-pin me-2 text-danger"></i>

                        <small>

                          <strong>
                            Venue:
                          </strong>{" "}

                          {drive.location}

                        </small>

                      </div>


                      {/* APPLICANTS */}

                      <div className="d-flex align-items-center">

                        <i className="bx bx-group me-2 text-success"></i>

                        <small>

                          <strong>
                            Applicants:
                          </strong>{" "}

                          {drive.applicants || 0} Students

                        </small>

                      </div>

                    </div>


                    {/* ============================
                        BUTTONS
                    ============================ */}

                    <div className="d-flex gap-2">

                      <button
                        className="btn btn-sm btn-outline-primary w-100"
                      >
                        <i className="bx bx-group me-1"></i>
                        View Applicants
                      </button>


                      <button
                        className="btn btn-sm btn-outline-secondary"
                      >
                        <i className="bx bx-edit-alt me-1"></i>
                        Edit
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
  );
}