const express = require("express");

const router = express.Router();
const { roleVerify } = require("../app/middlewares/roleMiddleware");

const RoomCategoryController = require("../app/controllers/RoomCategory.controller");

router.post("/new", RoomCategoryController.createRoomCategory);
router.get("/all", RoomCategoryController.getAllRoomCategories);


module.exports = router;