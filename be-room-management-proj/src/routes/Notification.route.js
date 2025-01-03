const express = require("express");

const router = express.Router();

const Notification = require("../app/controllers/Notification.controller")
const { roleVerify } = require("../app/middlewares/roleMiddleware");
const { verifyJwt } = require("../app/middlewares/jwtMiddleware");

router.get("/by-tenant", Notification.getNotifications);

module.exports = router;