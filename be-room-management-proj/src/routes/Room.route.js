const express = require("express");

const router = express.Router();
const { roleVerify } = require("../app/middlewares/roleMiddleware");

const RoomController = require("../app/controllers/Room.controller");

router.get("/suggestion", RoomController.getAllRooms);
router.get("/search", RoomController.searchRooms);
router.get("/info/:roomId", RoomController.getRoomInfo);
router.post("/:roomID", RoomController.updateRoomInfo);
router.post("/addRoom", RoomController.addRoom);
router.delete("/delete", RoomController.deleteRoom);

module.exports = router;