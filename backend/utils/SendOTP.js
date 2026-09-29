require("dotenv").config();
console.log("Email:", process.env.EMAIL_USER);
console.log("Password loaded:", !!process.env.EMAIL_PASSWORD);

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

async function sendOTP(email, otp) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Placement Portal OTP",
    text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
  });
}

module.exports = sendOTP;