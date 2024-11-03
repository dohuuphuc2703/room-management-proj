const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage();

const uploadImage = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // < 10MB
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|tiff|psd|pdf|ico|svg|ai|indd|raw/;
    const allowedMimeTypes  =  ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/tiff", 
      "image/psd", "image/pdf", "image/ico", "image/svg", "image/ai", "image/indd", "image/raw"];
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mime = allowedMimeTypes.includes(file.mimetype);

    if (mime && extname)
      return cb(null, true);
    else
      return cb(new Error("Hệ thống không hỗ trợ định dạng file này"))
  }
})

const uploadResume = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // < 10MB
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|docx|doc/;
    const allowedMimeTypes  =  ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mime = allowedMimeTypes.includes(file.mimetype);
    
    if (mime && extname)
      return cb(null, true);
    else
      return cb(new Error("Hệ thống chỉ hỗ trợ định dạng pdf, doc, dox"));
  }
})

module.exports = { uploadImage, uploadResume };