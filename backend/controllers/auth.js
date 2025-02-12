// sendOtp, signup, login, changePassword
const User = require("./../models/user");
const Profile = require("./../models/profile");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const OTP = require("../models/otp");
require("dotenv").config();
const cookie = require("cookie");
const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
const otpTemplate = require("../mail/templates/emailVerificationTemplate");

//========SEND-OTP For Email Verification ===================

//========SIGN UP ===============

exports.signup = async (req, res) => {
  try {
    //extract data
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body;

    //validation
    if (
      !firstName ||
      !lastName ||
      !email ||
      !!password ||
      !confirmPassword ||
      !accountType ||
      !contactNumber ||
      !otp
    ) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ thông tin!",
      });
    }

    // check both pass matches or not
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu nhập lại không trùng khớp. Vui lòng nhập lại!",
      });
    }

    // check user have registered already
    const checkUserAlreadyExists = await User.findOne({ email });

    // if yes, then say to login
    if (checkUserAlreadyExists) {
      return res.status(400).json({
        success: false,
        message:
          "Email đã tồn tại trong hệ thống. Vui lòng đăng nhập hoặc tạo tài khoản mới!",
      });
    }

    // find most recent otp stored for user in DB
    const recentOtp = await OTP.findOne({ email }).sort({ createdAt: -1 });
    // console.log('recentOtp', recent Otp)
    // .sort({ createdAt: -1 }):
    // It's used to sort the results based on the createdAt field in descending order (-1 means descending).
    // This way, the most recently created OTP will be returned first.

    //if otp not found
    if (!recentOtp || recentOtp == 0) {
      return res.status(400).json({
        success: false,
        message: "OTP không hợp lệ. Vui lòng kiểm tra lại!",
      });
    } else if (otp !== recentOtp.otp) {
      // otp invalid
      return res.status(400).json({
        success: false,
        message: "OTP không hợp lệ. Vui lòng kiểm tra lại!",
      });
    }

    // hash password - secure password
    let hashedPassword = await bcrypt.hash(password, 10);

    // additionDetails
    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });

    let approved = "";
    approved = "Instructor" ? (approved = false) : (approved = true);

    //create entry in database
    const userData = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      accountType,
      contactNumber,
      accountType: accountType,
      approved: approved,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });

    // return success message
    res.status(200).json({
      success: true,
      message: "Đăng ký thành công!",
    });
  } catch (error) {
    console.log("Lỗi khi đăng ký tài khoản");
    console.log(error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Tài khoản chưa tồn tại, Vui lòng thử lại...!",
    });
  }
};
