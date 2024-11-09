const path = require("path");
const multer = require("multer");
const fs = require("fs");

const storageRoom = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "public/uploads/roomImages");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const fileName = `room-${req.user.id}-${Date.now()}${ext}`;
    cb(null, fileName);
  }
});


// Cấu hình multer để lưu file ảnh
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "public/uploads/avatars");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const fileName = `${req.user.id}-${Date.now()}${ext}`;
    cb(null, fileName);
  }
});


const uploadRoomImage = multer({
  storage: storageRoom,
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn kích thước file là 5MB
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Chỉ cho phép các định dạng ảnh .jpeg, .jpg, .png"));
    }
  }
}).single('roomImages');

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn kích thước file là 5MB
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Chỉ cho phép các định dạng ảnh .jpeg, .jpg, .png"));
    }
  }
}).single("avatar");



const uploadResume = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // < 10MB
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|docx|doc/;
    const allowedMimeTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mime = allowedMimeTypes.includes(file.mimetype);
    
    if (mime && extname)
      return cb(null, true);
    else
      return cb(new Error("Hệ thống chỉ hỗ trợ định dạng pdf, doc, docx"));
  }
});

module.exports = { upload, uploadRoomImage, uploadResume };
