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

},{
    timestamps : true,
});

module.exports = mongoose.model("Contract", ContractSchema, "tblContract");