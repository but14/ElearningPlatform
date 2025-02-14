// AUTH , IS STUDENT , INSTRUCTOR, IS ADMIN,

const jwt = require("jsonwebtoken");
require("dotenv").config();

// ============ AUTH =================
// user Authentication by checking token validating =================
exports.auth = (req, res, next) => {
  try {
    const token =
      req.body?.token ||
      req.cookies?.token ||
      req.header("Authorization")?.replace("Bearer ", "");

    // if token is missing
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token bị mất",
      });
    }

    // verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = decoded; // add user to request object for further usage
    } catch (error) {
      console.log("Lỗi khi giải mã mã thông báo");
      console.log(error);
      return res.status(401).json({
        success: false,
        error: error.message,
        message: "Lỗi khi giải mã mã thông báo",
      });
    }

    // go to next middleware

    next();
  } catch (error) {
    console.log("Lỗi khi xác thực mã thông báo");
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi xác thực mã thông báo",
    });
  }
};

// ============ IS STUDENT =================
exports.isStudent = (req, res, next) => {
  try {
    // console.log('User data ->', req.user);
    if (req.user?.accountType != "Student") {
      return res.status(401).json({
        success: false,
        message: "Trang này chỉ truy cập dành cho sinh viên",
      });
    }

    // go to next middleware
    next();
  } catch (error) {
    console.log("Lỗi khi kiểm tra tính hợp lệ của người dùng với tài khoản");
    console.log(error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: "Lỗi khi kiểm tra tính hợp lệ của người dùng với tài khoản",
    });
  }
};

// ============ IS INSTRUCTOR =================
exports.isInstructor = (req, res, next) => {
  try {
    if (req.user?.accountType != "Instructor") {
      return res.status(401).json({
        success: false,
        message: "Trang này chỉ truy cập dành cho giảng viên",
      });
    }

    //go to middleware
    next();
  } catch (error) {
    console.log("Lỗi khi kiểm tra tính hợp lệ của người dùng với tài khoản");
    console.log(error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: "Lỗi khi kiểm tra tính hợp lệ của người dùng với tài khoản",
    });
  }
};

// ============ IS ADMIN =================
exports.isAdmin = (req, res, next) => {
  try {
    if (req.user?.accountType != "Admin") {
      return res.status(401).json({
        success: false,
        message: "Trang này chỉ truy cập dành cho quản trị viên",
      });
    }
    // go to middleware
    next();
  } catch (error) {
    console.log("Lỗi khi kiểm tra tính hợp lệ của người dùng với tài khoản"),
      console.log(error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: "Lỗi khi kiểm tra tính hợp lệ của người dùng với tài khoản",
    });
  }
};
