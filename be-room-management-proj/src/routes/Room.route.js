const express = require("express");

const router = express.Router();
const { verifyJwt } = require("../app/middlewares/jwtMiddleware");

const RoomController = require("../app/controllers/Room.controller");

router.get("/suggestion", RoomController.getAllRooms);
router.get("/byAddress", RoomController.getRoomsByAddressAndCat);
router.get("/search", RoomController.searchRooms);
router.get("/latest", RoomController.getLatestRooms);
router.get("/top-rated", RoomController.getTopRatedRooms);
router.get("/info/:roomId", RoomController.getRoomInfo);
router.post("/update/:roomId", RoomController.updateRoomInfo);
router.post("/addRoom",verifyJwt, RoomController.addRoom);
router.delete("/delete", RoomController.deleteRoom);
router.get("/by-landlord/:landlordId", RoomController.getRoomsByLandlord);

module.exports = router;