const express = require("express");
const {uploadAvatar} = require("../config/multer/index");

const router = express.Router();

const TenantController = require("../app/controllers/Tenant.controller")
const { roleVerify } = require("../app/middlewares/roleMiddleware");
const { verifyJwt } = require("../app/middlewares/jwtMiddleware");

router.post("/info/", TenantController.updateInfo);
router.post("/update-avatar/",uploadAvatar.single('avatar'),  TenantController.uploadAvatar);
router.get("/info/", TenantController.getInfo);
router.get("/all-saved-rooms/", TenantController.getAllSavedRooms);
router.post("/save-room/", TenantController.saveRoom);
router.post("/remove-saved-room/", TenantController.removeSavedRoom);
router.post('/change-password', verifyJwt, TenantController.changePassword);
router.get("/list-friends", TenantController.getListFriends);


module.exports = router;