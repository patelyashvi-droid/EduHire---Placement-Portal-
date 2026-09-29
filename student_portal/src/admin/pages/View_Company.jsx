import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import infosys from "../assets/img/avatars/infosys.jpg"
import tcs from "../assets/img/avatars/tcs.jpg"
import wipro from "../assets/img/avatars/wipro.jpg"
import accenture from "../assets/img/avatars/accenture.jpg"
import cognizant from "../assets/img/avatars/cognizant.jpg"
import hcl from "../assets/img/avatars/hcl.jpg";

const companyImages = {
  infosys: infosys,
  tcs: tcs,
  wipro: wipro,
  accenture: accenture,
  cognizant: cognizant,
  hcl: hcl
};

const getCompanyImage = (companyName) => {
  if (!companyName) {
    return null;
  }

  const name = companyName.toLowerCase().trim();

  if (name.includes("infosys")) {
    return companyImages.infosys;
  }

  if (name.includes("tcs") || name.includes("tata consultancy")) {
    return companyImages.tcs;
  }

  if (name.includes("wipro")) {
    return companyImages.wipro;
  }

  if (name.includes("accenture")) {
    return companyImages.accenture;
  }

  if (name.includes("cognizant")) {
    return companyImages.cognizant;
  }

  if (name.includes("hcl")) {
    return companyImages.hcl;
  }

  return null;
};

function View_Company() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================
  // FETCH COMPANIES
  // ============================================
  useEffect(() => {
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

        // Supports both:
        // { companies: [...] }
        // and
        // [...]

        const companyList = Array.isArray(data)
          ? data
          : Array.isArray(data.companies)
          ? data.companies
          : [];

        setCompanies(companyList);
      } catch (error) {
        console.error(
          "FETCH COMPANIES ERROR:",
          error
        );

        setError(
          error.message || "Unable to load companies"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

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

  // ============================================
  // IMAGE URL
  // ============================================
  const getImageUrl = (image) => {
    if (!image) {
      return null;
    }

    // If backend already returns complete URL
    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    return `http://localhost:5000${image}`;
  };

  return (
    <div className="container-xxl flex-grow-1 container-p-y">

      {/* ============================================
          PAGE HEADING
      ============================================ */}
      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h4 className="fw-bold mb-1">
            Companies
          </h4>

          <p className="text-muted mb-0">
            View all registered companies
          </p>
        </div>

        <Link
          to="/Admin/AddCompany"
          className="btn btn-primary"
        >
          <i className="bx bx-plus me-1"></i>
          Add Company
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
          COMPANY CARDS
      ============================================ */}
      {!loading &&
        !error &&
        companies.length > 0 && (

          <div className="row">

            {companies.map((company) => (

              <div
                className="col-md-6 col-lg-4 mb-4"
                key={company._id}
              >

                <div className="card h-100">

               {/* Company Image */}
                <div
                  className="d-flex justify-content-center align-items-center"
                  style={{
                    height: "200px",
                    backgroundColor: "#f8f9fa",
                    overflow: "hidden",
                  }}
                >
                  {getCompanyImage(company.name) ? (
                    <img
                      src={getCompanyImage(company.name)}
                      alt={`${company.name || "Company"} logo`}
                      style={{
                        width: "100%",
                        height: "200px",
                        objectFit: "contain",
                        padding: "15px",
                      }}
                    />
                  ) : (
                    <div className="text-center text-muted">
                      <i
                        className="bx bx-buildings"
                        style={{
                          fontSize: "60px",
                        }}
                      ></i>

                      <p className="mb-0">
                        No Logo Available
                      </p>
                    </div>
                  )}
                </div>

                  {/* ==================================
                      COMPANY NAME
                  ================================== */}
                  <div className="card-body pb-2">

                    <h5 className="card-title mb-1">
                      {company.name || "Unnamed Company"}
                    </h5>

                  </div>

                  {/* ==================================
                      COMPANY DETAILS
                  ================================== */}
                  <div className="card-body pt-2">

                    <p className="card-text">
                      {company.description ||
                        "No description available."}
                    </p>

                    {/* Location */}
                    {company.location && (
                      <p className="mb-2">
                        <strong>
                          Location:
                        </strong>{" "}
                        {company.location}
                      </p>
                    )}

                    {/* Email */}
                    {company.email && (
                      <p className="mb-2">
                        <strong>
                          Email:
                        </strong>{" "}
                        {company.email}
                      </p>
                    )}

                    {/* Mobile */}
                    {(company.mobile ||
                      company.contact) && (
                      <p className="mb-3">
                        <strong>
                          Mobile:
                        </strong>{" "}
                        {company.mobile ||
                          company.contact}
                      </p>
                    )}

                    {/* Website */}
                    {company.website && (
                      <a
                        href={getWebsiteUrl(
                          company.website
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline-primary"
                      >
                        <i className="bx bx-globe me-1"></i>
                        View Website
                      </a>
                    )}

                  </div>

                </div>

              </div>

            ))}

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

export default View_Company;