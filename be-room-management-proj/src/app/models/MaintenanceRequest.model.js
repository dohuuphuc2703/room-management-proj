const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const MaintenanceRequestSchema = new Schema({
    tenant: { 
        type: Schema.Types.ObjectId, 
        ref: "Tenant",
        unique: true,
        required: true,
    },

    landlord: { 
        type: Schema.Types.ObjectId, 
        ref: "Landlord",
        unique: true,
        required: true,
    },

    room: { 
        type: Schema.Types.ObjectId, 
        ref: "Room",
        unique: true,
        required: true,
    },

    title :{
        type: String,
        default: null,
    },

    price: {
        type: String,
        default: null,
    },

    request_status: { 
        type: String, 
        required: true, 
        enum: {
          values: ["Đang chờ duyệt", "Từ chối", "Đã duyệt"],
        },
        default: "Đang xử lý",
    },

    progress_status: { 
        type: String, 
        required: true, 
        enum: {
          values: ["Đang xử lý", "Hoàn thành"],
        },
        default: null,
    },

    payment_status: { 
        type: String, 
        required: true, 
        enum: {
          values: ["Chưa thanh toán", "Đã thanh toán"],
        },
        default: null,
    },

},{
    timestamps : true,
});

module.exports = mongoose.model("Contract", ContractSchema, "tblContract");