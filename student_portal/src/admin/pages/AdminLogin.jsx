import  { useState } from "react";
import { useNavigate } from "react-router-dom";
import admin from "../assets/img/avatars/admin.jpeg";
import "../login.css";

const LoginAdmin = () => {
  const [adminName, setAdminName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminName, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem("adminLoggedIn", "true");
        localStorage.setItem("adminName", data.adminName || adminName);
        localStorage.setItem("adminId", data.adminId);
        navigate("/admin/dashboard");
      } else {
        alert(data.message || "Invalid Admin Name or Password");
      }
    } catch (err) {
      console.error("Admin login error:", err);
      // Fallback local verification if server is unreachable
      if (adminName === "admin" && password === "12345") {
        localStorage.setItem("adminLoggedIn", "true");
        localStorage.setItem("adminName", adminName);
        localStorage.setItem("adminId", "AD1201");
        navigate("/admin/dashboard");
      } else {
        alert("Invalid Admin Name or Password");
      }
    }
  };
 
  return (
    <div className="admin-login-page">

      <div className="container">
        <div className="row justify-content-center align-items-center min-vh-100">

          <div className="col-lg-10">
            <div className="row admin-login-box shadow-lg">

              {/* Left Side */}
              <div
                  className="col-md-6 admin-left"
                  style={{ backgroundImage: `url(${admin})` }}
                >
                  <div className="p-5 text-white">

                    <h1 className="fw-bold">
                      Student Placement Portal
                    </h1>

                    <h4 className="mt-4">
                      Admin Panel
                    </h4>

                    <p className="mt-3">
                      Manage students, companies and placements easily.
                    </p>

                  </div>
                </div>

              {/* Right Side */}
              <div className="col-md-6 bg-white">
                <div className="p-5">

                  <h2 className="fw-bold mb-2">
                    Admin Login
                  </h2>

                  <p className="text-muted mb-4">
                    Sign in to access your dashboard
                  </p>

                  <form onSubmit={handleLogin}>

                    {/* Admin Name */}
                    <div className="mb-3 text-start">
                      <label className="form-label fw-semibold">
                        Admin Name
                      </label>

                      <input
                        type="text"
                        className="form-control form-control-lg"
                        placeholder="Enter admin name"
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                        required
                      />
                    </div>

                    {/* Password */}
                    <div className="mb-4 text-start">
                      <label className="form-label fw-semibold">
                        Password
                      </label>

                      <div className="input-group">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="form-control form-control-lg"
                          placeholder="Enter password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />

                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() =>
                            setShowPassword(!showPassword)
                          }
                        >
                          {showPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>

                    {/* Sign In */}
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg w-100"
                    >
                      Sign In
                    </button>

                  </form>

                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default LoginAdmin;