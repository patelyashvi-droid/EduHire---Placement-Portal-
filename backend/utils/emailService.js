const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const nodemailer = require("nodemailer");

/**
 * Utility to send email notifications to student's registered email address.
 */
let transporter = null;
let isRealSmtp = false;

async function getTransporter() {
  if (transporter) return transporter;

  try {
    const gmailUser = process.env.GMAIL_USER || process.env.EMAIL_USER;
    const gmailPass = process.env.GMAIL_PASS || process.env.EMAIL_PASS;

    if (gmailUser && gmailPass) {
      transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
      });
      isRealSmtp = true;
      console.log(`📧 Gmail Transporter Initialized for ${gmailUser}`);
    } else if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587", 10),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      isRealSmtp = true;
      console.log(`📧 Custom SMTP Transporter Initialized (${process.env.SMTP_HOST})`);
    } else {
      // Fallback: Generate Ethereal Test SMTP Account for Development / Demonstration
      console.warn("⚠️ No real SMTP credentials found in backend/.env.");
      console.warn("⚠️ Using Ethereal Test SMTP sandbox. Real inbox delivery requires GMAIL_USER & GMAIL_PASS in backend/.env.");

      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      isRealSmtp = false;
      console.log("📧 Ethereal Test Email Account Initialized:", testAccount.user);
    }
  } catch (error) {
    console.error("Failed to initialize email transporter:", error.message);
  }

  return transporter;
}

/**
 * Send status update email to registered student
 */
async function sendApplicationStatusEmail({ studentEmail, studentName, companyName, role, status, message }) {
  if (!studentEmail) {
    console.warn("⚠️ Cannot send status email: Student email is missing.");
    return { success: false, message: "Student email is missing." };
  }

  try {
    const transport = await getTransporter();
    if (!transport) {
      console.warn("⚠️ Email transporter unavailable.");
      return { success: false, message: "Transporter unavailable" };
    }

    const isPositive = status === "Shortlisted" || status === "Selected";
    const statusColor = status === "Selected" ? "#10b981" : status === "Shortlisted" ? "#3b82f6" : status === "Rejected" ? "#ef4444" : "#f59e0b";
    const emoji = status === "Selected" ? "🏆" : status === "Shortlisted" ? "🌟" : status === "Rejected" ? "📋" : "⏳";

    const sender = process.env.GMAIL_USER
      ? `"EduHire Placement Portal" <${process.env.GMAIL_USER}>`
      : process.env.SENDER_EMAIL || '"EduHire Placement Portal" <placements@eduhire.edu>';

    const mailOptions = {
      from: sender,
      to: studentEmail,
      subject: `${emoji} Application Status Update: ${companyName} | ${role} - ${status}`,
      text: `Dear ${studentName || "Student"},\n\n` +
        `There is an update regarding your placement application.\n\n` +
        `Application Details:\n` +
        `- Company Name: ${companyName}\n` +
        `- Job Role: ${role}\n` +
        `- Application Status: ${status}\n\n` +
        `Message: ${message || `Your application for ${companyName} (${role}) is now ${status}.`}\n\n` +
        `Check your status here: http://localhost:5173/status\n\n` +
        `Best regards,\nPlacement Cell`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 620px; margin: 0 auto; padding: 20px; background-color: #f1f5f9; border-radius: 12px;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 28px 24px; text-align: center; border-radius: 12px 12px 0 0; color: #ffffff;">
            <h2 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">Placement Portal Notification</h2>
            <p style="margin: 6px 0 0 0; opacity: 0.85; font-size: 14px;">Official Application Update</p>
          </div>
          
          <!-- Content Body -->
          <div style="background-color: #ffffff; padding: 32px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
            <p style="font-size: 16px; color: #0f172a; margin-top: 0;">Dear <strong>${studentName || "Student"}</strong>,</p>

            <p style="font-size: 15px; color: #334155; line-height: 1.6;">
              This is an official update regarding your job application submitted through the Placement Portal.
            </p>

            <!-- Application Details Card / Table -->
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin: 24px 0;">
              <h4 style="margin: 0 0 14px 0; font-size: 14px; text-transform: uppercase; color: #64748b; letter-spacing: 0.8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
                📋 Application Details
              </h4>
              
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600; width: 140px;">Company Name:</td>
                  <td style="padding: 8px 0; color: #0f172a; font-weight: 700; font-size: 15px;">${companyName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Job Role:</td>
                  <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${role}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Application Status:</td>
                  <td style="padding: 8px 0;">
                    <span style="display: inline-block; background-color: ${statusColor}15; color: ${statusColor}; border: 1px solid ${statusColor}40; padding: 4px 12px; border-radius: 20px; font-weight: 700; font-size: 14px;">
                      ${emoji} ${status}
                    </span>
                  </td>
                </tr>
              </table>
            </div>

            <!-- Remarks / Message Box -->
            <div style="background-color: #f1f5f9; border-left: 4px solid ${statusColor}; padding: 16px; border-radius: 6px; margin-bottom: 24px;">
              <span style="display: block; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 4px;">Update Remarks</span>
              <p style="margin: 0; font-size: 14px; color: #1e293b; line-height: 1.5;">
                ${message || `Your application status for ${companyName} (${role}) has been updated to ${status}.`}
              </p>
            </div>

            ${isPositive ? `
              <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 14px 18px; border-radius: 8px; margin-bottom: 24px;">
                <p style="margin: 0; color: #047857; font-weight: 600; font-size: 14px;">
                  ✨ Congratulations! Please log in to your student portal to check schedules and further instructions.
                </p>
              </div>
            ` : ""}

            <!-- Portal Button -->
            <div style="text-align: center; margin-top: 28px; margin-bottom: 20px;">
              <a href="http://localhost:5173/status" style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 13px 30px; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);">
                View Application Status
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0 16px 0;" />
            <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
              This email was automatically generated for <strong>${studentEmail}</strong>. Please do not reply directly to this email.
            </p>
          </div>
        </div>
      `,
    };

    const info = await transport.sendMail(mailOptions);
    console.log(`✉️ EMAIL SENT SUCCESSFULLY to ${studentEmail}`);
    console.log(`✉️ Message ID: ${info.messageId}`);

    let previewUrl = null;
    if (!isRealSmtp) {
      previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`🔗 Ethereal Test Email Preview URL: ${previewUrl}`);
      }
    }

    return {
      success: true,
      messageId: info.messageId,
      isRealSmtp,
      previewUrl,
    };
  } catch (error) {
    console.error("❌ SEND APPLICATION STATUS EMAIL ERROR:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

module.exports = {
  sendApplicationStatusEmail,
  getTransporter,
};
