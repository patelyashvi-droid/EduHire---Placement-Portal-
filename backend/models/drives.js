const mongoose = require("mongoose");

const driveSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: true,
      trim: true
    },

    role: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true
    },

    eligibility_criteria: {
      type: String,
      required: true
    },

    package: {
      type: String,
      required: true
    },

    drive_date: {
      type: String,
      required: true
    },

    last_date: {
      type: String,
      required: true
    },

    location: {
      type: String,
      required: true
    },

    // Status will now be stored in MongoDB
    driveStatus: {
      type: String,
      enum: ["Upcoming", "Scheduled", "Completed"],
      default: "Scheduled"
    },

    applicants: {
      type: Number,
      default: 0
    }
  },

  {
    timestamps: true
  }
);

module.exports = mongoose.model("Drive", driveSchema);