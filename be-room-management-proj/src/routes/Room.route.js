const express = require("express");

const router = express.Router();
const { verifyJwt } = require("../app/middlewares/jwtMiddleware");

const RoomController = require("../app/controllers/Room.controller");
const {uploadRoom} = require("../config/multer/index");

router.get("/suggestion", RoomController.getAllRooms);
router.get("/byAddress", RoomController.getRoomsByAddressAndCat);
router.get("/search", RoomController.searchRooms);
router.get("/latest", RoomController.getLatestRooms);
router.get("/top-rated", RoomController.getTopRatedRooms);
router.get("/info/:roomId", RoomController.getRoomInfo);
router.put("/update/:roomId", RoomController.updateRoomInfo);
router.post("/addRoom",verifyJwt, RoomController.addRoom);
router.delete("/delete/:roomId", RoomController.deleteRoom);
router.get("/by-landlord", verifyJwt, RoomController.getRoomsByLandlord);
router.post("/uploadImage", uploadRoom.single('image'), verifyJwt, RoomController.uploadRoomImageHandler)

module.exports = router;