const Otp = require("../models/otp");
const generateOTP = require("./GenerateOTP");
const sendOTP = require("./SendOTP");

async function createAndSendOTP(email, purpose) {
  const otp = generateOTP();

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await Otp.deleteMany({
    email: email,
    purpose: purpose,
  });

  await Otp.create({
    email: email,
    otp: otp,
    purpose: purpose,
    expiresAt: expiresAt,
  });

  await sendOTP(email, otp);

  return otp;
}

module.exports = createAndSendOTP;