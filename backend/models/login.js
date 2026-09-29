const mongoose = require("mongoose");

const loginSchema = new mongoose.Schema({
  loginId: {
    type: Number,
    required: true,
  },

  id: {
    type: String,
    required: true,
  },

  userType: {
    type: String,
    enum: ["Student", "Admin"],
    default: "Student",
  },

  loginTime: {
    type: String,
    required: true,
  },
}, { timestamps: true });

module.exports =
  mongoose.models.Login ||
  mongoose.model("Login", loginSchema);