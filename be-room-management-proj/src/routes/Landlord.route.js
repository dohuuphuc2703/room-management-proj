const express = require("express");


const router = express.Router();

const LandlordController = require("../app/controllers/Landlord.controller")
const { verifyJwt } = require("../app/middlewares/jwtMiddleware");
const {uploadAvatar} = require("../config/multer/index");

router.post("/info/", LandlordController.updateInfo);
router.get("/info/", LandlordController.getInfo);
router.get("/userinfo/:email", LandlordController.getUserInfoByEmail);
router.get("/rooms", LandlordController.getRoomsByLandlord);
router.get("/statistics", LandlordController.getAllStatistics);
router.get("/revenueStats", LandlordController.getRevenueStats);
router.get("/list-friends", LandlordController.getListFriends);
router.post("/update-avatar/",uploadAvatar.single('avatar'),  LandlordController.uploadAvatar);
router.post("/change-password", verifyJwt, LandlordController.changePassword);

module.exports = router;
