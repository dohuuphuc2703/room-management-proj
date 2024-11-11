const Landlord = require("../models/Landlord.model");
const User = require("../models/User.model");
const Room = require("../models/Room.model");
const Tenant = require("../models/Tenant.model");
class LandlordController {
  // [GET] /api/landlord/info/
  async getInfo(req, res) {
    const uid = req.user.id;

    try {
      const landlord = await Landlord.findOne({ user: uid })
        .select("-__v")
        .populate({
          path: "user",
          select: "-updatedAt -password -role -hidden -__v",
        });

      return res.json({
        info: landlord,
      });
    } catch (error) {
      console.log(error);
      return res.json(500).json({
        message: error.toString(),
      });
    }
  }

  // [POST] /api/landlord/info/
  async updateInfo(req, res) {
    const mid = req.user.id;

    const info = req.body;

    try {
      const session = await mongoose.startSession();
      session.startTransaction();

      const landlord = await Landlord.findOneAndUpdate(
        { user: mid },
        { new: true }
      ).select("-__v");

      const user = await User.findOneAndUpdate(
        { _id: mid },
        {
          ...info,
        },
        { new: true }
      ).select("-updatedAt -password -role -hidden -__v");

      await session.commitTransaction();
      session.endSession();

      return res.json({
        info: {
          ...landlord.toObject(),
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

  // [GET] /api/landlord/userinfo/:email
  async getUserInfoByEmail(req, res) {
    const email = req.params.email; // Sửa lại để lấy email từ req.params

    try {
      const tenant = await Tenant.findOne()
            .populate({
                path: 'user',
                match: { email: email }, // Filter based on the email field in the User document
                select: 'email fullName phone dob gender address role', // Select specific fields to return
            })
            .select("user");

      if (!tenant) {
        // Nếu không tìm thấy user, trả về lỗi 404
        return res.status(404).json({
          message: "User không tìm thấy với email này.",
        });
      }

      // Nếu tìm thấy user, trả về thông tin
      return res.json({
        info: tenant,
      });
    } catch (error) {
      // Nếu có lỗi xảy ra, chỉ gọi res.json một lần trong catch
      console.log(error);
      return res.status(500).json({
        message: error.toString(),
      });
    }
  }


  async getRoomsByLandlord(req, res) {
    const landlordId = req.user.uid;
    const status = 'available'; // Lấy status từ query params
    
    try {
      // Xây dựng điều kiện lọc
      const filter = { landlord: landlordId, status: status };
     
      const rooms = await Room.find(filter)
        .sort({ createdAt: -1 })
        .select("address title acreage price maxSize amenities category servicerooms")
        .populate("category")
      
  
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

module.exports = new LandlordController();
