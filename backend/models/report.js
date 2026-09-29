const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    reportId: {
      type: String,
      unique: true,
      required: true,
    },
    driveId: {
      type: String,
      required: true,
    },
    total_applications: {
      type: Number,
      required: true,
    },
    selected: {
      type: Number,
      required: true,
    },
    rejected: {
      type: Number,
      required: true,
    },
    shortlisted: {
      type: Number,
      required: true,
    },
    report_generated_on: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Report || mongoose.model("Report", reportSchema);
