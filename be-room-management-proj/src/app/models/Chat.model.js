const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ChatSchema = new Schema({
    senderId: {
        type: Schema.Types.ObjectId, 
        ref: "User",
        require: true,
    },
    receiverId: {
        type: Schema.Types.ObjectId, 
        ref: "User",
        require: true,
    },
    content: {
        type: String,
        required: true,
    },
    sentAt: {
        type: Date,
        default: Date.now(),
    }
});

module.exports = mongoose.model("Chat", ChatSchema, "tblChat");