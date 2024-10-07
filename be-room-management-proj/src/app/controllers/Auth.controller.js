const User = require("../models/User.model")

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");

const keys = require("../../config/secrets");

class AuthController {

    // [POST] /auth/login
    async loginWithPassword(req, res){
        const { email, password, role } = req.body;
        const user = await User.findOneAndUpdate(
          { email: email },
          {
            onlineAt: Date.now(),
          },
          { new: true }
        );

        if (
            user &&
            !user.hidden &&
            user.verifiedAt !== null &&
            user.role === role
        ){
            
        }
    }

    // [POST] /auth/sign-up
    async userRegister(req, res){

    }

    // [POST] /auth/send-email
    async sendEmail(req, res){

    }

    // [GET] /auth/logout
    async logout(req, res) {
    }

    // [GET] /auth/verify
    verifyEmail(req, res){

    }

    // [POST] /auth/navigation
    async navigation(req, res) {
    }

    
}

module.exports = new AuthController();