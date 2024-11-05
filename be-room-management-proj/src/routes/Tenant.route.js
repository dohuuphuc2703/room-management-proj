const express = require("express");

const router = express.Router();

const TenantController = require("../app/controllers/Tenant.controller")
const { roleVerify } = require("../app/middlewares/roleMiddleware");
const { verifyJwt } = require("../app/middlewares/jwtMiddleware");

router.post("/info/", TenantController.updateInfo);
router.post("/update-avatar/", TenantController.uploadAvatar);
router.get("/info/", TenantController.getInfo);
router.get("/all-saved-rooms/", TenantController.getAllSavedRooms);
router.post("/save-room/", TenantController.saveRoom);
router.post('/change-password', verifyJwt, TenantController.changePassword);

module.exports = router;