const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// console.log("EMAIL USER:", process.env.EMAIL_USER);
// console.log(
//   "EMAIL PASSWORD:",
//   process.env.EMAIL_PASS ? "LOADED" : "NOT LOADED"
// );
const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use("/uploads", express.static("uploads"));

// MongoDB & Seeding
const ApplicationStatus = require("./models/status");
const Application = require("./models/application");

async function seedStatuses() {
  try {
    const defaultStatuses = [
      { statusId: 1, applicationStatus: "Applied", description: "Application submitted successfully by student" },
      { statusId: 2, applicationStatus: "Shortlisted", description: "Student shortlisted for further evaluation and interview" },
      { statusId: 3, applicationStatus: "Selected", description: "Student selected for job offer" },
      { statusId: 4, applicationStatus: "Rejected", description: "Application was not selected" },
    ];

    for (const item of defaultStatuses) {
      await ApplicationStatus.updateOne(
        { statusId: item.statusId },
        { $set: { applicationStatus: item.applicationStatus, description: item.description } },
        { upsert: true }
      );
    }
    console.log("✅ Application statuses database table initialized.");

    // Migrate existing application records if statusId is missing
    const statusMap = {
      "Applied": 1,
      "Shortlisted": 2,
      "Selected": 3,
      "Rejected": 4
    };

    const rawCollection = mongoose.connection.collection("applications");
    const rawApps = await rawCollection.find().toArray();
    for (const rawApp of rawApps) {
      if (rawApp.statusId === undefined || rawApp.statusId === null) {
        const mappedId = statusMap[rawApp.status] || 1;
        await rawCollection.updateOne(
          { _id: rawApp._id },
          { $set: { statusId: mappedId } }
        );
      }
    }
  } catch (err) {
    console.error("Status table seed/migration error:", err);
  }
}

mongoose
  .connect("mongodb://127.0.0.1:27017/college_placement")
  .then(() => {
    console.log("MongoDB connected");
    seedStatuses();
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

// Routes
const authRoutes = require("./routes/AuthRoutes");
const studentRoutes = require("./routes/StudentRoutes");
const companyRoutes = require("./routes/CompanyRoutes");
const driveRoutes = require("./routes/DriveRoutes");
const applicationRoutes = require("./routes/ApplicationRoutes");
const statusRoutes = require("./routes/StatusRoutes");
const reportRoutes = require("./routes/ReportRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/drives", driveRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/statuses", statusRoutes);
app.use("/api/application-status", statusRoutes);
app.use("/api/reports", reportRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});