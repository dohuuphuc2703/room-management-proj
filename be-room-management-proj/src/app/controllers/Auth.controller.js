const User = require("../models/User.model")
const Tenant = require("../models/Tenant.model")
const Landlord = require("../models/Landlord.model")
const Admin = require("../models/Admin.model")

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
            bcrypt.compare(password, user.password, async (err, result) =>{
                if(result){
                    const payload = {
                        id: user.id,
                        role: user.role,
                        fullName: user.fullName,
                        email: user.email,
                    }
    
                    switch (payload.role){
                        case "tenant":
                            const tenant = await Tenant.findOne({ user: user.id });
                            payload.uid = tenant.id;
                            break;
                        case "landlord":
                            const landlord = await Landlord.findOne({ user: user.id });
                            payload.uid = landlord.id;
                            break;
                        case "admin":
                            const admin = await Admin.findOne({ user: user.id });
                            payload.uid = admin.id;
                            break;
                    }
                    
                    let token = jwt.sign(payload, keys.jwtSecretKey, { expiresIn: "7d" });
                    
                    res.cookie("jwt", token, {
                        maxAge: 1000 * 60 * 60 * 24 * 7,
                        httpOnly: true,
                    });
    
                    return res.json({
                        ...payload,
                        avatar: user.avatar,
                      });
                } else {
                    return res.status(401).json({
                        message: "Email hoặc password không chính xác!",
                    });
                }
                
            });
        } else {
            return res.status(401).json({
                message: user
                  ? user.hidden
                    ? "Tài khoản của bạn đã bị vô hiệu hóa!"
                    : user.verifiedAt
                      ? "Email hoặc password không chính xác!"
                      : "Tài khoản của bạn chưa được xác minh"
                  : "Email hoặc password không chính xác!",
              });
        }
    }

    // [POST] /auth/sign-up
    async userRegister(req, res) {
        let info = req.body;
    
        if (info.password !== info["confirm-password"]) {
            return res.status(409).json({
                message: "Mật khẩu xác nhận không khớp!",
            });
        }
    
        await bcrypt
            .hash(info.password, keys.BCRYPT_SALT_ROUND)
            .then((hashPassword) => (info = { ...info, password: hashPassword }));
    
        const session = await mongoose.startSession();
        session.startTransaction();
    
        try {
            // Tạo user mới
            const newUser = (
                await User.create(
                    [
                        {
                            ...info,
                            role: info.role, // Giữ nguyên role từ request
                        },
                    ],
                    { session }
                )
            )[0];
    
            // Kiểm tra role và tạo document phù hợp
            if (info.role === "tenant") {
                await Tenant.create(
                    [
                        {
                            user: newUser.id,
                        },
                    ],
                    { session }
                );
            } else if (info.role === "landlord") {
                await Landlord.create(
                    [
                        {
                            user: newUser.id,
                        },
                    ],
                    { session }
                );
            }
    
            await session.commitTransaction();
            session.endSession();
    
            return res.sendStatus(200);
    
        } catch (error) {
            console.log(error);
            await session.abortTransaction();
            session.endSession();
    
            const msg = getErrorMessage(error);
            return res.status(500).json({
                message: msg,
            });
        }
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