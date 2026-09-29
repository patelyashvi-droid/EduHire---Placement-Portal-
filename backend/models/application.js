const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      unique: true,
      required: true,
    },

    studentId: {
      type: String,
      required: true,
    },

    driveId: {
      type: String,
      required: true,
    },

    studentName: {
      type: String,
      required: true,
    },

    studentRoll: {
      type: String,
      required: true,
    },

    studentEmail: {
      type: String,
      required: true,
      lowercase: true,
    },

    companyName: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      required: true,
    },

    statusId: {
      type: Number,
      required: true,
      default: 1,
    },

    appliedDate: {
      type: String,
      default: function () {
        return new Date().toISOString().split("T")[0];
      },
    },

    appliedAt: {
      type: Date,
      default: Date.now,
    },

    notificationMessage: {
      type: String,
      default: "",
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.Application ||
  mongoose.model("Application", applicationSchema);
