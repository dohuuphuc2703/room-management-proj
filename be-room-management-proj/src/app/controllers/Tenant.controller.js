const  Tenant = require('../models/Tenant.model');
const  User = require('../models/User.model');

class TenantController {
    // [GET] /api/candidate/info/
  async getInfo(req, res) {
    const uid = req.user.id;

    try {
      const tenant = await Tenant.findOne({ user: uid }).select("-__v").populate({
        path: "user",
        select: "-updatedAt -password -hidden -__v"
      })

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

      const tenant = await Tenant.findOneAndUpdate({ user: uid }, 
        { new: true }).select("-__v")

      const user = await User.findOneAndUpdate({ _id: uid }, {
        ...info,
      }, { new: true }).select("-updatedAt -password -role -hidden -__v");

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
      await Tenant.updateOne({
        _id: uid
      }, {
        $push: {
          saveRooms: roomId,
        }
      });

      return res.status(200);
    } catch (error) {
      console.log(error);
      return res.json(500).json({
        message: error.toString(),
      });
    }
  }

  // [GET] /api/tenant/all-saved-room
  async getAllSavedRooms(req, res) {
    const { uid } = req.user;

    try {
      const saveRooms = await Tenant.findById(uid).populate({
        path: "saveRooms"
      });
      
      return res.json({
        saveRooms,
      })
    } catch (error) {
      console.log(error);
      return res.json(500).json({
        message: error.toString(),
      });
    }
  }
}

module.exports = new TenantController;