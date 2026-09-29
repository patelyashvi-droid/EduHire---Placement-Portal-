const express = require("express");
const router = express.Router();
const ApplicationStatus = require("../models/status");

// GET /api/statuses - Get all status records
router.get("/", async (req, res) => {
  try {
    const statuses = await ApplicationStatus.find().sort({ statusId: 1 });
    return res.status(200).json({
      success: true,
      statuses,
    });
  } catch (error) {
    console.error("GET STATUSES ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch status records",
      error: error.message,
    });
  }
});

// GET /api/statuses/:statusId - Get status by statusId
router.get("/:statusId", async (req, res) => {
  try {
    const { statusId } = req.params;
    const statusObj = await ApplicationStatus.findOne({ statusId: Number(statusId) });

    if (!statusObj) {
      return res.status(404).json({
        success: false,
        message: "Status record not found",
      });
    }

    return res.status(200).json({
      success: true,
      status: statusObj,
    });
  } catch (error) {
    console.error("GET STATUS BY ID ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch status record",
      error: error.message,
    });
  }
});

// POST /api/statuses - Add or update a status entry
router.post("/", async (req, res) => {
  try {
    const { statusId, applicationStatus, description } = req.body;

    if (!statusId || !applicationStatus || !description) {
      return res.status(400).json({
        success: false,
        message: "statusId, applicationStatus, and description are required",
      });
    }

    let statusRecord = await ApplicationStatus.findOne({ statusId: Number(statusId) });

    if (statusRecord) {
      statusRecord.applicationStatus = applicationStatus;
      statusRecord.description = description;
      await statusRecord.save();
    } else {
      statusRecord = new ApplicationStatus({
        statusId: Number(statusId),
        applicationStatus,
        description,
      });
      await statusRecord.save();
    }

    return res.status(200).json({
      success: true,
      message: "Status saved successfully",
      status: statusRecord,
    });
  } catch (error) {
    console.error("SAVE STATUS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to save status record",
      error: error.message,
    });
  }
});

module.exports = router;