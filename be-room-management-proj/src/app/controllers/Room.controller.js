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

  //[GET] /api/room/rating?page=<number>&size=<number>

  // [GET] api/room/search?q=<string>&address=<string>&category=<ObjectId>&page=<number>&size=<number>
  async searchRooms(req, res) {
    const {
      page = 1,
      size = 0,
      q = null,
      address = null,
      category = null,
    } = req.query;
    console.log(q);

    try {
      const conditions = {};
      if (q) conditions.title = { $regex: q, $options: "i" };
      if (address)
        conditions.address = { $elemMatch: { province: address } };
      if (category) conditions.category = category;
      const total = await Room.countDocuments(conditions);

      const rooms = await Room.find(conditions)
        .sort({ createdAt: -1 })
        .skip((page - 1) * size)
        .limit(size)
        .select("-__v -updatedAt -hiddenAt -hiddenBy")
        .populate("category");

      return res.json({
        rooms,
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

  // [GET] /api/room/info/:roomId
  async getRoomInfo(req, res) {
    const { roomId } = req.params;
    try {
      const room = await Room.findOne({
        _id: roomId,
        hidden: false,
      })
        .select("-__v -updatedAt -hiddenAt -hiddenBy")
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
}

module.exports = new RoomController();
