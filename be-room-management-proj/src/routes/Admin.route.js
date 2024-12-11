const express = require("express");

const router = express.Router();

const AdminController = require("../app/controllers/Admin.controller")
const { verifyJwt } = require("../app/middlewares/jwtMiddleware");

router.get("/tenant-stats", AdminController.getMonthlyTenantStats);
router.get("/landlord-stats", AdminController.getMonthlyLandlordStats);
router.get("/room-stats", AdminController.getRoomStatsByMonth);
router.get("/landlords", AdminController.getLandlords);
router.put("/user/block/:uid", AdminController.blockUser);
router.put("/user/unlock/:uid", AdminController.unlockUser);
router.get("/list-tenant", AdminController.getListTenant);
router.get("/list-category", AdminController.getListCategory);
router.post("/new-category", AdminController.createCategory);

module.exports = router;