const Notification = require('../models/Notification.model');

class NotificationController {
    //[GET] api/notification/by-tenant
    async getNotifications(req, res) {
        try {
            // Lấy `req.user` từ middleware isAuthenticated
            const userId = req.user.id;
    
            // Tìm thông báo theo `recipient`
            const notifications = await Notification.find({ recipient: userId })
                .sort({ createdAt: -1 }); // Sắp xếp mới nhất ở đầu
    
            res.status(200).json({
                notifications,
            });
        } catch (error) {
            console.error("Error fetching notifications:", error);
            res.status(500).json({
                success: false,
                message: 'Có lỗi xảy ra khi lấy thông báo.',
            });
        }
    };
}



module.exports = new NotificationController();
