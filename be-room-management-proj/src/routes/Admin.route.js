const express = require("express");

const router = express.Router();

const AdminController = require("../app/controllers/Admin.controller")
const { verifyJwt } = require("../app/middlewares/jwtMiddleware");

router.get("/tenant-stats", AdminController.getMonthlyTenantStats);
router.get("/landlord-stats", AdminController.getMonthlyLandlordStats);
router.get("/room-stats", AdminController.getRoomStatsByMonth);
router.get("/landlords", AdminController.getLandlords);
router.put("/landlord/block/:landlordId", AdminController.blockLandlord);
router.put("/landlord/unlock/:landlordId", AdminController.unlockLandlord);

module.exports = router;