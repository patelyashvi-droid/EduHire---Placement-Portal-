import { useState , useEffect} from "react";
// import Sidebar from "./Sidebar";
// import Navbar from "./Navbar";

export default function Resume() {

  const [resume, setResume] = useState(null);
  const [currentResume , setCurrentResume] = useState(null);
  const [uploading , setUploading] = useState(false);
  const [uploadedFilesList, setUploadedFilesList] = useState([]);
 

  //upload 
 const handleUpload = async () => {

  if (!resume) {
    alert("Please select a resume first");
    return;
  }

  const storedStudent =
    localStorage.getItem("student");

  if (!storedStudent) {
    alert("Please login first");
    return;
  }

  const student =
    JSON.parse(storedStudent);

  const studentId =
    student.id || student._id;

  if (!studentId) {
    alert("Student ID not found");
    return;
  }

  console.log("Student ID:", studentId);
  console.log("Resume:", resume);
  console.log("Resume name:", resume.name);

  const formData = new FormData();

  formData.append(
    "resume",
    resume
  );

  try {

    setUploading(true);

    const response = await fetch(
  `http://localhost:5000/api/students/${studentId}/resume`,
  {
    method: "PUT",
    body: formData
  }
);

console.log("STATUS:", response.status);
console.log("URL:", response.url);

const text = await response.text();

console.log("SERVER RESPONSE:");
console.log(text);

if (!response.ok) {
  alert(
    `Upload failed. Status: ${response.status}\nCheck Node terminal.`
  );
  return;
}

let result;

try {
  result = JSON.parse(text);
} catch (error) {
  console.error("Server did not return JSON:", error);
  alert("Server returned an invalid response.");
  return;
}

console.log("RESULT:", result);
    console.log(
      "Server response:",
      result
    );

    if (response.ok) {

      alert(
        "Resume updated successfully!"
      );

      // Show new resume
      setCurrentResume(
        result.resume
      );

      // Clear selected file
      setResume(null);

      setUploadedFilesList((prev) => {
        const updated = prev.filter((f) => f.id !== "resume");
        return [
          {
            id: "resume",
            title: "Resume",
            filename: result.resume,
            url: `http://localhost:5000/uploads/${result.resume}`,
            type: result.resume.toLowerCase().endsWith(".pdf") ? "PDF" : "IMAGE"
          },
          ...updated,
        ];
      });

    } else {

      alert(
        result.message ||
        "Resume upload failed"
      );

    }

  } catch (error) {

    console.error(
      "UPLOAD ERROR:",
      error
    );

    alert(
      "Unable to upload resume: " +
      error.message
    );

  } finally {

    setUploading(false);

  }
};


const handleResumeChange = (e) => {

  const file = e.target.files[0];

  if (!file) {
    return;
  }

  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

  if (!isPdf) {
    alert("Only PDF files are allowed for resume upload.");
    e.target.value = "";
    setResume(null);
    return;
  }

  console.log("Selected file:", file);
  console.log("File name:", file.name);
  console.log("File type:", file.type);

  setResume(file);
};
//delete 

const handleDeleteResume = async () => {

  const confirmDelete =
    window.confirm(
      "Are you sure you want to delete your resume?"
    );

  if (!confirmDelete) return;

  const storedStudent =
    localStorage.getItem("student");

  if (!storedStudent) return;

  const student =
    JSON.parse(storedStudent);

  
  const studentId =
    student.id || student._id;

  if (!studentId) {
    alert("Student ID not found");
    return;
  }

  try {

    const response = await fetch(
      `http://localhost:5000/api/students/${student.id}/resume`,
      {
        method: "DELETE"
      }
    );

    const result =
      await response.json();

    if (response.ok) {

      alert(
        "Resume deleted successfully!"
      );

      setCurrentResume(null);
      setUploadedFilesList((prev) => prev.filter((f) => f.id !== "resume"));

    } else {

      alert(result.message);

    }

  } catch (error) {

    console.error(error);

    alert(
      "Unable to delete resume"
    );

  }

};


  //fetch student's current resume
 useEffect(() => {

  const storedStudent =
    localStorage.getItem("student");

  if (!storedStudent) {
    return;
  }

  const studentData =
    JSON.parse(storedStudent);

  const studentId =
    studentData.id ||
    studentData._id;

  fetch(
    `http://localhost:5000/api/students/${studentId}`
  )
    .then((response) => {

      if (!response.ok) {
        throw new Error(
          "Unable to fetch student"
        );
      }

      return response.json();

    })
    .then((data) => {

      console.log(
        "Student profile:",
        data
      );

      setCurrentResume(
        data.resume || null
      );

      const files = [];
      if (data.resume) {
        files.push({
          id: "resume",
          title: "Uploaded Resume",
          filename: data.resume,
          url: `http://localhost:5000/uploads/${data.resume}`,
          type: "PDF"
        });
      }
      setUploadedFilesList(files);

    })
    .catch((error) => {

      console.error(
        "Profile fetch error:",
        error
      );

    });

}, []);


  return (
    <div className="container-fluid bg-light min-vh-100">

     

      {/* Main Content */}
      <div>

        <div className="container-fluid p-4">

          {/* Page Header */}
          <div className="mb-4">

            <h3>
              My Resume
            </h3>

            <p className="text-muted">
              Upload and manage your resume for placement opportunities.
            </p>

          </div>


          <div className="row g-4">


            {/* Upload Resume */}
            <div className="col-lg-6">

              <div className="card shadow-sm h-100">

                <div className="card-body">

                  <h5 className="card-title">
                    Upload Resume
                  </h5>

                  <p className="text-muted">
                    Upload your latest resume in PDF format.
                  </p>


                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      Select Resume (PDF Only)
                    </label>

                    <input
                      type="file"
                      className="form-control"
                      accept=".pdf,application/pdf"
                      onChange={handleResumeChange}
                    />

                  </div>


                  {resume && (
                    <div className="alert alert-success">

                      <i className="bi bi-check-circle me-2"></i>
                      
                      {resume.name}

                    </div>
                  )}


                 <button type="button"
                    className="btn btn-primary"
                    onClick={handleUpload}
                    disabled={!resume || uploading}
                  >
                    <i className="bi bi-cloud-upload me-2"></i>

                    {uploading
                      ? "Uploading..."
                      : "Upload Resume"}
                  </button>

                </div>

              </div>

            </div>


            {/* Current Resume */}
            <div className="col-lg-6">

              <div className="card shadow-sm h-100">

                <div className="card-body">

                  <h5 className="card-title">
                    Current Resume
                  </h5>

                  <p className="text-muted">
                    Your currently uploaded resume.
                  </p>


                 

                    <div className="d-flex align-items-center"> 

                       {/* <div className="bg-danger text-white rounded p-3">

                        <i className="bi bi-file-earmark-pdf fs-3"></i>

                      </div> */}


                      {currentResume ? (

              <div className="border rounded p-3">

                <div className="d-flex align-items-center">

                  <div className="bg-danger text-white rounded p-3">
                    <i className="bi bi-file-earmark-pdf fs-3"></i>
                  </div>

                  <div className="ms-3">

                    <h6 className="mb-1">
                      {currentResume}
                    </h6>

                    <small className="text-muted">
                      Current Resume
                    </small>

                  </div>

                </div>

                <div className="mt-3">

                  {/* VIEW */}
                  <button type="button"
                    className="btn btn-outline-primary btn-sm me-2"
                    onClick={() => {

                     const storedStudent =
                      localStorage.getItem("student");

                       if (!storedStudent) {
                        alert("Please login first");
                        return;
                      }
                      
                    const student =
                      JSON.parse(storedStudent);

                       const studentId = student.id || student._id;
                        if (!studentId) {
                            alert("Student ID not found");
                            return;
                          }
                    
                      window.open(
                        `http://localhost:5000/api/students/${student.id}/resume`,
                        "_blank"
                      );

                    }}
                  >
                    <i className="bi bi-eye me-1"></i>
                    View
                  </button>


                  {/* DOWNLOAD */}
                  <button
                    className="btn btn-outline-success btn-sm me-2"
                    onClick={() => {

                      const storedStudent =
                      localStorage.getItem("student");

                    const student =
                      JSON.parse(storedStudent);

                       const studentId = student.id || student._id;
                         if (!studentId) {
                          alert("Student ID not found");
                          return;
                        }
                      window.open(
                        `http://localhost:5000/api/students/${student.id}/resume/download`,
                        "_blank"
                      );

                    }}
                  >
                    <i className="bi bi-download me-1"></i>
                    Download
                  </button>


                  {/* DELETE */}
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={handleDeleteResume}
                  >
                    <i className="bi bi-trash me-1"></i>
                    Delete
                  </button>

                </div>

                  </div>

                ) : (

                  <div className="alert alert-warning">
                    <i className="bi bi-exclamation-circle me-2"></i>
                    No resume uploaded.
                  </div>

                )}

                    </div>            
                </div>

              </div>

            </div>


          </div>

          {/* Uploaded Past Resume File (View Only) */}
          <div className="card shadow-sm mt-4">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="card-title mb-0">
                  <i className="bi bi-file-earmark-pdf text-danger me-2"></i>
                  Past Uploaded Resume (View Only)
                </h5>
                <span className="badge bg-secondary">
                  <i className="bi bi-lock-fill me-1"></i>
                  View Only
                </span>
              </div>
              <p className="text-muted small">
                Here is your past uploaded resume file. It can only be viewed.
              </p>

              {uploadedFilesList.length > 0 ? (
                <div className="list-group">
                  {uploadedFilesList.map((file) => (
                    <div
                      key={file.id}
                      className="list-group-item d-flex align-items-center justify-content-between py-3"
                    >
                      <div className="d-flex align-items-center">
                        <div className="rounded p-3 me-3 text-white bg-danger">
                          <i className="bi bi-file-earmark-pdf fs-4"></i>
                        </div>
                        <div>
                          <h6 className="mb-1 text-dark fw-semibold">
                            {file.title}
                          </h6>
                          <small className="text-muted text-break d-block mb-1">
                            {file.filename}
                          </small>
                          <span
                            className="badge bg-danger text-white"
                            style={{ fontSize: "11px" }}
                          >
                            PDF Document
                          </span>
                        </div>
                      </div>

                      <div>
                        {/* VIEW ONLY BUTTON */}
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline-primary btn-sm px-3"
                        >
                          <i className="bi bi-eye me-1"></i>
                          View
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="alert alert-info mb-0">
                  <i className="bi bi-info-circle me-2"></i>
                  No past resume file uploaded.
                </div>
              )}
            </div>
          </div>


          {/* Resume Tips */}
          <div className="card shadow-sm mt-4">

            <div className="card-body">

              <h5 className="card-title">
                Resume Tips
              </h5>


              <div className="row mt-3">

                <div className="col-md-4 mb-3">

                  <div className="d-flex">

                    <i className="bi bi-check-circle-fill text-success fs-4"></i>

                    <div className="ms-3">

                      <h6>
                        Keep it Updated
                      </h6>

                      <p className="text-muted small mb-0">
                        Always upload your latest resume.
                      </p>

                    </div>

                  </div>

                </div>


                <div className="col-md-4 mb-3">

                  <div className="d-flex">

                    <i className="bi bi-file-text-fill text-primary fs-4"></i>

                    <div className="ms-3">

                      <h6>
                        Keep it Professional
                      </h6>

                      <p className="text-muted small mb-0">
                        Use a clean and professional format.
                      </p>

                    </div>

                  </div>

                </div>


                <div className="col-md-4 mb-3">

                  <div className="d-flex">

                    <i className="bi bi-shield-check text-warning fs-4"></i>

                    <div className="ms-3">

                      <h6>
                        Check Your Details
                      </h6>

                      <p className="text-muted small mb-0">
                        Make sure your contact details are correct.
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>


        </div>

      </div>

    </div>
  );
}

