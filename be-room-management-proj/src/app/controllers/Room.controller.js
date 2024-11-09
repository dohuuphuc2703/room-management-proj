const Room = require("../models/Room.model");

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
          select: "email fullName phone avatar online onlineAt" // Chỉ lấy các trường mong muốn
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
        conditions['address.province'] = province; // Sử dụng đường dẫn để truy cập trường tỉnh trong address
      }
  
      // Thêm điều kiện cho quận
      if (district) {
        conditions['address.district'] = district; // Sử dụng đường dẫn để truy cập trường quận trong address
      }
  
      // Thêm điều kiện cho phường
      if (ward) {
        conditions['address.ward'] = ward; // Sử dụng đường dẫn để truy cập trường phường trong address
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
          select: "email fullName phone avatar online onlineAt", // Chỉ lấy các trường mong muốn
        });
  
      return res.json({
        rooms,
        conditions:conditions,
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
        conditions['address.province'] = province; // Sử dụng đường dẫn để truy cập trường tỉnh trong address
      }
  
      // Thêm điều kiện cho quận
      if (district) {
        conditions['address.district'] = district; // Sử dụng đường dẫn để truy cập trường quận trong address
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
        select: "email fullName phone avatar online onlineAt", // Chỉ lấy các trường mong muốn
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
          select: "email fullName phone avatar online onlineAt" // Chỉ lấy các trường mong muốn
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
      const room = await Room.findOneAndUpdate(
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
        info: room,
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
    const userId = req.user.id;
    
    try {
      const room = await Room.create({
        ...info,
        landlord: userId,
      });

      return res.json({
        room: room 
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: error.toString(),
      });
    }
  }

  // [DELETE] /api/room/delete
  async deleteRoom(req, res) {
    const { rooms } = req.body;
    try {
      await Room.deleteMany({
        _id: { $in: rooms },
      });

      return res.sendStatus(200);
    } catch (error) {
      console.log(error);
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
  // [GET] /api/room/by-landlord/:landlordId
  async getRoomsByLandlord(req, res) {
    const landlordId = req.user.id;
  
    try {
      const rooms = await Room.find({ landlord: landlordId})
        .sort({ createdAt: -1 })
        .select("-__v -updatedAt -hiddenAt -hiddenBy")
        .populate("category")
        // .populate({
        //   path: "landlord",
        //   select: "email fullName phone avatar online onlineAt",
        // });
  
      return res.json({ 
        rooms }
      );
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: error.toString(),
      });
    }
  }


}

module.exports = new RoomController();

