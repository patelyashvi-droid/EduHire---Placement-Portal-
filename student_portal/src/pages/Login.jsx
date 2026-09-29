import logo from "../assets/final.png";
import logo2 from "../assets/deshboard.jpg";
import { Link,useNavigate} from "react-router-dom";

import { useState } from "react";

function Login() {
  
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
   const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [message, setMessage] = useState("");
 
  const [errors, setErrors] = useState({});


const handleSubmit = async (e) => {
  e.preventDefault();

  if (showOtp) {
    if (!otp || otp.length !== 6) {
      setMessage("Please enter the 6-digit OTP.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            otp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "OTP verification failed");
        return;
      }
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("studentEmail", email);
      if (data.student) {
        localStorage.setItem("student", JSON.stringify(data.student));
        localStorage.setItem("studentId", data.student.studentId || "");
        localStorage.setItem("emailId", data.student.email || "");
        localStorage.setItem("id", data.student.id || "");
      }

      alert("Login successfull");

      navigate("/dashboard");

    } catch (error) {
      console.error("OTP verification error:", error);
      setMessage("Unable to connect to server.");
    }

    return;
  }

  // Normal email/password validation
  let newErrors = {};

  if (!email) {
    newErrors.email = "Enter a valid email.";
  }

  if (!password || password.length < 6) {
    newErrors.password = "Password must be at least 6 characters.";
  }

  setErrors(newErrors);

  if (Object.keys(newErrors).length !== 0) {
    return;
  }

  try {
    const response = await fetch(
      "http://localhost:5000/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    const data = await response.json();

      if (!response.ok) {
      setMessage(data.message || "Login failed");
      return;
    }

    setMessage("OTP sent to your registered email.");
    setShowOtp(true);

  } catch (error) {
    console.error("Login error:", error);
    setMessage("Unable to connect to server.");
  }
};


  return (

    <div className="container-fluid min-vh-100 d-flex justify-content-center align-items-center bg-light">

      <div className="card shadow p-4 rounded-4" style={{width:"500px"}}>


        {/* Logo + Title */}

        <div className="text-center mb-3">

          <img 
            src={logo}
            alt="logo"
            width="45"
            height="45"
            className="rounded"
          />


          <h4 className="mt-2">
            EduHire-Elevating college to career
          </h4>

        </div>



        {/* Image */}

        <div className="mb-4">

          <img
            src={logo2}
            alt="dashboard"
            className="img-fluid rounded"
            style={{
              height:"100px",
              width:"40%",
              objectFit:"cover"
            }}
          />

        </div>


        <form onSubmit={handleSubmit}>


          <div className="mb-4">

            {/* <p className="text-primary small mb-1">
              Secure Access
            </p> */}

            {/* <h2 className="h4">
              Login
            </h2> */}

            <p className="text-muted">
              Sign in to continue.
            </p>

          </div>




          {/* Email */}

          <div className="mb-3 text-start">

            <label className="form-label">
              Email address
            </label>


            <input
              className="form-control"
              type="email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
            />


            {
              errors.email &&
              <div className="text-danger small">
                {errors.email}
              </div>
            }


          </div>





          {/* Password */}

          <div className="mb-3">


            <div className="d-flex justify-content-between">

              <label className="form-label">
                Password
              </label>


              <Link 
                    to="/Forgotpass"
                    className="small fw-semibold">
                    Forgot?
              </Link>

            </div>



            <input
              className="form-control"
              type="password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
            />



            {
              errors.password &&
              <div className="text-danger small">
                {errors.password}
              </div>
            }

          </div>

            {/* otp  */}

            {showOtp && (
                <div className="mb-3 text-start">

                  <label className="form-label">
                    Enter OTP
                  </label>

                  <input
                    className="form-control"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    maxLength="6"
                  />

                </div>
              )}



          {/* Remember */}

          <div className="form-check mb-4">

            <input
              className="form-check-input"
              type="checkbox"
              checked={remember}
              onChange={(e)=>setRemember(e.target.checked)}
            />


            <label className="form-check-label">
              Remember me
            </label>


          </div>

            {message && (
                <div className="text-primary small mb-3">
                  {message}
                </div>
              )}


        <button
            type="submit"
            className="btn btn-primary w-100"
          >
            <i className="bi bi-box-arrow-in-right me-2"></i>
            Sign In
          </button>



        </form>




        <div className="text-center mt-3">

          New here?

          <Link to="/Registration" className="fw-semibold ms-1">
             Create an account
          </Link>


        </div>


      </div>

    </div>

  );

}


export default Login;