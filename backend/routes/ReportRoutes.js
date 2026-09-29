const express = require("express");
const router = express.Router();
const Report = require("../models/report");

// POST /api/reports - Save generated report to database
router.post("/", async (req, res) => {
  try {
    const {
      reportId,
      driveId,
      total_applications,
      selected,
      rejected,
      shortlisted,
      report_generated_on
    } = req.body;

    if (!reportId || !driveId) {
      return res.status(400).json({
        success: false,
        message: "Report ID and Drive ID are required."
      });
    }

    const report = new Report({
      reportId,
      driveId,
      total_applications: Number(total_applications) || 0,
      selected: Number(selected) || 0,
      rejected: Number(rejected) || 0,
      shortlisted: Number(shortlisted) || 0,
      report_generated_on: report_generated_on ? new Date(report_generated_on) : new Date()
    });

    await report.save();

    console.log("Report saved successfully:", reportId);

    return res.status(201).json({
      success: true,
      message: "Report saved successfully",
      report
    });
  } catch (error) {
    console.error("SAVE REPORT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to save report",
      error: error.message
    });
  }
});

// GET /api/reports - Retrieve all saved reports
router.get("/", async (req, res) => {
  try {
    const reports = await Report.find().sort({ report_generated_on: -1 });
    return res.status(200).json(reports);
  } catch (error) {
    console.error("GET REPORTS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch reports",
      error: error.message
    });
  }
});

module.exports = router;
