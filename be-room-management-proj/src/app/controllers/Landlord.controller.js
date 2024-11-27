const Landlord = require("../models/Landlord.model");
const User = require("../models/User.model");
const Room = require("../models/Room.model");
const Tenant = require("../models/Tenant.model");
const Invoice = require("../models/Invoice.model");
const mongoose = require("mongoose");

class LandlordController {
  // [GET] /api/landlord/info/
  async getInfo(req, res) {
    const uid = req.user.id;

    try {
      const landlord = await Landlord.findOne({ user: uid })
        .select("-__v")
        .populate({
          path: "user",
          select: "-updatedAt -password -role -hidden -__v",
        });

      return res.json({
        info: landlord,
      });
    } catch (error) {
      console.log(error);
      return res.json(500).json({
        message: error.toString(),
      });
    }
  }

  // [POST] /api/landlord/info/
  async updateInfo(req, res) {
    const mid = req.user.id;

    const info = req.body;

    try {
      const session = await mongoose.startSession();
      session.startTransaction();

      const landlord = await Landlord.findOneAndUpdate(
        { user: mid },
        { new: true }
      ).select("-__v");

      const user = await User.findOneAndUpdate(
        { _id: mid },
        {
          ...info,
        },
        { new: true }
      ).select("-updatedAt -password -role -hidden -__v");

      await session.commitTransaction();
      session.endSession();

      return res.json({
        info: {
          ...landlord.toObject(),
          user,
        },
      });
    } catch (error) {
      console.log(error);
      await session.abortTransaction();
      session.endSession();

      return res.json(500).json({
        message: error.toString(),
      });
    }
  }

  // [GET] /api/landlord/userinfo/:email
  async getUserInfoByEmail(req, res) {
    const email = req.params.email; // Sửa lại để lấy email từ req.params

    try {
      const tenants = await Tenant.find()
            .populate({
                path: 'user',
                match: { email: email }, // Filter based on the email field in the User document
                select: 'email fullName phone dob gender address role', // Select specific fields to return
            })
            .select("user");

            const filteredTenants = tenants.filter(tenant => tenant.user !== null);

            if (filteredTenants.length === 0) {
              return res.status(404).json({ message: "Không tìm thấy tenant với user.email này." });
            }

      // Nếu tìm thấy user, trả về thông tin
      return res.json({
        info: filteredTenants[0],
      });
    } catch (error) {
      // Nếu có lỗi xảy ra, chỉ gọi res.json một lần trong catch
      console.log(error);
      return res.status(500).json({
        message: error.toString(),
      });
    }
  }


  async getRoomsByLandlord(req, res) {
    const landlordId = req.user.uid;
    const status = 'available'; // Lấy status từ query params
    
    try {
      // Xây dựng điều kiện lọc
      const filter = { landlord: landlordId, status: status };
     
      const rooms = await Room.find(filter)
        .sort({ createdAt: -1 })
        .select("address title acreage price maxSize amenities category servicerooms")
        .populate("category")
      
  
      return res.json({ 
        rooms }
      );
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: error.toString(),
      });
    }
  }

  async getAllStatistics(req, res) {
    const uid = req.user.uid;

    try {
      const availableCount = await Room.countDocuments({ landlord: uid, status: "available" });
      const rentedCount = await Room.countDocuments({ landlord: uid, status: "rented" });
      const roomsAvailable= await Room.find({ landlord: uid, status: "available" })
      .select("address title");
    
      const invoices = await Invoice.find({status: false})
      .populate({
        path: "contract",
        match: { landlord: uid },
        select: "-__v -pdfPath", 
        populate: [
          { 
            path: "room",
            select: "title address",
          },
          { 
            path: "tenant",
            select: "user",
            populate: {
              path: "user",
              select: "fullName email phone",
            }
          }
        ]
      })
      .select("total createdAt")
      .lean();

      const filteredInvoices = invoices.filter(invoice => invoice.contract);

      return res.status(200).json({
        statusStats: {
          available: availableCount,
          rented: rentedCount,
        },
        roomsAvailable,
        invoicesFalse: filteredInvoices,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Lỗi khi lấy thống kê tổng hợp" });
    }
  }

  async getRevenueStats(req, res) {
    const uid = req.user.uid;
    const { year } = req.query;  // Lấy tham số năm từ query (nếu có)
  
    try {
      // Nếu không có năm, sử dụng năm hiện tại
      const currentYear = year ? parseInt(year, 10) : new Date().getFullYear();
  
      // Lấy tất cả các hóa đơn chưa thanh toán trong năm
      const invoices = await Invoice.find({
        status: true,
        createdAt: { $gte: new Date(`${currentYear}-01-01`), $lt: new Date(`${currentYear + 1}-01-01`) }, // Lọc hóa đơn theo năm
      })
        .populate({
          path: 'contract',
          match: { landlord: uid },
        })
        .select('total createdAt')
        .lean();
  
      const filteredInvoices = invoices.filter(invoice => invoice.contract);
  
      // Tạo mảng doanh thu theo tháng từ 1 đến 12
      const revenueStats = Array.from({ length: 12 }, (_, index) => ({
        month: index + 1,
        totalRevenue: 0,
      }));
  
      // Tính tổng doanh thu theo tháng
      filteredInvoices.forEach(invoice => {
        const month = new Date(invoice.createdAt).getMonth(); // Lấy tháng từ `createdAt`
        revenueStats[month].totalRevenue += invoice.total; // Cộng doanh thu vào tháng
      });
  
      // Trả về doanh thu theo tháng
      return res.status(200).json({ revenueStats });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Lỗi khi lấy doanh thu' });
    }
  }
}

module.exports = new LandlordController();
