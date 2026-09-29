const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Application = require("../models/application");
const ApplicationStatus = require("../models/status");
const Student = require("../models/student");
const Drive = require("../models/drives");

const { sendApplicationStatusEmail } = require("../utils/emailService");

// Helper function to map & format application with status table details
async function populateApplicationStatus(appDoc) {
  if (!appDoc) return null;
  const appObj = appDoc.toObject ? appDoc.toObject() : { ...appDoc };

  const sId = Number(appObj.statusId) || 1;
  const statusRecord = await ApplicationStatus.findOne({ statusId: sId });

  if (statusRecord) {
    appObj.statusId = statusRecord.statusId;
    appObj.status = statusRecord.applicationStatus;
    appObj.applicationStatus = statusRecord.applicationStatus;
    appObj.description = statusRecord.description;
  } else {
    appObj.statusId = sId;
    appObj.status = "Applied";
    appObj.applicationStatus = "Applied";
    appObj.description = "Application submitted";
  }

  if (!appObj.department) {
    const studentCriteria = [];
    if (appObj.studentEmail) studentCriteria.push({ email: appObj.studentEmail.toLowerCase() });
    if (appObj.studentId) studentCriteria.push({ studentId: appObj.studentId });
    if (appObj.studentRoll) studentCriteria.push({ roll: appObj.studentRoll });

    if (studentCriteria.length > 0) {
      const student = await Student.findOne({ $or: studentCriteria });
      appObj.department = student ? (student.department || "N/A") : "N/A";
    } else {
      appObj.department = "N/A";
    }
  }

  return appObj;
}

async function populateApplicationsList(appDocs) {
  const statuses = await ApplicationStatus.find();
  const statusMap = new Map();
  statuses.forEach((s) => statusMap.set(s.statusId, s));

  const students = await Student.find().select("email studentId roll department");
  const studentMap = new Map();
  students.forEach((st) => {
    if (st.email) studentMap.set(st.email.toLowerCase(), st);
    if (st.studentId) studentMap.set(st.studentId, st);
    if (st.roll) studentMap.set(st.roll, st);
  });

  return appDocs.map((appDoc) => {
    const appObj = appDoc.toObject ? appDoc.toObject() : { ...appDoc };
    const sId = Number(appObj.statusId) || 1;
    const statusRecord = statusMap.get(sId);

    if (statusRecord) {
      appObj.statusId = statusRecord.statusId;
      appObj.status = statusRecord.applicationStatus;
      appObj.applicationStatus = statusRecord.applicationStatus;
      appObj.description = statusRecord.description;
    } else {
      appObj.statusId = sId;
      appObj.status = "Applied";
      appObj.applicationStatus = "Applied";
      appObj.description = "Application submitted";
    }

    const stRecord =
      (appObj.studentId && studentMap.get(appObj.studentId)) ||
      (appObj.studentEmail && studentMap.get(appObj.studentEmail.toLowerCase())) ||
      (appObj.studentRoll && studentMap.get(appObj.studentRoll));

    appObj.department = stRecord ? (stRecord.department || "N/A") : (appObj.department || "N/A");

    return appObj;
  });
}

// ============================================
// POST /api/applications - Student Apply to Drive
// ============================================
router.post("/", async (req, res) => {
  try {
    const { studentId, driveId } = req.body;

    console.log("APPLY REQUEST:", { studentId, driveId });

    if (!studentId || !driveId) {
      return res.status(400).json({
        success: false,
        message: "Student ID and Drive ID are required",
      });
    }

    // 1. Find Student
    let student = null;
    if (mongoose.Types.ObjectId.isValid(studentId)) {
      student = await Student.findById(studentId);
    }
    if (!student) {
      student = await Student.findOne({ studentId: studentId });
    }
    if (!student) {
      student = await Student.findOne({ email: studentId.toLowerCase() });
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // 2. Find Drive
    let drive = null;
    if (mongoose.Types.ObjectId.isValid(driveId)) {
      drive = await Drive.findById(driveId);
    }
    if (!drive) {
      drive = await Drive.findOne({ company: driveId });
    }

    if (!drive) {
      return res.status(404).json({
        success: false,
        message: "Placement drive not found",
      });
    }

    // 3. Check for existing application
    const existingApp = await Application.findOne({
      $or: [
        { studentEmail: student.email, driveId: drive._id.toString() },
        { studentId: student.studentId, driveId: drive._id.toString() },
        { studentEmail: student.email, companyName: drive.company, role: drive.role },
      ],
    });

    if (existingApp) {
      const formattedApp = await populateApplicationStatus(existingApp);
      return res.status(400).json({
        success: false,
        message: `You have already applied for ${drive.company} (${drive.role}).`,
        application: formattedApp,
      });
    }

    // 4. Generate unique application ID
    const appId = "APP" + Date.now() + Math.floor(Math.random() * 1000);
    const todayStr = new Date().toISOString().split("T")[0];

    // 5. Create new Application storing statusId = 1 (Applied)
    const application = new Application({
      applicationId: appId,
      studentId: student.studentId || student._id.toString(),
      driveId: drive._id.toString(),
      studentName: student.name,
      studentRoll: student.roll,
      studentEmail: student.email,
      companyName: drive.company,
      role: drive.role,
      statusId: 1,
      appliedDate: todayStr,
      appliedAt: new Date(),
      notificationMessage: `Application submitted for ${drive.company} (${drive.role}). Status: Applied`,
    });

    await application.save();

    // Increment drive applicants count
    drive.applicants = (drive.applicants || 0) + 1;
    await drive.save();

    // Send Confirmation Email Notification
    sendApplicationStatusEmail({
      studentEmail: student.email,
      studentName: student.name,
      companyName: drive.company,
      role: drive.role,
      status: "Applied",
      message: `Your job application for ${drive.company} (${drive.role}) has been submitted successfully!`,
    }).catch((err) => console.error("Email notification error:", err));

    console.log("APPLICATION CREATED SUCCESS:", appId);

    const formatted = await populateApplicationStatus(application);

    return res.status(201).json({
      success: true,
      message: `Applied successfully for ${drive.company}! Confirmation sent to ${student.email}.`,
      application: formatted,
    });
  } catch (error) {
    console.error("CREATE APPLICATION ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to submit application",
      error: error.message,
    });
  }
});

// ============================================
// GET /api/applications - Admin Get All Applications
// ============================================
router.get("/", async (req, res) => {
  try {
    const rawApps = await Application.find().sort({ appliedAt: -1 });
    const applications = await populateApplicationsList(rawApps);
    return res.status(200).json(applications);
  } catch (error) {
    console.error("GET APPLICATIONS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch applications",
      error: error.message,
    });
  }
});

// ============================================
// GET /api/applications/student/:studentId - Get Student Applications
// ============================================
router.get("/student/:studentId", async (req, res) => {
  try {
    const param = req.params.studentId;

    // Find student first to get email and studentId
    let student = null;
    if (mongoose.Types.ObjectId.isValid(param)) {
      student = await Student.findById(param);
    }
    if (!student) {
      student = await Student.findOne({ studentId: param });
    }
    if (!student) {
      student = await Student.findOne({ email: param.toLowerCase() });
    }

    const email = student ? student.email : param.toLowerCase();
    const sId = student ? student.studentId : param;

    const rawApps = await Application.find({
      $or: [
        { studentEmail: email },
        { studentId: sId },
        { studentId: param },
      ],
    }).sort({ appliedAt: -1 });

    const applications = await populateApplicationsList(rawApps);
    return res.status(200).json(applications);
  } catch (error) {
    console.error("GET STUDENT APPLICATIONS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch student applications",
      error: error.message,
    });
  }
});

// ============================================
// PUT /api/applications/:id/status - Admin Update Application Status
// Supports both statusId (number/string) AND status (string statusName)
// ============================================
router.put("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { statusId, status } = req.body;

    console.log("UPDATE STATUS REQUEST:", { id, statusId, status });

    // Lookup status from ApplicationStatus database table
    let statusRecord = null;
    if (statusId !== undefined && statusId !== null && statusId !== "") {
      statusRecord = await ApplicationStatus.findOne({ statusId: Number(statusId) });
    }

    if (!statusRecord && status) {
      // Map string status to statusRecord
      const regex = new RegExp(`^${status}$`, "i");
      statusRecord = await ApplicationStatus.findOne({ applicationStatus: regex });
    }

    if (!statusRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid status ID or status name provided.",
      });
    }

    // Find target application document
    let application = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      application = await Application.findById(id);
    }
    if (!application) {
      application = await Application.findOne({ applicationId: id });
    }

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Update application table with statusId
    application.statusId = statusRecord.statusId;

    const statusName = statusRecord.applicationStatus;

    // Generate Notification Message
    if (statusName === "Shortlisted") {
      application.notificationMessage = `🎉 Great news! You have been SHORTLISTED by ${application.companyName} for the ${application.role} position.`;
    } else if (statusName === "Selected") {
      application.notificationMessage = `🏆 Congratulations! You have been SELECTED by ${application.companyName} for the ${application.role} position!`;
    } else if (statusName === "Rejected") {
      application.notificationMessage = `Notice: Your application for ${application.companyName} (${application.role}) was not selected.`;
    } else {
      application.notificationMessage = `Application status for ${application.companyName} updated to ${statusName}.`;
    }

    application.isRead = false;
    await application.save();

    // Send Email Notification to Registered Student
    let emailResult = null;
    let recipientEmail = application.studentEmail;

    try {
      // Fetch latest registered email from Student collection if available
      const searchCriteria = [];
      if (application.studentId) searchCriteria.push({ studentId: application.studentId });
      if (application.studentEmail) searchCriteria.push({ email: application.studentEmail });
      if (application.studentRoll) searchCriteria.push({ roll: application.studentRoll });

      if (searchCriteria.length > 0) {
        const studentDoc = await Student.findOne({ $or: searchCriteria });
        if (studentDoc && studentDoc.email) {
          recipientEmail = studentDoc.email;
          if (application.studentEmail !== studentDoc.email) {
            application.studentEmail = studentDoc.email;
            await application.save();
          }
        }
      }

      emailResult = await sendApplicationStatusEmail({
        studentEmail: recipientEmail,
        studentName: application.studentName,
        companyName: application.companyName,
        role: application.role,
        status: statusName,
        message: application.notificationMessage,
      });
    } catch (err) {
      console.error("Async status update email error:", err);
    }

    console.log(
      `APPLICATION ${application.applicationId} STATUS UPDATED TO: ${statusName} (statusId: ${statusRecord.statusId}) & EMAIL DISPATCH RESULT:`,
      emailResult
    );

    const formattedApp = await populateApplicationStatus(application);

    return res.status(200).json({
      success: true,
      message: `Status updated to ${statusName} for ${application.studentName}! Notification email sent to ${recipientEmail}.`,
      application: formattedApp,
      emailSent: emailResult ? emailResult.success : false,
    });
  } catch (error) {
    console.error("UPDATE APPLICATION STATUS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update application status",
      error: error.message,
    });
  }
});

// ============================================
// GET /api/applications/notifications/:email - Get Student Status Notifications
// ============================================
router.get("/notifications/:email", async (req, res) => {
  try {
    const email = req.params.email.toLowerCase();
    const rawApps = await Application.find({
      studentEmail: email,
      statusId: { $in: [2, 3, 4] },
    }).sort({ updatedAt: -1 });

    const notifications = await populateApplicationsList(rawApps);
    return res.status(200).json(notifications);
  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch notifications",
      error: error.message,
    });
  }
});

// ============================================
// DELETE /api/applications/:id - Cancel/Delete Application
// ============================================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    let application = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      application = await Application.findById(id);
    }
    if (!application) {
      application = await Application.findOne({ applicationId: id });
    }

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Decrement drive applicants count
    const drive = await Drive.findById(application.driveId);
    if (drive) {
      drive.applicants = Math.max(0, (drive.applicants || 1) - 1);
      await drive.save();
    }

    // Delete application record
    await Application.deleteOne({ _id: application._id });

    console.log(`APPLICATION DELETED SUCCESS: ${id}`);

    return res.status(200).json({
      success: true,
      message: "Application canceled successfully.",
    });
  } catch (error) {
    console.error("DELETE APPLICATION ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to cancel application",
      error: error.message,
    });
  }
});

module.exports = router;
