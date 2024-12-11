const Tenant = require("../models/Tenant.model");
const Landlord = require("../models/Landlord.model");
const Room = require("../models/Room.model");
const User = require("../models/User.model");

class AdminController {
    // [GET] /api/admin/tenant-stats
    async getMonthlyTenantStats(req, res) {
        try {
            const year = parseInt(req.query.year) || new Date().getFullYear(); // Năm hiện tại hoặc từ query
            const stats = await Tenant.aggregate([
                {
                    $lookup: {
                        from: "tblUser",
                        localField: "user",
                        foreignField: "_id",
                        as: "userDetails"
                    }
                },
                {
                    $unwind: "$userDetails"
                },
                {
                    $match: {
                        "userDetails.createdAt": {
                            $gte: new Date(`${year}-01-01`),
                            $lte: new Date(`${year}-12-31`)
                        }
                    }
                },
                {
                    $group: {
                        _id: { $month: "$userDetails.createdAt" },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { _id: 1 }
                }
            ]);
    
            const formattedStats = Array.from({ length: 12 }, (_, i) => ({
                month: i + 1,
                count: stats.find(s => s._id === i + 1)?.count || 0
            }));
    
            res.status(200).json({
                year,
                data: formattedStats
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        }
    };
    // [GET] /api/admin/landlord-stats
    async getMonthlyLandlordStats(req, res) {
        try {
            const year = parseInt(req.query.year) || new Date().getFullYear(); // Năm hiện tại hoặc từ query
            const stats = await Landlord.aggregate([
                {
                    $lookup: {
                        from: "tblUser",
                        localField: "user",
                        foreignField: "_id",
                        as: "userDetails"
                    }
                },
                {
                    $unwind: "$userDetails"
                },
                {
                    $match: {
                        "userDetails.createdAt": {
                            $gte: new Date(`${year}-01-01`),
                            $lte: new Date(`${year}-12-31`)
                        }
                    }
                },
                {
                    $group: {
                        _id: { $month: "$userDetails.createdAt" },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { _id: 1 }
                }
            ]);
    
            const formattedStats = Array.from({ length: 12 }, (_, i) => ({
                month: i + 1,
                count: stats.find(s => s._id === i + 1)?.count || 0
            }));
    
            res.status(200).json({
                year,
                data: formattedStats
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        }
    };

// API thống kê số lượng phòng mới theo từng tháng
// [GET] /api/admin/room-stats
    async getRoomStatsByMonth(req, res) {
        try {
            const { year } = req.query;
            if (!year) {
                return res.status(400).json({ message: "Year is required" });
            }

            // Tính toán số lượng phòng mới theo tháng
            const roomStats = await Room.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(`${year}-01-01T00:00:00.000Z`),
                            $lte: new Date(`${year}-12-31T23:59:59.999Z`),
                        },
                    },
                },
                {
                    $group: {
                        _id: { $month: "$createdAt" },
                        count: { $sum: 1 },
                    },
                },
                {
                    $sort: { _id: 1 }, // Sắp xếp theo tháng
                },
            ]);

            // Chuyển đổi kết quả thành format [{ month: 1, count: 10 }, ...]
            const formattedStats = Array.from({ length: 12 }, (_, i) => ({
                month: i + 1,
                count: 0,
            }));

            roomStats.forEach(({ _id, count }) => {
                formattedStats[_id - 1].count = count;
            });

            return res.status(200).json({
                success: true,
                data: formattedStats,
            });
        } catch (error) {
            console.error("Error fetching room stats:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    //[GET] api/admin/landlords
    async getLandlords(req, res) {
        try {
          // Lấy danh sách landlord và thông tin từ bảng User
          const landlords = await Landlord.find()
            .populate("user", "email fullName phone dob gender address avatar role hidden hiddenAt")
            .exec();
      
          // Lấy tổng số phòng mỗi landlord sở hữu
          const landlordsWithRoomCount = await Promise.all(
            landlords.map(async (landlord) => {
              const roomCount = await Room.countDocuments({ landlord: landlord._id });
              return {
                ...landlord.toObject(),
                roomCount,
              };
            })
          );
      
          res.status(200).json({
            success: true,
            data: landlordsWithRoomCount,
          });
        } catch (error) {
          console.error(error);
          res.status(500).json({
            success: false,
            message: "Không thể lấy danh sách các landlord.",
            error: error.message,
          });
        }
    };
    // [PUT] api/admin/landlord/block/:landlordId
    async blockLandlord(req, res) {
        const { landlordId } = req.params; // Lấy ID của landlord từ params

        try {
            const updatedUser = await User.findByIdAndUpdate(
            landlordId,
            {
                hidden: true,
                hiddenAt: new Date(),
            },
            { new: true } // Trả về user sau khi cập nhật
            );

            if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy tài khoản landlord.",
            });
            }

            res.status(200).json({
            success: true,
            message: "Đã chặn tài khoản landlord thành công.",
            data: updatedUser,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
            success: false,
            message: "Không thể chặn tài khoản landlord.",
            error: error.message,
            });
        }
    };

    //[PUT] api/admin/landlord/unlock/:landlordId
    async unlockLandlord(req, res) {
        const { landlordId } = req.params; // Lấy ID của landlord từ params

        try {
          const updatedUser = await User.findByIdAndUpdate(
            landlordId,
            {
              hidden: false,
              hiddenAt: null,
            },
            { new: true } // Trả về user sau khi cập nhật
          );
      
          if (!updatedUser) {
            return res.status(404).json({
              success: false,
              message: "Không tìm thấy tài khoản landlord.",
            });
          }
      
          res.status(200).json({
            success: true,
            message: "Đã mở khóa tài khoản landlord thành công.",
            data: updatedUser,
          });
        } catch (error) {
          console.error(error);
          res.status(500).json({
            success: false,
            message: "Không thể mở khóa tài khoản landlord.",
            error: error.message,
          });
        }
      };
      
}


module.exports = new AdminController();
