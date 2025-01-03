const { Server } = require("socket.io");
const Notification = require("../models/Notification.model");
const User = require("../models/User.model");

module.exports.runNotificationService = (server) => {
  const io = new Server(server, {
    cors: {
      origin: [
        "http://127.0.0.1:3000", "http://localhost:3000", 
        "http://127.0.0.1:5000", "http://localhost:5000", 
        "http://127.0.0.1:7000", "http://localhost:7000"
      ],
      credentials: true,
    },
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000,
      skipMiddlewares: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected to notification service");

    socket.on("disconnect", () => {
      console.log("User disconnected from notification service");
    });

    // Subscribe vào phòng của user
    socket.on("subscribe", async (uid) => {
      console.log(`User ${uid} subscribed`);
      socket.join(`user_${uid}`);
    });

    socket.on("unsubscribe", (uid) => {
      console.log(`User ${uid} unsubscribed`);
      socket.leave(`user_${uid}`);
    });

    // Lấy danh sách thông báo
    socket.on("get_notifications", async (uid, page, callback) => {
      try {
        const notifications = await Notification.find({ recipient: uid })
          .skip((page - 1) * 10) // Skip theo trang
          .limit(10) // Lấy tối đa 10 thông báo
          .sort({ createdAt: -1 })
          .lean();

        callback(notifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        callback([]);
      }
    });

    // Đánh dấu thông báo là đã đọc
    socket.on("mark_as_read", async ({ userId, notificationId }) => {
      try {
        await Notification.updateOne(
          { _id: notificationId, recipient: userId },
          { $set: { isRead: true } }
        );
        console.log(`Notification ${notificationId} marked as read`);
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    });

    // Tạo thông báo và gửi tới client
    socket.on("send_notification", async ({ recipient, message, type }) => {
      try {
        const notification = await Notification.create({
          recipient,
          message,
          type,
          createdAt: new Date(),
        });
        io.to(`user_${recipient}`).emit("receive_notification", notification);
      } catch (error) {
        console.error("Error sending notification:", error);
      }
    });
  });
};
