const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const LandlordSchema = new Schema({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: "User",
    unique: true,
    required: true,
  },

  bankDetails: {
    bank: { 
      type: Number, 
      required: false,
    },
    accountNumber: { 
      type: String, 
      required: false,
      match: [/^\d+$/, "Số tài khoản chỉ chứa số"],
    },
    accountName: { 
      type: String, 
      required: false, // Tên tài khoản ngân hàng
    },
  }
});

module.exports = mongoose.model("Landlord", LandlordSchema, "tblLandlord");