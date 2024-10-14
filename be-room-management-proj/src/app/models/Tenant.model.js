const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TenantSchema = new Schema({
    user: { 
        type: Schema.Types.ObjectId, 
        ref: "User",
        unique: true,
        required: true,
    },
  
    googleId: { 
        type: String 
    },

    facebookId: { 
        type: String 
    },

    saveRooms: [{ 
        type: Schema.Types.ObjectId, 
        ref: "Room",
        unique: true,
    }]
});

module.exports = mongoose.model("Tenant", TenantSchema, "tblTenant");