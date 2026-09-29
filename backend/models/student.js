const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      unique: true,
      required : true
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    roll: {
      type: String,
      required: true,
      trim: true,
    },

    department: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    dob: {
      type: String,
    },

    mobile: {
      type: String,
    },

    address: {
      type: String,
    },

    mark10: {
      type: Number,
    },

    mark12: {
      type: Number,
    },

    bachelorCgpa: {
      type: Number,
    },

    masterCgpa: {
      type: Number,
    },

    backlog: {
      type: Number,
      default: 0,
    },

    skill: {
      type: String,
      trim: true,
      default: "",
    },

    resume: {
      type: String,
      default: null,
    },

    graduationMarksheet: {
      type: String,
      default: null,
    },

    masterMarksheet: {
      type: String,
      default: null,
    },

    // IMPORTANT
    registrationStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    registrationMessage: {
      type: String,
      default:
        "Your registration is pending approval from admin.",
    },

    accountStatus: {
      type: String,
      enum: ["Active", "Blocked"],
      default: "Active",
    },

    registeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.Student ||
  mongoose.model("Student", studentSchema);