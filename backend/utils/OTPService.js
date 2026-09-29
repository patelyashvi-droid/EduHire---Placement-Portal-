const Otp = require("../models/otp");
const { getTransporter } = require("./emailService");

const createAndSendOTP = async (email, purpose = "login") => {
  try {
    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const expiresAt = new Date(
      Date.now() + 5 * 60 * 1000
    );

    // Clean up old OTPs for this email and purpose
    await Otp.deleteMany({
      email,
      purpose,
    });

    // Create new OTP record
    await Otp.create({
      email,
      otp,
      purpose,
      expiresAt,
    });

    // Get the shared transporter
    const transporter = await getTransporter();
    if (!transporter) {
      throw new Error("Email transporter could not be initialized.");
    }

    const gmailUser = process.env.GMAIL_USER || process.env.EMAIL_USER || "placements@eduhire.edu";
    const sender = process.env.SENDER_EMAIL || `"EduHire Placement Portal" <${gmailUser}>`;

    const mailOptions = {
      from: sender,
      to: email,
      subject: "EduHire Login OTP",
      html: `
        <h2>EduHire Placement Portal</h2>
        <p>Your login OTP is:</p>
        <h1 style="font-size: 32px; font-weight: bold; letter-spacing: 2px; color: #2563eb;">${otp}</h1>
        <p>This OTP will expire in 5 minutes.</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📩 OTP sent successfully to ${email}`);

    // If using Ethereal sandbox, log preview URL
    const isRealSmtp = !!(process.env.GMAIL_USER || process.env.EMAIL_USER || (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS));
    if (!isRealSmtp) {
      const nodemailer = require("nodemailer");
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`🔗 Ethereal Test Email Preview URL: ${previewUrl}`);
      }
    }

    return true;
  } catch (error) {
    console.error("❌ CREATE AND SEND OTP ERROR:", error);
    throw error;
  }
};

module.exports = {
  createAndSendOTP,
};