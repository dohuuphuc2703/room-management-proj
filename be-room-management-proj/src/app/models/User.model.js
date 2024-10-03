const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({

    email: { 
        type: String, 
        required: true, 
        unique: true,
        index: true, 
        validate: {
          validator: function(v) {
            return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
          },
          message: props => `${props.value} is not a valid email address!`
        }
    },

    fullName: { 
        type: String,
        default: null 
    },

    phone: { 
        type: String, 
        min: [7, 'Minimum phone number 7 numbers, got {VALUE}'],
        max: [15, 'Maximum phone number 15 numbers, got {VALUE}'], 
    },

    password: { 
        type: String, 
        default: null,
        min: [6, 'Pasword must be at least 6, got {VALUE}'],
        max: [25, 'Pasword must be at most 25, got {VALUE}'],
    },

    dob: { 
        type: Date,
        default: null 
    },

    gender: { 
        type: String,
        enum: {
            values: ["male", "female"],
            message: "Gender <{VALUE} is not supported>",
        },
        get: (value) => value.toLowerCase(),
        set: (value) => value.toLowerCase(),
    },
    
    address: { 
        type: String,
        default: null 
    },

    avatar: { 
        type: String,
        default: null 
    },

    verifiedAt: { 
        type: Date, 
        default: null,  
    },

    hidden: { 
        type: Boolean,
        default: false
    },

    hiddenAt: { 
        type: Date
    },
      
    hiddenBy: { 
        type: Schema.Types.ObjectId, 
        ref: "User", 
    },
    
    online: { 
        type: Boolean
    },
    
    onlineAt: {
        type: Date 
    },

    role: { 
        type: String, 
        required: true, 
        enum: {
          values: ["tenant", "landlord", "admin"],
          message: "Role <{VALUE}> is not supported",
        } 
    },
},{
    timestamps : true,
})

module.exports = mongoose.model("User", UserSchema, "tblUser");