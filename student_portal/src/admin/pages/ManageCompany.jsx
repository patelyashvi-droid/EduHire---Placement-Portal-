import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function ManageCompany() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openAction, setOpenAction] = useState(null);

  // ============================================
  // FETCH COMPANIES
  // ============================================
 const fetchCompanies = async () => {
  try {
    setLoading(true);
    setError("");

    const response = await fetch(
      "http://localhost:5000/api/companies"
    );

    if (!response.ok) {
      throw new Error(
        `HTTP Error: ${response.status}`
      );
    }

    const data = await response.json();

    console.log("Companies API Response:", data);

    setCompanies(
      Array.isArray(data)
        ? data
        : data.companies || []
    );

  } catch (error) {
    console.error(
      "FETCH COMPANIES ERROR:",
      error
    );

    setError(error.message);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchCompanies();
}, []);
  // ============================================
  // TOGGLE ACTION DROPDOWN
  // ============================================
  const handleActionToggle = (id) => {
    setOpenAction((previous) =>
      previous === id ? null : id
    );
  };

  // ============================================
  // DELETE COMPANY
  // ============================================
  const handleDelete = async (id, companyName) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${companyName || "this company"}"?\n\nWarning: This will permanently remove the company and all its associated placement drives, applications, and reports from the database.`
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/companies/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete company"
        );
      }

      // Remove company from frontend
      setCompanies((previousCompanies) =>
        previousCompanies.filter((company) => {
          const currentId = company._id || company.id || company.companyId;
          return (
            currentId !== id &&
            company._id !== id &&
            company.companyId !== id
          );
        })
      );

      setOpenAction(null);

      alert("Company and all associated data deleted successfully!");

    } catch (error) {
      console.error("DELETE COMPANY ERROR:", error);
      alert(error.message || "Failed to delete company");
    }
  };

  // ============================================
  // CLOSE DROPDOWN
  // ============================================
  const handleView = () => {
    setOpenAction(null);
  };

  const handleEdit = () => {
    setOpenAction(null);
  };

  // ============================================
  // WEBSITE URL
  // ============================================
  const getWebsiteUrl = (website) => {
    if (!website) {
      return null;
    }

    if (
      website.startsWith("http://") ||
      website.startsWith("https://")
    ) {
      return website;
    }

    return `https://${website}`;
  };

  return (
    <div className="container-xxl flex-grow-1 container-p-y">

      {/* ============================================
          PAGE HEADER
      ============================================ */}
      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h4 className="fw-bold mb-1">
            Manage Companies
          </h4>

          <p className="text-muted mb-0">
            Edit or update existing company profiles and status
          </p>
        </div>

        <Link
          to="/Admin/AddCompany"
          className="btn btn-primary"
        >
          <i className="bx bx-plus me-1"></i>
          Add New Company
        </Link>

      </div>

      {/* ============================================
          LOADING
      ============================================ */}
      {loading && (
        <div className="text-center mt-5">

          <div
            className="spinner-border text-primary"
            role="status"
          >
            <span className="visually-hidden">
              Loading...
            </span>
          </div>

          <p className="mt-2">
            Loading companies...
          </p>

        </div>
      )}

      {/* ============================================
          ERROR
      ============================================ */}
      {!loading && error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* ============================================
          NO COMPANIES
      ============================================ */}
      {!loading &&
        !error &&
        companies.length === 0 && (
          <div className="alert alert-info">
            No companies found.
          </div>
        )}

      {/* ============================================
          COMPANIES TABLE
      ============================================ */}
      {!loading &&
        !error &&
        companies.length > 0 && (

          <div className="card">

            {/* Card Header */}
            <div className="card-header d-flex justify-content-between align-items-center">

              <h5 className="mb-0">
                Registered Companies
              </h5>

              <span className="badge bg-primary">
                {companies.length} Companies
              </span>

            </div>

            {/* Table */}
            <div className="table-responsive">

              <table className="table table-hover">

                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Location</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Website</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody className="table-border-bottom-0">

                {companies.map((company, index) => {
  const companyId =
    company._id ||
    company.id ||
    company.companyId;

  return (
    <tr key={companyId || `company-${index}`}>
      {/* Company */}
      <td>
        <i className="bx bx-buildings text-primary me-2"></i>

        <strong>
          {company.name || "N/A"}
        </strong>
      </td>

      {/* Location */}
      <td>
        {company.location || "N/A"}
      </td>

      {/* Email */}
      <td>
        {company.email || "N/A"}
      </td>

      {/* Mobile */}
      <td>
        {company.mobile ||
          company.contact ||
          "N/A"}
      </td>

      {/* Website */}
      <td>
        {company.website ? (
          <a
            href={getWebsiteUrl(company.website)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary"
          >
            Visit Website
          </a>
        ) : (
          "N/A"
        )}
      </td>

      {/* Actions */}
      <td>
        <div
          className={`dropdown ${
            openAction === companyId ? "show" : ""
          }`}
          style={{
            position: "relative",
          }}
        >
          <button
            type="button"
            className="btn p-0 dropdown-toggle hide-arrow"
            onClick={() =>
              handleActionToggle(companyId)
            }
            aria-expanded={
              openAction === companyId
            }
          >
            <i className="bx bx-dots-vertical-rounded"></i>
          </button>

          {openAction === companyId && (
            <div
              className="dropdown-menu show"
              style={{
                position: "absolute",
                right: 0,
                top: "100%",
                zIndex: 1000,
              }}
            >
              {/* View */}
              <Link
                className="dropdown-item"
                to="/admin/view_company"
                onClick={handleView}
              >
                <i className="bx bx-show-alt me-1"></i>
                View
              </Link>

              {/* Edit */}
              <Link
                className="dropdown-item"
                to={`/admin/addcompany/${companyId}`}
                onClick={() => {
                  console.log("EDIT COMPANY ID:", companyId);
                  handleEdit();
                }}
              >
                <i className="bx bx-edit-alt me-1"></i>
                Edit
              </Link>

              {/* Delete */}
              <button
                type="button"
                className="dropdown-item text-danger"
                onClick={() =>
                  handleDelete(companyId, company.name)
                }
              >
                <i className="bx bx-trash me-1"></i>
                Delete
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
})}

                </tbody>

              </table>

            </div>

          </div>
        )}

      {/* ============================================
          BACK BUTTON
      ============================================ */}
      <div className="text-center mt-3">

        <Link
          to="/admin/dashboard"
          className="btn btn-primary"
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to Dashboard
        </Link>

      </div>

    </div>
  );
}