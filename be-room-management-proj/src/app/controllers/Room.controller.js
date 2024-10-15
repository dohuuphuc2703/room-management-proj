const  Room = require('../models/Room.model');

class RoomController {
    //[GET] /api/room/suggestion?page=<number>&size=<number>
    async getAllRooms(req, res) {
        const { page=1, size=0 } = req.query;
    
        try {
            const total = await Room.countDocuments();
            const rooms = await Room.find({
                hidden: false,
            }).sort({ createdAt: -1 })
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

    // [GET] api/room/search?q=<string>&location=<string>&category=<ObjectId>&page=<number>&size=<number>
    async searchRooms(req, res) {
        const { page=1, size=0, q=null, location=null, category=null } = req.query;
        console.log(q);
        
        try {
            const conditions = {};
            if (q)
                conditions.title = { $regex: q, $options: 'i' };
            if (location)
                conditions.locations = { $elemMatch: { province: location } };
            if (category)
                conditions.categories = category;
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
}

module.exports = new RoomController();