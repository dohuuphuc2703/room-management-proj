const bcrypt = require("bcrypt");
const User = require("../../app/models/User.model");  // Import model User
const Admin = require("../../app/models/Admin.model"); // Import model Admin
const keys = require("../secrets/index");  // Import keys để lấy salt
const mongoose = require("mongoose");


async function checkAndCreateAdmin() {
  // Kiểm tra xem tài khoản admin đã tồn tại trong bảng User chưa
  const existingAdmin = await User.findOne({ email: process.env.ADMIN_NAME });

  if (!existingAdmin) {
    // Nếu chưa có tài khoản admin, tạo tài khoản mới với email admin@gmail.com
    const defaultAdmin = {
      email: process.env.ADMIN_NAME,
      password: process.env.ADMIN_PASSWORD, // mật khẩu mặc định
      role: "admin",
      fullName: "Admin",
      verifiedAt: new Date(), // Gán thời gian hiện tại
      hidden: false,
      // thêm các thông tin khác nếu cần
    };

    // Mã hóa mật khẩu cho tài khoản admin
    const hashedPassword = await bcrypt.hash(defaultAdmin.password, keys.BCRYPT_SALT_ROUND);
    defaultAdmin.password = hashedPassword;

    // Tạo tài khoản admin mới trong bảng User
    const newAdmin = new User(defaultAdmin);
    await newAdmin.save();

    // Tạo tài khoản admin trong bảng Admin
    const adminEntry = new Admin({
      user: newAdmin._id
    });
    await adminEntry.save();

    console.log("Tài khoản admin mặc định đã được tạo trong bảng User.");
    console.log("Tài khoản admin đã được liên kết và tạo trong bảng Admin.");
  } else {
    console.log("Tài khoản admin đã tồn tại.");
  }
}

module.exports = checkAndCreateAdmin;