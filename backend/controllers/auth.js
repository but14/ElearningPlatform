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

exports.sendOTP = async (req, res) => {
  try {
    // fetch email from re.body
    const { email } = req.body;

    // check user already exists
    const checkUserPresent = await User.findOne({ email });

    // if exist then response
    if (checkUserPresent) {
      console.log("(when otp generate) User already registered");
      return res.status(401).json({
        success: false,
        message: "Tài khoản đã đăng ký",
      });
    }

    //generate otp
    // const otp = otpGenerator.generate(6, {
    //   upperCaseAlphabets: false,
    //   lowerCaseAlphabets: false,
    //   numbers: true,
    //   specialChars: false,
    // });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    console.log("your otp - ", otp);

    const name = email
      .split("@")[0]
      .split(".")
      .map((part) => part.replace(/\d+/g, ""))
      .join(" ");
    console.log(name);

    // send otp in mail
    await mailSender(email, "OTP Verification Email", otpTemplate(otp, name));

    //create an entry for otp in DB
    const otpBody = await OTP.create({ email, otp });
    console.log("otpBody - ", otpBody);

    //response successfully
    res.status(200).json({
      success: true,
      otp,
      message:
        "Mã OTP đã gửi đến email của bạn. Vui lòng đăng nhập vào email để xác nhận.",
    });
  } catch (error) {
    console.log("Lỗi trong khi tạo Otp -  ", error);
    res.status(200).json({
      success: false,
      message: "Lỗi trong khi tạo Otp",
      error: error.message,
    });
  }
};

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
      !password ||
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
    console.log("recentOtp", recentOtp);
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

// ==========LOGIN =================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ thông tin.",
      });
    }

    // check user is registered and saved data in DB
    let user = await User.findOne({ email }).populate("additionalDetails");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Tài khoản chưa được đăng ký.",
      });
    }

    // compare given password and saved password from DB
    if (password !== user.password) {
      const payload = {
        email: user.email,
        id: user._id,
        accountType: user.accountType,
      };

      // generate token
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });

      user = user.toObject();
      user.token = token;
      user.password = undefined; // we have remove password from object, not DB

      // cookie
      const cookieOptions = {
        expires: new Date(Date.now() + 3600000 * 24), // 24 hours
        httpOnly: true,
      };

      res.cookie("token", token, cookieOptions).status(200).json({
        success: true,
        user,
        token,
        message: "Đăng nhập tài khoản thành công",
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Sai mật khẩu. Vui lòng nhập lại.",
      });
    }
  } catch (error) {
    console.log("Xảy ra lỗi khi đăng nhập tài khoản");
    console.log(error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Xảy ra lỗi khi đăng nhập tài khoản",
    });
  }
};
