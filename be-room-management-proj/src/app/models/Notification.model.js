const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const NotificationSchema = new Schema({
    recipient: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    type: { 
        type: String, 
        enum: ['contract', 'invoice'], 
        required: true 
    },
    message: { 
        type: String, 
        required: true 
    },
    isRead: { 
        type: Boolean, 
        default: false 
    }, // Trạng thái đã đọc
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
});

module.exports = mongoose.model("Notification", NotificationSchema, "tblNotification");
