// POST
// http://localhost:5000/api/students/register
const mongoose = require("mongoose");
const express = require("express");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");

 const Student = require("../models/student");
const Application = require("../models/application");
const Login = require("../models/login");
const Otp = require("../models/otp");

const router = express.Router();


const uploadDir = path.join(__dirname, "..", "uploads");

// =====================================================
// EMAIL CONFIGURATION
// =====================================================

const emailUser = process.env.EMAIL_USER || process.env.GMAIL_USER;
const emailPass = process.env.EMAIL_PASS || process.env.GMAIL_PASS;

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

// MULTER CONFIGURATION

const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {

    const uniqueName =
      Date.now() + "-" + file.originalname.replace(/\s+/g, "_");

    cb(null, uniqueName);
  }

});

const fileFilter = (req, file, cb) => {
  const allowedExts = /\.(jpg|jpeg|png|pdf)$/i;
  const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];

  const extValid = allowedExts.test(file.originalname);
  const mimeValid = allowedMimes.includes(file.mimetype);

  if (extValid && mimeValid) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type for ${file.fieldname}. Only JPG, PNG, and PDF files are allowed.`));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

const uploadRegistrationFiles = (req, res, next) => {
  const registerUpload = upload.fields([
    { name: "resume", maxCount: 1 },
    { name: "graduationMarksheet", maxCount: 1 },
    { name: "masterMarksheet", maxCount: 1 },
  ]);

  registerUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

const pdfFileFilter = (req, file, cb) => {
  const extValid = /\.pdf$/i.test(file.originalname);
  const mimeValid = file.mimetype === "application/pdf";

  if (extValid && mimeValid) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF files are allowed for resume upload."));
  }
};

const uploadResume = multer({
  storage: storage,
  fileFilter: pdfFileFilter,
});

const uploadSingleResume = (req, res, next) => {
  const singleUpload = uploadResume.single("resume");

  singleUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

// STUDENT REGISTRATION

// POST /api/students/register

router.post(
  "/register",
  uploadRegistrationFiles,
  async (req, res) => {
    try {

     
      console.log("================================");
      console.log("NEW STUDENT REGISTRATION");
      console.log("BODY:", req.body);
      console.log("FILES:", req.files);
      console.log("================================");

      

      const {
        name,
        roll,
        department,
        email,
        password,
        dob,
        mobile,
        address,
        mark10,
        mark12,
        bachelorCgpa,
        masterCgpa,
        backlog,
        skill,
      } = req.body;

      // ============================================
      // VALIDATION
      // ============================================

      if (
        !name ||
        !roll ||
        !email ||
        !password
      ) {
        return res.status(400).json({
          success: false,
          status: "Error",
          message:
            "Name, roll, email and password are required",
        });
      }

      // ============================================
      // CHECK DUPLICATE EMAIL
      // ============================================

      const cleanEmail =
        email.trim().toLowerCase();

      const existingStudent =
        await Student.findOne({
          email: cleanEmail,
        });

      if (existingStudent) {
        return res.status(400).json({
          success: false,
          status: "Error",
          message:
            "Email already registered",
        });
      }

      // ============================================
      // PASSWORD HASH
      // ============================================

      const hashedPassword =
        await bcrypt.hash(password, 10);

      // ============================================
      // FILES
      // ============================================

      const resume =
        req.files?.resume?.[0]?.filename || null;

      const graduationMarksheet =
        req.files?.graduationMarksheet?.[0]
          ?.filename || null;

      const masterMarksheet =
        req.files?.masterMarksheet?.[0]
          ?.filename || null;

      // ============================================
      // UNIQUE STUDENT ID
      // ============================================

      const studentId =
        "STU" +
        Date.now() +
        Math.floor(Math.random() * 1000);

      // ============================================
      // CREATE STUDENT
      // ============================================

      const student = new Student({
        studentId,

        name: name.trim(),

        roll: roll.trim(),

        department,

        email: cleanEmail,

        password: hashedPassword,

        dob,

        mobile,

        address,

        mark10,

        mark12,

        bachelorCgpa,

        masterCgpa,

        backlog,

        skill: skill ? skill.trim() : "",

        resume,

        graduationMarksheet,

        masterMarksheet,

        // VERY IMPORTANT
        registrationStatus: "Pending",

        registrationMessage:
          "Your registration is pending approval from admin.",
      });

      // ============================================
      // SAVE
      // ============================================

      await student.save();
      

      console.log(
        "Student registered successfully:"
      );

      console.log({
        id: student._id,
        studentId: student.studentId,
        name: student.name,
        email: student.email,
        registrationStatus:
          student.registrationStatus,
      });
      // =====================================================
// SEND REGISTRATION EMAIL
// =====================================================

try {
  await transporter.sendMail({
    from: `"EduHire" <${emailUser}>`,
    to: student.email,
    subject: "EduHire Registration Successful",

    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: auto;
        padding: 30px;
        border: 1px solid #ddd;
        border-radius: 10px;
        background: #ffffff;
      ">

        <h2 style="color: #696cff;">
          EduHire
        </h2>

        <h3>
          Registration Successful
        </h3>

        <p>
          Hello <strong>${student.name}</strong>,
        </p>

        <p>
          Thank you for registering with
          <strong>EduHire</strong>.
        </p>

        <p>
          Your registration has been successfully
          submitted and is currently
          <strong style="color: orange;">
            Pending
          </strong>
          approval from the administrator.
        </p>

        <div style="
          background: #f5f5f9;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
        ">

          <p>
            <strong>Student ID:</strong>
            ${student.studentId}
          </p>

          <p>
            <strong>Name:</strong>
            ${student.name}
          </p>

          <p>
            <strong>Email:</strong>
            ${student.email}
          </p>

          <p>
            <strong>Department:</strong>
            ${student.department}
          </p>

          <p>
            <strong>Skill:</strong>
            ${student.skill || "N/A"}
          </p>

          <p>
            <strong>Status:</strong>
            <span style="color: orange;">
              Pending
            </span>
          </p>

        </div>

        <p>
          Your application will be reviewed by the
          placement administrator.
        </p>

        <p>
          You will receive another email once your
          registration has been approved.
        </p>

        <p>
          Thank you for registering with EduHire.
        </p>

        <p>
          Best Regards,<br>
          <strong>EduHire Admin Team</strong>
        </p>

      </div>
    `,
  });

  console.log(
    "REGISTRATION EMAIL SENT TO:",
    student.email
  );

} catch (emailError) {

  console.error(
    "REGISTRATION EMAIL ERROR:",
    emailError.message
  );
}

      // ============================================
      // RESPONSE
      // ============================================

      return res.status(201).json({
        success: true,

        status: "Pending",

        registrationStatus: "Pending",

        message:
          "Registration successful. Your registration is pending approval from admin.",

        student: {
          id: student._id,
          studentId: student.studentId,
          name: student.name,
          email: student.email,
          skill: student.skill,
          registrationStatus:
            student.registrationStatus,
        },
      });
    } catch (error) {
      console.error(
        "REGISTRATION ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        status: "Error",
        message:
          "Registration failed",
        error: error.message,
      });
    }
  }
);


//admin pending registration
// ============================================
// GET PENDING STUDENTS
// GET /api/students/pending
// ============================================

router.get("/pending", async (req, res) => {
  try {
    const students = await Student.find({
      registrationStatus: "Pending",
    })
      .select("-password")
      .sort({ registeredAt: -1 });

    console.log(
      "================================"
    );

    console.log(
      "PENDING STUDENTS:",
      students.length
    );

    students.forEach((student) => {
      console.log(
        student.name,
        "|",
        student.email,
        "|",
        student.registrationStatus
      );
    });

    console.log(
      "================================"
    );

    return res.status(200).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    console.error(
      "PENDING STUDENTS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch pending students",
    });
  }
});

//admin accept button - approve 
// PUT /api/students/:id/approve

router.put("/:id/approve", async (req, res) => {
  try {
    const student = await Student.findById(
      req.params.id
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    // =================================================
    // UPDATE DATABASE
    // =================================================

    student.registrationStatus = "Approved";

    // Approved student should be active
    student.status = "Active";

    student.registrationMessage =
      "Your registration has been approved by admin. You can now login.";

    await student.save();

    // =================================================
    // SEND APPROVAL EMAIL
    // =================================================

    try {
      await transporter.sendMail({
        from: emailUser,

        to: student.email,

        subject: "EduHire Registration Approved",

        html: `
          <div style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: auto;
            padding: 30px;
            border: 1px solid #ddd;
            border-radius: 10px;
          ">

            <h2 style="color: #696cff;">
              EduHire
            </h2>

            <h3>
              Registration Approved
            </h3>

            <p>
              Hello <strong>${student.name}</strong>,
            </p>

            <p>
              Congratulations! Your student registration
              has been
              <strong style="color: green;">
                approved
              </strong>
              by the admin.
            </p>

            <p>
              You can now login to your EduHire account
              using your registered email and password.
            </p>

            <div style="
              background: #f5f5f9;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
            ">

              <p>
                <strong>Student ID:</strong>
                ${student.studentId}
              </p>

              <p>
                <strong>Name:</strong>
                ${student.name}
              </p>

              <p>
                <strong>Department:</strong>
                ${student.department}
              </p>

              <p>
                <strong>Skill:</strong>
                ${student.skill || "N/A"}
              </p>

              <p>
                <strong>Status:</strong>
                <span style="color: green;">
                  Approved
                </span>
              </p>

            </div>

            <p>
              Please do not reply for any queries.
              Reach out to your college placement cell.
            </p>

            <p>
              Thank you for registering with EduHire.
            </p>

            <p>
              Best Regards,<br />
              <strong>EduHire Admin Team</strong>
            </p>

          </div>
        `,
      });

      console.log(
        "APPROVAL EMAIL SENT TO:",
        student.email
      );
    } catch (emailError) {
      console.error(
        "APPROVAL EMAIL ERROR:",
        emailError.message
      );
    }

    // =================================================
    // RESPONSE
    // =================================================

    res.status(200).json({
      success: true,

      message:
        "Student approved successfully.",

      student: student,
    });
  } catch (error) {
    console.error(
      "APPROVE STUDENT ERROR:",
      error
    );

    res.status(500).json({
      success: false,

      message:
        "Unable to approve student.",

      error: error.message,
    });
  }
});


//admin reject application 

// PUT /api/students/:id/reject

router.put("/:id/reject", async (req, res) => {
  try {
    const { id } = req.params;

    console.log("================================");
    console.log("REJECT REQUEST");
    console.log("Student ID:", id);
    console.log("================================");

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID",
        id
      });
    }

    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
        id
      });
    }

    student.registrationStatus = "Rejected";

    student.registrationMessage =
      "Your registration has been rejected by admin.";

    await student.save();

    console.log(
      "STUDENT REJECTED:",
      student._id
    );

    // =================================================
    // SEND REJECTION EMAIL
    // =================================================

    try {
      await transporter.sendMail({
        from: emailUser,

        to: student.email,

        subject: "EduHire Registration Rejected",

        html: `
          <div style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: auto;
            padding: 30px;
            border: 1px solid #ddd;
            border-radius: 10px;
          ">

            <h2 style="color: #696cff;">
              EduHire
            </h2>

            <h3>
              Registration Rejected
            </h3>

            <p>
              Hello <strong>${student.name}</strong>,
            </p>

            <p>
              We regret to inform you that your student registration
              has been
              <strong style="color: red;">
                rejected
              </strong>
              by the administrator.
            </p>

            <p>
              Please contact your college placement cell for more details or to resolve any discrepancies.
            </p>

            <div style="
              background: #f5f5f9;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
            ">

              <p>
                <strong>Student ID:</strong>
                ${student.studentId}
              </p>

              <p>
                <strong>Name:</strong>
                ${student.name}
              </p>

              <p>
                <strong>Department:</strong>
                ${student.department}
              </p>

              <p>
                <strong>Status:</strong>
                <span style="color: red;">
                  Rejected
                </span>
              </p>

            </div>

            <p>
              Please do not reply to this email. For any queries, please reach out to your college placement cell.
            </p>

            <p>
              Best Regards,<br />
              <strong>EduHire Admin Team</strong>
            </p>

          </div>
        `,
      });

      console.log(
        "REJECTION EMAIL SENT TO:",
        student.email
      );
    } catch (emailError) {
      console.error(
        "REJECTION EMAIL ERROR:",
        emailError.message
      );
    }

    return res.status(200).json({
      success: true,
      message: "Student rejected successfully",
      student
    });

  } catch (error) {

    console.error("================================");
    console.error("REJECT STUDENT ERROR");
    console.error(error);
    console.error("================================");

    return res.status(500).json({
      success: false,
      message: "Unable to reject student",
      error: error.message
    });
  }
});

//resume upload route
router.put(
  "/:id/resume",
  uploadSingleResume,
  async (req, res) => {

    try {

      console.log("================================");
      console.log("RESUME UPLOAD REQUEST");
      console.log("Student ID:", req.params.id);
      console.log("File:", req.file);
      console.log("================================");

      if (!req.file) {

        return res.status(400).json({
          message: "Resume file was not received"
        });

      }

      const student =
        await Student.findById(req.params.id);

      if (!student) {

        return res.status(404).json({
          message: "Student not found"
        });

      }

      // Delete old resume
      if (student.resume) {

        const oldResumePath =
          path.join(
            uploadDir,
            student.resume
          );

        if (
          fs.existsSync(oldResumePath)
        ) {

          fs.unlinkSync(
            oldResumePath
          );

        }

      }

      // Store new resume filename
      student.resume =
        req.file.filename;

      await student.save();

      console.log(
        "Resume saved:",
        req.file.filename
      );

      res.status(200).json({

        message:
          "Resume updated successfully",

        resume:
          req.file.filename

      });

    } catch (error) {

      console.error(
        "RESUME UPLOAD ERROR:",
        error
      );

      res.status(500).json({

        message:
          "Resume upload failed",

        error:
          error.message

      });

    }

  }
);

//view
router.get("/:id/resume", async (req, res) => {

  try {

    const student =
      await Student.findById(req.params.id);

    if (!student || !student.resume) {
      return res.status(404).send(
        "Resume not found"
      );
    }

    const filePath = path.join(
        uploadDir,
        student.resume
      );

      console.log(
        "Opening resume:",
        filePath
      );

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          message: "Resume file not found"
        });
      }


    res.sendFile(filePath);
    

  } catch (error) {

    console.error(error);

    res.status(500).send(
      "Unable to view resume"
    );

  }

});


//download
router.get("/:id/resume/download", async (req, res) => {

  try {

    const student =
      await Student.findById(req.params.id);

    if (!student || !student.resume) {
      return res.status(404).send(
        "Resume not found"
      );
    }

    const filePath = path.join(
      __dirname,
      "..",
      "uploads",
      student.resume
    );

    res.download(
      path.resolve(filePath),
      student.resume
    );

  } catch (error) {

    console.error(error);

    res.status(500).send(
      "Unable to download resume"
    );

  }

});


//delete 
router.delete("/:id/resume", async (req, res) => {

  try {

    const student =
      await Student.findById(req.params.id);

    if (!student || !student.resume) {
      return res.status(404).json({
        message: "Resume not found"
      });
    }

    const filePath = path.join(
      __dirname,
      "..",
      "uploads",
      student.resume
    );

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    student.resume = null;

    await student.save();

    res.json({
      message: "Resume deleted successfully"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Unable to delete resume"
    });

  }

});


// GET PARTICULAR STUDENT PROFILE

router.get("/:studentId", async (req, res) => {
  try {
    const param = req.params.studentId;
    console.log("REQUEST STUDENT PARAM:", param);

    let student = null;

    // 1. Check by Mongo ObjectId if valid
    if (mongoose.Types.ObjectId.isValid(param)) {
      student = await Student.findById(param).select("-password");
    }

    // 2. Check by studentId field if not found
    if (!student) {
      student = await Student.findOne({
        studentId: param
      }).select("-password");
    }

    // 3. Check by email if not found
    if (!student) {
      student = await Student.findOne({
        email: param.toLowerCase()
      }).select("-password");
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    console.log("MATCHED STUDENT:", student.name);

    return res.status(200).json(student);

  } catch (error) {
    console.error("GET STUDENT PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

//student email 
router.get("/email/:email", async (req, res) => {
    try {

        const student = await Student.findOne({
            email: req.params.email
        });

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.json(student);

    } catch (error) {

        console.error("FETCH STUDENT BY EMAIL ERROR:", error);

        res.status(500).json({
            message: "Unable to fetch student"
        });

    }
});

// GET ALL REGISTERED STUDENTS
router.get("/", async (req, res) => {
  try {
    const students = await Student.find().select("-password");

    res.status(200).json(students);
  } catch (error) {
    console.error("GET STUDENTS ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch students",
      error: error.message
    });
  }
});

// PUT /api/students/:id/status
router.put("/:id/status", async (req, res) => {
  try {
    const { accountStatus } = req.body;

    if (!accountStatus || !["Active", "Blocked"].includes(accountStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid account status value. Allowed: Active, Blocked."
      });
    }

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found."
      });
    }

    student.accountStatus = accountStatus;
    await student.save();

    console.log(`Student ${student.email} status updated to ${accountStatus}`);

    return res.status(200).json({
      success: true,
      message: `Student status updated to ${accountStatus} successfully.`,
      student
    });
  } catch (error) {
    console.error("UPDATE STUDENT STATUS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update student status.",
      error: error.message
    });
  }
});

// UPDATE STUDENT PROFILE
// PUT /api/students/:id
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let student = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      student = await Student.findById(id);
    }
    if (!student) {
      student = await Student.findOne({ studentId: id });
    }
    if (!student) {
      student = await Student.findOne({ email: id.toLowerCase() });
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found."
      });
    }

    const {
      name,
      roll,
      department,
      mobile,
      address,
      dob,
      mark10,
      mark12,
      bachelorCgpa,
      masterCgpa,
      backlog,
      skill,
    } = req.body;

    if (name !== undefined) student.name = name.trim();
    if (roll !== undefined) student.roll = roll.trim();
    if (department !== undefined) student.department = department;
    if (mobile !== undefined) student.mobile = mobile;
    if (address !== undefined) student.address = address;
    if (dob !== undefined) student.dob = dob;
    if (mark10 !== undefined) student.mark10 = mark10;
    if (mark12 !== undefined) student.mark12 = mark12;
    if (bachelorCgpa !== undefined) student.bachelorCgpa = bachelorCgpa;
    if (masterCgpa !== undefined) student.masterCgpa = masterCgpa;
    if (backlog !== undefined) student.backlog = backlog;
    if (skill !== undefined) student.skill = typeof skill === "string" ? skill.trim() : skill;

    await student.save();

    console.log(`Student profile updated for: ${student.email} (Skill: ${student.skill})`);

    return res.status(200).json({
      success: true,
      message: "Student profile updated successfully.",
      student
    });
  } catch (error) {
    console.error("UPDATE STUDENT PROFILE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update student profile.",
      error: error.message
    });
  }
});

// DELETE /api/students/:id
router.delete("/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found."
      });
    }

    const studentId = student.studentId;
    const email = student.email;

    console.log(`================================`);
    console.log(`DELETING ALL DATA FOR STUDENT: ${email} (${studentId})`);
    console.log(`================================`);

    // 1. Delete uploaded files (resume, graduationMarksheet, masterMarksheet)
    const filesToDelete = [student.resume, student.graduationMarksheet, student.masterMarksheet];
    filesToDelete.forEach((fileName) => {
      if (fileName) {
        const filePath = path.join(uploadDir, fileName);
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Deleted file: ${filePath}`);
          }
        } catch (err) {
          console.error(`Failed to delete file: ${filePath}`, err.message);
        }
      }
    });

    // 2. Delete application records
    const appDeleteResult = await Application.deleteMany({
      $or: [
        { studentId: studentId },
        { studentEmail: email }
      ]
    });
    console.log(`Deleted applications: ${appDeleteResult.deletedCount}`);

    // 3. Delete login history records
    const loginDeleteResult = await Login.deleteMany({
      $or: [
        { id: studentId },
        { id: email }
      ]
    });
    console.log(`Deleted login records: ${loginDeleteResult.deletedCount}`);

    // 4. Delete OTP records
    const otpDeleteResult = await Otp.deleteMany({ email: email });
    console.log(`Deleted OTP records: ${otpDeleteResult.deletedCount}`);

    // 5. Delete student document
    await Student.findByIdAndDelete(req.params.id);
    console.log(`Deleted student document: ${email}`);

    return res.status(200).json({
      success: true,
      message: "Student and all associated data deleted successfully."
    });
  } catch (error) {
    console.error("DELETE STUDENT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to delete student and associated data.",
      error: error.message
    });
  }
});

module.exports = router;