const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    companyId: {
      type:  String,
      unique: true,
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    website: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    contact: {
      type: String,
      default: "",
    },

    mobile: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.Company ||
  mongoose.model("Company", companySchema);