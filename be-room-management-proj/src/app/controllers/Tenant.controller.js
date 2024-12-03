const Tenant = require("../models/Tenant.model");
const Chat = require("../models/Chat.model");
const Landlord = require("../models/Landlord.model");
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
  // [GET] /api/tenant/info/
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
  
  // [GET] /api/tenant/all-saved-rooms 
  async getAllSavedRooms(req, res) {
    const { uid } = req.user;
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit); // Default limit to 10 items per page

    try {
      const tenant = await Tenant.findById(uid).populate({
        path: "saveRooms",
        options: {
          skip: (page - 1) * limit,
          limit: limit,
        },
      });

      const totalSavedRooms = tenant.saveRooms.length; // Get the total number of saved rooms for this tenant
      const totalPages = Math.ceil(totalSavedRooms / limit);

      return res.json({
        saveRooms: tenant.saveRooms,
        totalPages,
        currentPage: page,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: error.toString(),
      });
    }
  }


  // [POST] /api/tenant/remove-saved-room/:roomId
  async removeSavedRoom(req, res) {
    const { uid } = req.user; // Lấy user ID từ middleware đã xác thực
    const { roomId } = req.body; // ID của phòng cần bỏ lưu
  
    try {
      const updated = await Tenant.updateOne(
        { _id: uid },
        { $pull: { saveRooms: roomId } } // Loại bỏ roomId khỏi mảng saveRooms
      );
  
      if (updated.modifiedCount > 0) {
        return res.status(200).json({ message: "Room removed from saved list successfully" });
      } else {
        return res.status(400).json({ message: "Room was not in the saved list" });
      }
    } catch (error) {
      console.error("Error removing saved room:", error);
      return res.status(500).json({ message: error.toString() });
    }
  }

 // [POST] /api/tenant/upload-avatar/
async uploadAvatar(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Không tìm thấy file ảnh" });
    }
    const imageURL = req.file
    return res.json({
      avatar: imageURL.path
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: error.toString(),
    });
  }
}
// [GET] /api/tenant/list/landlord
async getListFriends(req, res) {
  const uid = req.user.id; // Lấy ID người dùng từ req.user (giả sử đã xác thực)

  try {
    // Lấy danh sách các senderId và receiverId mà có liên quan đến người dùng hiện tại
    const senderIds = await Chat.find({
      $or: [{ senderId: uid }, { receiverId: uid }],
    }).distinct('senderId');

    const receiverIds = await Chat.find({
      $or: [{ senderId: uid }, { receiverId: uid }],
    }).distinct('receiverId');

    // Kết hợp hai danh sách và loại bỏ các giá trị trùng lặp
    const allChatUserIds = [...new Set([...senderIds, ...receiverIds])];

    // Loại bỏ ID của chính người dùng hiện tại
    const distinctChatUsers = allChatUserIds.filter(id => id.toString() !== uid.toString());

    // Lấy thông tin người dùng từ danh sách ID
    const users = await User.find({
      _id: { $in: distinctChatUsers },
    }).select('-password -createdAt -updatedAt -hiddenAt -hiddenBy'); // Loại bỏ các trường không cần thiết

    return res.json({
      users,
      info: {
        total: users.length,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: `Có lỗi xảy ra: Error code <${error.code}>`,
    });
  }
}
}

module.exports = new TenantController();
