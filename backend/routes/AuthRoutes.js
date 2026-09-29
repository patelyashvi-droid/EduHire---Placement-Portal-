// POST
// http://localhost:5000/api/auth/login

const express = require("express");
const bcrypt = require("bcryptjs");

const Student = require("../models/student");
const Login = require("../models/login");
const Otp = require("../models/otp");

const {
  createAndSendOTP
} = require("../utils/OTPService");

const router = express.Router();


// STUDENT LOGIN

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // ============================================
    // CHECK INPUT
    // ============================================

    if (!email || !password) {
      return res.status(400).json({
        status: "Error",
        message: "Email and password are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // ============================================
    // FIND STUDENT
    // ============================================

    const student = await Student.findOne({
      email: cleanEmail,
    });

    if (!student) {
      return res.status(401).json({
        status: "Error",
        message: "Invalid email or password",
      });
    }

    // ============================================
    // CHECK BLOCKED STATUS
    // ============================================

    if (student.accountStatus === "Blocked") {
      return res.status(403).json({
        status: "Error",
        message: "Your account has been blocked by the admin.",
      });
    }

    // ============================================
    // CHECK REGISTRATION STATUS
    // ============================================

    if (student.registrationStatus === "Pending") {
      return res.status(403).json({
        registrationStatus: "Pending",
        message:
          "Your registration is pending approval from admin.",
      });
    }

    if (student.registrationStatus === "Rejected") {
      return res.status(403).json({
        registrationStatus: "Rejected",
        message:
          "Your registration has been rejected by admin.",
      });
    }

    if (student.registrationStatus !== "Approved") {
      return res.status(403).json({
        registrationStatus: "Pending",
        message:
          "Your registration is pending approval from admin.",
      });
    }

    // ============================================
    // CHECK PASSWORD
    // ============================================

    const passwordMatch = await bcrypt.compare(
      password,
      student.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        status: "Error",
        message: "Invalid email or password",
      });
    }

    // ============================================
    // PASSWORD CORRECT
    // NOW SEND OTP
    // ============================================

    await createAndSendOTP(cleanEmail, "login");

    console.log(
      `📩 LOGIN OTP SENT TO: ${cleanEmail}`
    );

    // IMPORTANT:
    // Do NOT create Login record here.
    // Login record should be created only
    // after OTP is successfully verified.

    return res.status(200).json({
      success: true,
      otpRequired: true,
      message: "Password verified. OTP sent to your email.",
      student: {
        id: student._id,
        studentId: student.studentId,
        name: student.name,
        email: student.email,
        roll: student.roll,
        department: student.department,
        skill: student.skill || "",
      },
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      status: "Error",
      message: "Server error during login",
    });
  }
});

//verify otp 
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // ============================================
    // FIND OTP
    // ============================================

    const otpRecord = await Otp.findOne({
      email: cleanEmail,
      otp: otp,
      purpose: "login",
    });

    if (!otpRecord) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    // ============================================
    // CHECK EXPIRATION
    // ============================================

    if (otpRecord.expiresAt < new Date()) {
      await Otp.deleteOne({
        _id: otpRecord._id,
      });

      return res.status(400).json({
        message: "OTP has expired",
      });
    }

    // ============================================
    // FIND STUDENT
    // ============================================

    const student = await Student.findOne({
      email: cleanEmail,
    });

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    if (student.accountStatus === "Blocked") {
      return res.status(403).json({
        message: "Your account has been blocked by the admin.",
      });
    }

    // ============================================
    // GENERATE LOGIN ID
    // ============================================

    const lastLogin = await Login
      .findOne()
      .sort({ loginId: -1 });

    const newLoginId =
      lastLogin
        ? lastLogin.loginId + 1
        : 1;

    // ============================================
    // IST LOGIN TIME
    // ============================================

    const loginTime =
      new Date().toLocaleString(
        "en-IN",
        {
          timeZone: "Asia/Kolkata",
        }
      );

    // ============================================
    // SAVE LOGIN RECORD
    // ============================================

    const loginRecord = new Login({
      loginId: newLoginId,
      id: student.studentId || student.email,
      email: student.email,
      userType: "Student",
      loginTime: loginTime,
    });

    await loginRecord.save();

    console.log(
      `🔑 STUDENT LOGIN RECORDED: ${student.studentId} (Login ID: ${newLoginId})`
    );

    // ============================================
    // DELETE USED OTP
    // ============================================

    await Otp.deleteOne({
      _id: otpRecord._id,
    });

    // ============================================
    // LOGIN SUCCESS
    // ============================================

    return res.status(200).json({
      success: true,
      message: "Login successful",

      loginId: newLoginId,

      student: {
        id: student._id,
        studentId: student.studentId,
        name: student.name,
        email: student.email,
        roll: student.roll,
        department: student.department,
        skill: student.skill || "",
      },
    });

  } catch (error) {

    console.error(
      "OTP VERIFICATION ERROR:",
      error
    );

    return res.status(500).json({
      message: "Failed to verify OTP",
    });
  }
});


// ============================================
// ADMIN LOGIN
// POST /api/auth/admin-login
// ============================================
router.post("/admin-login", async (req, res) => {
  try {
    const { adminName, password } = req.body;

    if (!adminName || !password) {
      return res.status(400).json({
        success: false,
        message: "Admin name and password are required",
      });
    }

    if (adminName.trim().toLowerCase() !== "admin" || password !== "12345") {
      return res.status(401).json({
        success: false,
        message: "Invalid Admin Name or Password",
      });
    }

    // Generate unique adminId like AD1234
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const adminId = `AD${randomDigits}`;

    const lastLogin = await Login.findOne().sort({ loginId: -1 });
    const newLoginId = lastLogin ? lastLogin.loginId + 1 : 1;

    const loginTime = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    });

    const loginRecord = new Login({
      loginId: newLoginId,
      id: adminId,
      userType: "Admin",
      loginTime: loginTime,
    });

    await loginRecord.save();
    console.log(`🔐 ADMIN LOGIN RECORDED: ${adminId} (Login ID: ${newLoginId})`);

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      adminId,
      adminName,
    });
  } catch (error) {
    console.error("ADMIN LOGIN ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during admin login",
      error: error.message,
    });
  }
});


const { sendApplicationStatusEmail } = require("../utils/emailService");

// ============================================
// FORGOT / RESET PASSWORD
// ============================================
router.put("/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        message: "Email and new password are required"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Find Student by registered email
    const student = await Student.findOne({ email: cleanEmail });

    if (!student) {
      return res.status(404).json({
        message: "No student account found with this registered email address."
      });
    }

    // 2. Hash the new password using bcrypt
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 3. Save new password to Student document in MongoDB
    student.password = hashedPassword;
    await student.save();

    // 4. Send Email Notification to Student's Registered Email ID
    sendApplicationStatusEmail({
      studentEmail: student.email,
      studentName: student.name,
      companyName: "EduHire Placement Portal",
      role: "Security Alert",
      status: "Password Updated",
      message: `Your account password for EduHire Placement Portal was updated successfully. You can now log in immediately using your new password.`
    }).catch(err => console.error("Password reset email dispatch error:", err));

    console.log(`PASSWORD UPDATED SUCCESSFULLY FOR STUDENT: ${student.email}`);

    return res.status(200).json({
      success: true,
      message: "Password updated successfully! You can now log in immediately with your new password."
    });

  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    return res.status(500).json({
      message: "Server error while resetting password"
    });
  }
});

module.exports = router;