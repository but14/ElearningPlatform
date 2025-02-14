const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");

const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 5 * 60,
  },
});

//function to send email
async function sendVerificationEmail(email, otp) {
  try {
    const mailResponse = mailSender(email, "Email xác minh từ Elerning", otp);
    console.log("Gửi thành công đến - ", email);
  } catch (error) {
    console.log("Lỗi khi gửi đến email - ", email);
    throw new error();
  }
}

//pre middleware

OTPSchema.pre("save", async function (next) {
  // console.log("New document saved to database");
  // Only send an email when a new document is created

  if (this.isNew) {
    await sendVerificationEmail(this.email, this.otp);
  }
  next();
});

module.exports = mongoose.model("OTP", OTPSchema);
