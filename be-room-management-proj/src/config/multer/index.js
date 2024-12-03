const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// Cấu hình lưu trữ cho ảnh đại diện (avatars)
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  allowedFormats: ['jpg', 'png'],
  params: {
    folder: 'avatars',
  },
});

// Cấu hình lưu trữ cho ảnh phòng (rooms)
const roomStorage = new CloudinaryStorage({
  cloudinary,
  allowedFormats: ['jpg', 'png'],
  params: {
    folder: 'rooms',
  },
});


// Tạo middleware upload cho từng loại
const uploadAvatar = multer({ storage: avatarStorage });
const uploadRoom = multer({ storage: roomStorage });

// Export cả hai
module.exports = {
  uploadAvatar,
  uploadRoom,
};
