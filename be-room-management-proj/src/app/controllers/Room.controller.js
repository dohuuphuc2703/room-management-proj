const Room = require("../models/Room.model");

const path = require("path");
const { uploadRoomImage } = require("../../config/multer/index");
const fs = require("fs");
const mongoose = require("mongoose");

class RoomController {
  //[GET] /api/room/suggestion?page=<number>&size=<number>
  async getAllRooms(req, res) {
    const { page = 1, size = 3 } = req.query;

    try {
      const total = await Room.countDocuments();
      const rooms = await Room.find({
        // hidden: false,
      })
        .sort({ createdAt: -1 })
        .skip((page - 1) * size)
        .limit(size)
        .select("-__v -updatedAt -hiddenAt -hiddenBy")
        .populate({
          path: "landlord",
          populate: {
            path: "user",
            select: "email fullName phone avatar online onlineAt", // Chỉ lấy các trường mong muốn
          },
        })
        .populate("category");

      return res.json({
        rooms,
        info: {
          total,
          page: Number(page),
          size: Number(size),
        },
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: error.toString(),
      });
    }
  }

  // [GET] api/room/search?q=<string>&address=<string>&category=<ObjectId>&page=<number>&size=<number>
  async searchRooms(req, res) {
    const {
      page = 1,
      size = 10, // Giá trị mặc định cho kích thước trang
      province = null, // Tỉnh
      district = null, // Quận
      ward = null, // Phường
      category = null, // Danh mục
      minArea = 0, // Giá trị mặc định cho diện tích tối thiểu
      maxArea = 100, // Giá trị mặc định cho diện tích tối đa
      minPrice = 0, // Giá trị mặc định cho giá tối thiểu
      maxPrice = 10000000, // Giá trị mặc định cho giá tối đa
    } = req.query;

    try {
      const conditions = {};

      // Thêm điều kiện cho tỉnh
      if (province) {
        conditions["address.province"] = province; // Sử dụng đường dẫn để truy cập trường tỉnh trong address
      }

      // Thêm điều kiện cho quận
      if (district) {
        conditions["address.district"] = district; // Sử dụng đường dẫn để truy cập trường quận trong address
      }

      // Thêm điều kiện cho phường
      if (ward) {
        conditions["address.ward"] = ward; // Sử dụng đường dẫn để truy cập trường phường trong address
      }

      // Thêm điều kiện cho danh mục
      if (category) {
        conditions.category = category;
      }

      // Thêm điều kiện cho diện tích
      if (minArea || maxArea) {
        conditions.acreage = { $gte: minArea, $lte: maxArea }; // Thay thế "acreage" với trường hợp đúng trong model của bạn
      }

      // Thêm điều kiện cho giá
      if (minPrice || maxPrice) {
        conditions.price = { $gte: minPrice, $lte: maxPrice }; // Thay thế "price" với trường hợp đúng trong model của bạn
      }

      const total = await Room.countDocuments(conditions);

      const rooms = await Room.find(conditions)
        .sort({ createdAt: -1 })
        .skip((page - 1) * size)
        .limit(size)
        .select("-__v -updatedAt -hiddenAt -hiddenBy")
        .populate("category")
        .populate({
          path: "landlord",
          populate: {
            path: "user",
            select: "email fullName phone avatar online onlineAt", // Chỉ lấy các trường mong muốn
          },
        });

      return res.json({
        rooms,
        conditions: conditions,
        info: {
          total,
          page,
          size,
        },
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: error.toString(),
      });
    }
  }

  // [GET] /api/room/byAddress
  async getRoomsByAddressAndCat(req, res) {
    const { province, district, category } = req.query; // Lấy province và district từ query parameters
    try {
      const conditions = {};

      // Thêm điều kiện cho tỉnh
      if (province) {
        conditions["address.province"] = province; // Sử dụng đường dẫn để truy cập trường tỉnh trong address
      }

      // Thêm điều kiện cho quận
      if (district) {
        conditions["address.district"] = district; // Sử dụng đường dẫn để truy cập trường quận trong address
      }

      if (category) {
        conditions.category = category;
      }
      const rooms = await Room.find(conditions)
        .sort({ createdAt: -1, rating: -1 })
        .select("-__v -updatedAt -hiddenAt -hiddenBy")
        .populate("category")
        .populate({
          path: "landlord",
          populate: {
            path: "user",
            select: "email fullName phone avatar online onlineAt", // Chỉ lấy các trường mong muốn
          },
        });

      return res.json({
        rooms: rooms, // Trả về danh sách các phòng
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: error.toString(), // Trả về thông báo lỗi
      });
    }
  }

  // [GET] /api/room/info/:roomId
  async getRoomInfo(req, res) {
    const { roomId } = req.params;
    try {
      const room = await Room.findOne({
        _id: roomId,
        // hidden: false,
      })
        .select("-__v -updatedAt -hiddenAt -hiddenBy")
        .populate({
          path: "landlord",
          populate: {
            path: "user",
            select: "email fullName phone avatar online onlineAt", // Chỉ lấy các trường mong muốn
          },
        })
        .populate("category");

      return res.json({
        info: room,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: error.toString(),
      });
    }
  }

  // [POST] /api/room/:roomId
  async updateRoomInfo(req, res) {
    const { roomId } = req.params;
    const info = req.body;
    try {
      // Lấy thông tin phòng hiện tại
      const room = await Room.findById(roomId).select(
        "-__v -updatedAt -hiddenAt -hiddenBy"
      );

      if (!room) {
        return res.status(404).json({
          message: "Phòng không tồn tại",
        });
      }
      if (!info.water) {
        info.water = room.water;
      } else {
        info.water.old =
          info.water.old !== undefined ? info.water.old : room.water.old;
        info.water.new =
          info.water.new !== undefined ? info.water.new : room.water.new;
      }

      if (!info.electric) {
        info.electric = room.electric;
      } else {
        info.electric.old =
          info.electric.old !== undefined
            ? info.electric.old
            : room.electric.old;
        info.electric.new =
          info.electric.new !== undefined
            ? info.electric.new
            : room.electric.new;
      }

      const updateRoom = await Room.findOneAndUpdate(
        {
          _id: roomId,
        },
        info,
        { new: true }
      )
        .select("-__v -updatedAt -hiddenAt -hiddenBy")
        .populate({
          path: "category",
        });

      return res.json({
        info: updateRoom,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: error.toString(),
      });
    }
  }

  // [POST] /api/room/add-room
  async addRoom(req, res) {
    const info = req.body;
    const userId = req.user.uid;

    try {
      const room = await Room.create({
        ...info,
        status: "available",
        landlord: userId,
      });

      return res.json({
        room: room,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: error.toString(),
      });
    }
  }
  // [DELETE] /api/room/delete/:roomId
  async deleteRoom(req, res) {
    const { roomId } = req.params; // Lấy ID phòng từ tham số URL

    // Kiểm tra nếu ID phòng hợp lệ
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({ message: "ID phòng không hợp lệ." });
    }

    try {
      // Tìm phòng theo ID
      const room = await Room.findById(roomId);

      // Kiểm tra nếu không tìm thấy phòng
      if (!room) {
        return res
          .status(404)
          .json({ message: "Không tìm thấy phòng để xóa." });
      }

      // Kiểm tra nếu trạng thái phòng không phải là 'available'
      if (room.status !== "available") {
        return res
          .status(400)
          .json({ message: "Phòng vẫn có người thuê, không thể xóa." });
      }

      // Tiến hành xóa phòng nếu trạng thái là 'available'
      await Room.findByIdAndDelete(roomId);

      // Trả về phản hồi thành công
      return res.status(200).json({ message: "Xóa phòng thành công." });
    } catch (error) {
      // Log lỗi và trả về lỗi
      console.error("Error deleting room:", error);
      return res.status(500).json({
        message: `Có lỗi xảy ra: Error code <${error.code}>`,
      });
    }
  }

  // [GET] /api/room/latest
  async getLatestRooms(req, res) {
    try {
      const latestRooms = await Room.find()
        .sort({ createdAt: -1 }) // Sort by createdAt in descending order
        .limit(6) // Limit to 6 results
        .select("-__v -updatedAt -hiddenAt -hiddenBy") // Exclude unnecessary fields
        .populate("category"); // Populate the category field

      return res.json({
        rooms: latestRooms,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: error.toString(),
      });
    }
  }
  // [GET] /api/room/top-rated
  async getTopRatedRooms(req, res) {
    try {
      const topRatedRooms = await Room.find()
        .sort({ rating: -1 }) // Sort by rating in descending order
        .limit(6) // Limit to 6 results
        .select("-__v -updatedAt -hiddenAt -hiddenBy") // Exclude unnecessary fields
        .populate("category"); // Populate the category field

      return res.json({
        rooms: topRatedRooms,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: error.toString(),
      });
    }
  }
  // [GET] /api/room/by-landlord
  async getRoomsByLandlord(req, res) {
    const landlordId = req.user.uid;
    const {
      status = null,
      page = 1,
      size = 10,
      province = null,
      category = null,
    } = req.query;

    try {
      const limit = parseInt(size, 10) || 10;
      const skip = (parseInt(page, 10) - 1) * limit;
      const conditions = { landlord: landlordId };

      // Thêm điều kiện cho tỉnh
      if (province) {
        conditions["address.province"] = province; // Sử dụng đường dẫn để truy cập trường tỉnh trong address
      }

      if (category) {
        conditions.category = category;
      }

      if (status) {
        conditions.status = status;
      }

      const total = await Room.countDocuments(conditions);

      const rooms = await Room.find(conditions)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-__v -updatedAt -hiddenAt -hiddenBy")
        .populate("category");

      return res.json({
        rooms,
        conditions: conditions,
        info: {
          total,
          page,
          size,
        },
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: error.toString(),
      });
    }
  }

  async uploadRoomImageHandler(req, res) {
    // Chạy middleware upload (lưu file ảnh vào thư mục)
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Không tìm thấy file ảnh" });
      }
      const imageURL = req.file;
      return res.json({
        roomImageUrl: imageURL.path,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: error.toString(),
      });
    }
  }
}

module.exports = new RoomController();
