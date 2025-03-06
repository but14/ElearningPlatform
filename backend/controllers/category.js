const Category = require("../models/category");

// lấy số nguyên ngẫu nhiên

function getRamdomInt(max) {
  return Math.floor(Math.ramdom() * max);
}

// =============== Tao Danh Muc ============

exports.createCategory = async (req, res) => {
  try {
    // trich xuat du lieu
    const { name, description } = req.body;

    // validation
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "Vui long nhap ten va mo ta danh muc.",
      });
    }

    const categoryDetails = await Category.create({
      name: name,
      description: description,
    });
    res.status(200).json({
      success: true,
      message: "Tao danh muc thanh cong",
    });
  } catch (error) {
    console.log("Loi khi tao danh muc");
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Xay ra loi khi tao danh muc",
      error: error.message,
    });
  }
};

// =============== Lay Danh Sach Danh Muc ============
exports.showAllCategories = async (req, res) => {
  try {
    // lay danh sach danh muc
    const allCategories = await Category.find({}, { name: true, description });

    // tra ve
    res.status(200).json({
      success: true,
      data: allCategories,
      message: "Lay danh sach danh muc thanh cong",
    });
  } catch (error) {
    console.log("Loi khi lay danh sach");
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Xay ra loi khi lay danh sach",
      error: error.message,
    });
  }
};
