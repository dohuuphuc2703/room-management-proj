const express = require("express");

const router = express.Router();

const AuthController = require("../app/controllers/Auth.controller")

router.post("/sign-up", AuthController.userRegister);

module.exports = router;