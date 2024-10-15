const express = require("express");

const router = express.Router();

const AuthController = require("../app/controllers/Auth.controller")
const { verifyJwt } = require("../app/middlewares/jwtMiddleware");

router.post("/sign-up", AuthController.userRegister);
router.get("/verify", AuthController.verifyEmail);
router.post("/login", AuthController.loginWithPassword);
router.get("/logout", verifyJwt, AuthController.logout);
router.post("/send-mail", AuthController.sendEmail);

module.exports = router;