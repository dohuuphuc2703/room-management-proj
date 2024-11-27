const express = require("express");

const router = express.Router();

const LandlordController = require("../app/controllers/Landlord.controller")
const { roleVerify } = require("../app/middlewares/roleMiddleware");

router.post("/info/", LandlordController.updateInfo);
router.get("/info/", LandlordController.getInfo);
router.get("/userinfo/:email", LandlordController.getUserInfoByEmail);
router.get("/rooms", LandlordController.getRoomsByLandlord);
router.get("/statistics", LandlordController.getAllStatistics);
router.get("/revenueStats", LandlordController.getRevenueStats);
module.exports = router;
