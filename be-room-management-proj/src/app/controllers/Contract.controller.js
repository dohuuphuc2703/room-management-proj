const Contract = require("../models/Contract.model");
const Tenant = require("../models/Tenant.model");
const Room = require("../models/Room.model");
const Landlord = require("../models/Landlord.model");
const { createPDFFromHTML } = require("../services/CreatePDF");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const keys = require("../../config/secrets");
const mailer = require("../../utils/mail/index");
const bcrypt = require("bcrypt");

class ContractController {
  constructor() {
    this.createContract = this.createContract.bind(this);
    this.sendContractEmail = this.sendContractEmail.bind(this);
  }

  async createContract(req, res) {
    const landlord = req.user.uid;
    const { tenant, room, size, start_date, members } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // Kiểm tra xem tenant có tồn tại không
      const foundTenant = await Tenant.findById(tenant).populate({
        path: "user",
        select: "email fullName phone address", // Chỉ lấy các trường mong muốn
      });
      if (!foundTenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }

      // Kiểm tra xem landlord có tồn tại không
      const foundLandlord = await Landlord.findById(landlord).populate({
        path: "user",
        select: "email fullName phone address", // Chỉ lấy các trường mong muốn
      });
      if (!foundLandlord) {
        return res.status(404).json({ message: "Landlord not found" });
      }

      // Kiểm tra xem room có tồn tại không
      const foundRoom = await Room.findById(room);
      if (!foundRoom) {
        return res.status(404).json({ message: "Room not found" });
      }

      // Tạo hợp đồng nếu tất cả đều tồn tại
      const newContract = new Contract({
        tenant,
        landlord,
        room,
        size,
        start_date,
        status: "waiting",
        members,
      });

      await newContract.save({ session });

      // Tạo PDF từ HTML và lưu vào server
      const filename = await createPDFFromHTML(
        newContract,
        foundTenant,
        foundLandlord,
        foundRoom
      );
      const pdfPath = `/uploads/pdfContract/${filename}`;
      // Cập nhật trường linkPDF với đường dẫn của file PDF
      newContract.pdfPath = pdfPath;
      await newContract.save({ session }); // Lưu lại hợp đồng với linkPDF

      this.sendContractEmail(foundTenant, newContract, filename, pdfPath);
      await session.commitTransaction();
      session.endSession();


      return res.status(201).json({
        message: "Contract created successfully",
        contract: newContract,
        pdfPath: pdfPath, // Đường dẫn tới file PDF đã tạo
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.toString() });
    }
  }

  async sendContractEmail(tenant, contract, filename, pdfPath) {
    try {
      // Tạo link xác nhận hợp đồng
      const verificationToken = await bcrypt.hash(contract._id.toString(), keys.BCRYPT_SALT_ROUND);
      const verificationLink = `${process.env.APP_URL}/api/contract/verify?contractId=${contract._id}&token=${verificationToken}`;

      // Đọc template email
      const emailTemplatePath = path.join(__dirname, "../../resources/views/form-contract.html");
      const emailTemplate = fs.readFileSync(emailTemplatePath, "utf8");

      // Tạo nội dung email
      const emailContent = emailTemplate.replace(
        "{{tenantName}}", tenant.user.fullName
      ).replace(
        "{{verificationLink}}", verificationLink
      ).replace(
        "{{contractLink}}", `${process.env.APP_URL}/uploads/pdfContract/${filename}`
      );

      // Gửi email với hợp đồng đính kèm
      await mailer.sendMail(
        tenant.user.email,
        "Hợp đồng cho thuê phòng",
        emailContent,
        [
          {
            filename: `contract_${contract._id}.pdf`,
            path: pdfPath,
          },
        ]
      );

      console.log('Email with contract sent!');
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Error sending contract email');
    }
  }

  async verifyContract(req, res) {
    const { contractId, token } = req.query;
  
    try {
      const contract = await Contract.findById(contractId).populate("room");
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
  
      // So sánh token với token đã mã hóa của hợp đồng
      const isTokenValid = await bcrypt.compare(contractId.toString(), token);
      if (!isTokenValid) {
        return res.status(400).json({ message: "Invalid token" });
      }
      
      const room = await Room.findById(contract.room._id);
      room.status="rented";
      // Cập nhật trạng thái hợp đồng
      contract.status = "confirmed";
      await contract.save();

      room.status="rented";
      await room.save();
  
      return res.status(200).json({ message: "Contract confirmed successfully" });
    } catch (error) {
      return res.status(500).json({ message: error.toString() });
    }
  }

  // [GET] /api/contract/:id
  async getContract(req, res) {
    const { id } = req.params;

    try {
      const contract = await Contract.findById(id)
        .populate("tenant", "-__v")
        .populate("landlord", "-__v")
        .populate("room", "-__v");

      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }

      return res.status(200).json({ contract });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.toString() });
    }
  }

  // [DELETE] /api/contract/delete/:id
  async deleteContract(req, res) {
    const { id } = req.params;

    try {
      const contract = await Contract.findById(id);

      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }

      await contract.remove();

      return res.status(200).json({ message: "Contract deleted successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.toString() });
    }
  }

  // [GET] /api/contract/byLandlord
  async getContractsByLandlord(req, res) {
    const landlordId = req.user.uid; // Lấy landlordId từ thông tin user đã đăng nhập

    try {
      const contracts = await Contract.find({ landlord: landlordId }) // Tìm hợp đồng của landlord đó
        .populate({
          path: "tenant",
          populate: {
            path: "user",
            select: "email fullName", // Chỉ lấy các trường mong muốn
          },
        })
        .populate("landlord", "-__v")
        .populate("room", "-__v");

      return res.status(200).json({ contracts });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.toString() });
    }
  }

  async getContractsByTenant(req, res) {
    const tenantId = req.user.uid; // Lấy landlordId từ thông tin user đã đăng nhập

    try {
      const contract = await Contract.findOne({ tenant: tenantId, status: "confirmed" }) // Tìm hợp đồng của landlord đó
        .populate({
          path: "landlord",
          populate: {
            path: "user",
            select: "email fullName, phone",
          },
        })
        .populate("room", "-__v");

      return res.status(200).json({ contract });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.toString() });
    }
  }

  async getContractPDF(req, res) {
    const { contractId } = req.params; // Lấy ID hợp đồng từ URL
    try {
      // Tìm hợp đồng trong cơ sở dữ liệu
      const contract = await Contract.findById(contractId);
      if (!contract) {
        return res.status(404).json({ message: "Hợp đồng không tồn tại." });
      }

      // Kiểm tra xem filePath có tồn tại không
      if (!contract.pdfPath) {
        return res
          .status(400)
          .json({
            message: "Không tìm thấy đường dẫn file trong cơ sở dữ liệu.",
          });
      }
      // Đường dẫn tới thư mục chứa file PDF
      const filePath = path.join(
        __dirname,
        "..",
        "..",
        "..",
        "public",
        contract.pdfPath
      ); // Kết hợp đường dẫn thư mục 'public' với filePath từ CSDL
      console.log("Đường dẫn file:", filePath);
      // Kiểm tra xem file có tồn tại hay không
      if (fs.existsSync(filePath)) {
        console.log("File tồn tại tại đường dẫn:", filePath);
      } else {
        console.log("File không tồn tại tại đường dẫn:", filePath);
      }

      // Trả về file PDF cho client
      res.sendFile(filePath, (err) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "Đã có lỗi xảy ra khi tải file." });
        }
      });
    } catch (error) {
      console.error("Lỗi khi lấy file PDF:", error);
      res.status(500).json({ message: "Lỗi máy chủ khi xử lý yêu cầu." });
    }
  }
  
}
module.exports = new ContractController();
