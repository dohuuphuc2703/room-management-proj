const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ContractSchema = new Schema({
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

    size : {
        type : Number,
        required: true,
        default: null,
    },


    start_date : {
        type : Date,
        required: true,
        default: null,
    },
    members: [
        {
            memberName: {
                type: String,
                required: true,
            },
            memberPhone: {
                type: String,
                required: true,
            },
            memberGender: {
                type: String,
                enum: ['male', 'female'],
                required: true,
            },
            memberAddress: {
                type: String,
                required: true,
            }
        }
    ], 

    pdfPath :{
        type: String,
    },

    status: { 
        type: String,
        enum: {
            values: ["waiting", "canceled", "confirmed"],
            message: "status <{VALUE} is not supported>",
        },
    },

},{
    timestamps : true,
});

module.exports = mongoose.model("Contract", ContractSchema, "tblContract");