const mongoose = require("mongoose");

const statusSchema = new mongoose.Schema(
  {
    statusId: {
      type: Number,
      unique: true,
      required: true,
    },
    applicationStatus: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.ApplicationStatus ||
  mongoose.model("ApplicationStatus", statusSchema);