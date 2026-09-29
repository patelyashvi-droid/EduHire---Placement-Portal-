import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

export default function AddCompany() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    location: '',
    email: '',
    contact: '',
    mobile: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }

    const fetchCompany = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:5000/api/companies/${id}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch company"
          );
        }

        console.log("Company for editing:", data);

        const company = data.company || data;

        setFormData({
          name: company.name || "",
          description: company.description || "",
          website: company.website || "",
          location: company.location || "",
          email: company.email || "",
          contact: company.contact || "",
          mobile: company.mobile || "",
        });

      } catch (error) {
        console.error("FETCH COMPANY ERROR:", error);
        alert(error.message || "Failed to load company");
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = isEditMode
        ? `http://localhost:5000/api/companies/${id}`
        : "http://localhost:5000/api/companies";

      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        if (isEditMode) {
          alert("Company updated successfully!");
          navigate("/admin/managecompany");
        } else {
          alert(
            `Company added successfully!\nCompany ID: ${data.company?.companyId || ""}`
          );

          setFormData({
            name: "",
            description: "",
            website: "",
            location: "",
            email: "",
            contact: "",
            mobile: "",
          });
          navigate("/admin/managecompany");
        }
      } else {
        alert(data.message || "Unable to save company");
      }
    } catch (error) {
      console.error("SAVE COMPANY ERROR:", error);

      alert(
        "Unable to connect to server. Please make sure the backend is running."
      );
    }
  };

  return (
    <div className="container-xxl flex-grow-1 container-p-y">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">
            {isEditMode ? "Edit Company" : "Add Company"}
          </h4>
          <p className="text-muted">
            {isEditMode
              ? "Update the company details below"
              : "Enter company details below"}
          </p>
        </div>
        <Link to="/admin/managecompany" className="btn btn-outline-secondary">
          <i className="bx bx-arrow-back me-1"></i> Back to Manage Companies
        </Link>
      </div>

      <div className="row">
        <div className="col-xl">
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Company Details</h5>
              <small className="text-muted float-end">Fill all required fields</small>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
              <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="company-name">
                        Company Name
                      </label>

                      <div className="input-group input-group-merge">
                        <span className="input-group-text">
                          <i className="bx bx-buildings"></i>
                        </span>

                        <input
                          type="text"
                          className="form-control"
                          id="company-name"
                          name="name"
                          placeholder="e.g. Tata Consultancy Services"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label
                        className="form-label"
                        htmlFor="company-description"
                      >
                        Description
                      </label>

                       <div className="input-group input-group-merge">
                        <span className="input-group-text">
                          <i className="bx bx-detail"></i>
                        </span>


                      <textarea
                        id="company-description"
                        className="form-control"
                        name="description"
                        rows="2"
                        placeholder="Brief description about the company..."
                        value={formData.description}
                        onChange={handleChange}
                        style={{
                          height: "50px",
                          resize: "vertical"
                        }}
                      ></textarea>
                      </div>
                    </div>
                  </div>

                

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="company-website">Website URL</label>
                    <div className="input-group input-group-merge">
                      <span className="input-group-text"><i className="bx bx-globe"></i></span>
                      <input
                        type="url"
                        className="form-control"
                        id="company-website"
                        name="website"
                        placeholder="https://company.com"
                        value={formData.website}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="company-location">Headquarters / Location</label>
                    <div className="input-group input-group-merge">
                      <span className="input-group-text"><i className="bx bx-map"></i></span>
                      <input
                        type="text"
                        className="form-control"
                        id="company-location"
                        name="location"
                        placeholder="e.g. Mumbai, India"
                        value={formData.location}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="email-id">Email Id </label>
                    <div className="input-group input-group-merge">
                      <span className="input-group-text"><i className="bx bx-dollar-circle"></i></span>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        placeholder="e.g. tcs@gmail.com"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                    <div className="col-md-6">
                    <label className="form-label" htmlFor="contact">Contact </label>
                    <div className="input-group input-group-merge">
                      <span className="input-group-text"><i className="bx bx-briefcase"></i></span>
                      <input
                        type="text"
                        className="form-control"
                        id="contact"
                        name="contact"
                        placeholder="e.g. HR@gmail.com"
                        value={formData.contact}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label" htmlFor="company-roles">Mobile No</label>
                    <div className="input-group input-group-merge">
                      <span className="input-group-text"><i className="bx bx-phone"></i></span>
                      <input
                        type="text"
                        className="form-control"
                        id="mobile_no"
                        name="mobile"
                        placeholder="e.g. 079-2577872"
                        value={formData.mobile}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

               <button type="submit" className="btn btn-primary"><i className="bx bx-plus-circle me-1"></i> 
  {isEditMode ? "Update Company" : "Add Company"}
</button>

              
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
