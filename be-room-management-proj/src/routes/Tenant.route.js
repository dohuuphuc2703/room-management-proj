const express = require("express");

const router = express.Router();

const TenantController = require("../app/controllers/Tenant.controller")
const { roleVerify } = require("../app/middlewares/roleMiddleware");
const { verifyJwt } = require("../app/middlewares/jwtMiddleware");

router.post("/info/", TenantController.updateInfo);
router.get("/info/",verifyJwt, TenantController.getInfo);
router.get("/all-saved-rooms/", TenantController.getAllSavedRooms);
router.post("/save-room/", TenantController.saveRoom);

module.exports = router;