const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const RoomSchema = new Schema({
    title: {
        type: String,
        required: true,
    },

    description: {
        type: String,
        required: true,
    },

    address: {
        province: {
            type: String,
            required: true,
        },
        district: {
            type: String,
            required: true,
        },
        ward: {
            type: String,
            required: true,
        },
        detail: { type: String },
    },

    acreage: { 
        type: Number,
        default: null 
    },

    price: { 
        type: Number,
        default: null 
    },

    rating: { 
        type: Number,
        default: null 
    },

    status: { 
        type: String,
        default: null 
    },

    amenities: [{ 
        type: String,
        default: null 
    }],

    landlord: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    
    category: {
        type: Schema.Types.ObjectId,
        ref: "RoomCategory",
        required: true,
    },

    servicerooms: [{
        name: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            default: null,
        },
        description: {
            type: String,
            default: null,
        }
    }],
    images: [{
        type: String,
        default: null,
    }]

},{
    timestamps : true,
})

module.exports = mongoose.model("Room", RoomSchema, "tblRoom");