const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
    rating: { 
        type: Number, 
        default: null,  
    },

    comment: { 
        type: String, 
        default: null,  
    },

    tenant: { 
        type: Schema.Types.ObjectId, 
        ref: "Tenant",
        unique: true,
        required: true,
    },

    room: { 
        type: Schema.Types.ObjectId, 
        ref: "Room",
    },
},{
    timestamps : true,
});

module.exports = mongoose.model("Review", ReviewSchema, "tblReview");