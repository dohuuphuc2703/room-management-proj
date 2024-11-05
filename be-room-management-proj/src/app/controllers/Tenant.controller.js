const Tenant = require("../models/Tenant.model");
const User = require("../models/User.model");
const mongoose = require("mongoose");
const path = require("path");
const bcrypt = require("bcrypt");
const {upload} = require("../../config/multer/index");
const fs = require("fs");

class TenantController {
  // [POST] /api/tenant/change-password/
  async changePassword(req, res) {
    const uid = req.user.id;
    const { oldPassword, newPassword } = req.body;

    try {
      const session = await mongoose.startSession();
      session.startTransaction();

      // Tìm người dùng hiện tại
      const user = await User.findById(uid).session(session);
      if (!user) {
        return res.status(404).json({ message: "Người dùng không tồn tại" });
      }

      // Kiểm tra mật khẩu cũ
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Mật khẩu cũ không chính xác" });
      }

      // Mã hóa mật khẩu mới
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Cập nhật mật khẩu mới
      user.password = hashedNewPassword;
      await user.save({ session });

      await session.commitTransaction();
      session.endSession();

      return res
        .status(200)
        .json({ message: "Mật khẩu đã được thay đổi thành công" });
    } catch (error) {
      console.log(error);
      await session.abortTransaction();
      session.endSession();

      return res
        .status(500)
        .json({
          message: "Có lỗi xảy ra khi thay đổi mật khẩu",
          error: error.toString(),
        });
    }
  }
  // [GET] /api/candidate/info/
  async getInfo(req, res) {
    const uid = req.user.id;

    try {
      const tenant = await Tenant.findOne({ user: uid })
        .select("-__v")
        .populate({
          path: "user",
          select: "-updatedAt -password -hidden -__v",
        });

      return res.json({
        info: tenant,
      });
    } catch (error) {
      console.log(error);
      return res.json(500).json({
        message: error.toString(),
      });
    }
  }

  // [POST] /api/tenant/info/
  async updateInfo(req, res) {
    const uid = req.user.id;

    const info = req.body;

    try {
      const session = await mongoose.startSession();
      session.startTransaction();

      const tenant = await Tenant.findOneAndUpdate(
        { user: uid },
        { new: true }
      ).select("-__v");

      const user = await User.findOneAndUpdate(
        { _id: uid },
        {
          ...info,
        },
        { new: true }
      ).select("-updatedAt -password -role -hidden -__v");

      await session.commitTransaction();
      session.endSession();

      return res.json({
        info: {
          ...tenant.toObject(),
          user,
        },
      });
    } catch (error) {
      console.log(error);
      await session.abortTransaction();
      session.endSession();

      return res.json(500).json({
        message: error.toString(),
      });
    }
  }

  // [POST] /api/tenant/save-room
  async saveRoom(req, res) {
    const { uid } = req.user;
    const { roomId } = req.body;

    try {
      const updated = await Tenant.updateOne(
        { _id: uid },
        { $addToSet: { saveRooms: roomId } }
      );

      if (updated.modifiedCount > 0) {
        return res.status(200).json({ message: "Room saved successfully" });
      } else {
        return res.status(400).json({ message: "Room already saved" });
      }
    } catch (error) {
      console.error("Error saving room:", error);
      return res.status(500).json({ message: error.toString() });
    }
  }

  // [GET] /api/tenant/all-saved-room
  async getAllSavedRooms(req, res) {
    const { uid } = req.user;

    try {
      const saveRooms = await Tenant.findById(uid).populate({
        path: "saveRooms",
      });

      return res.json({
        saveRooms,
      });
    } catch (error) {
      console.log(error);
      return res.json(500).json({
        message: error.toString(),
      });
    }
  }

 // [POST] /api/tenant/upload-avatar/
async uploadAvatar(req, res) {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: "Lỗi khi upload ảnh", error: err.message });
    }

    try {
      const uid = req.user.id;

      // Kiểm tra xem có file không
      if (!req.file) {
        return res.status(400).json({ message: "Không tìm thấy file ảnh" });
      }

      // Tìm người dùng và lấy đường dẫn ảnh cũ
      const user = await User.findById(uid);
      if (!user) {
        return res.status(404).json({ message: "Người dùng không tồn tại" });
      }

      const oldAvatarUrl = user.avatar; // Lưu đường dẫn ảnh cũ
      const avatarUrl = `/uploads/avatars/${req.file.filename}`; // Đường dẫn URL ảnh mới

      // Cập nhật avatar URL trong tài liệu User
      user.avatar = avatarUrl;
      await user.save();

      // Xóa file cũ nếu có
      if (oldAvatarUrl) {
        const oldAvatarPath = path.join(process.cwd(), 'public', oldAvatarUrl); // Tạo đường dẫn file cũ
        fs.unlink(oldAvatarPath, (unlinkErr) => {
          if (unlinkErr) {
            console.error("Không thể xóa ảnh cũ:", unlinkErr);
          }
        });
      }

      return res.status(200).json({ avatar: avatarUrl });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Lỗi server", error: error.toString() });
    }
  });
}
}

module.exports = new TenantController();
