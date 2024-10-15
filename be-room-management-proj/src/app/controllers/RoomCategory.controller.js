const RoomCategory = require("../models/RoomCategory.model");

class RoomCategoryController {
    // [POST] /api/room-category/new
    async createRoomCategory(req, res) {
        const info = req.body;
        
        try {
        const roomCategory = await RoomCategory.create({
            ...info
        })

        return res.json({
            info: roomCategory,
        });
        } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: error.toString(),
        });
        }
    }

    // [GET] /api/room-category/all
    async getAllRoomCategories(req, res) {
        const info = req.body;
        
        try {
        const categories = await RoomCategory.find({});

        return res.json({
            categories,
        });
        } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: error.toString(),
        });
        }
    }
}

module.exports = new RoomCategoryController;