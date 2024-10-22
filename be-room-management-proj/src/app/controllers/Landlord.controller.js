const Landlord = require("../models/Landlord.model");

class LandlordController {
    // [GET] /api/landlord/info/
    async getInfo(req, res) {
        const mid = req.user.id;

        try {
        const landlord = await Landlord.findOne({ user: mid }).select("-__v").populate({
            path: "user",
            select: "-updatedAt -password -role -hidden -__v"
        })

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

        const landlord = await Landlord.findOneAndUpdate({ user: mid }, 
            { new: true }).select("-__v")

        const user = await User.findOneAndUpdate({ _id: mid }, {
            ...info,
        }, { new: true }).select("-updatedAt -password -role -hidden -__v");

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
}

module.exports = new LandlordController;