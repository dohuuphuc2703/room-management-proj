const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const LandlordSchema = new Schema({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: "User",
    unique: true,
    required: true,
  }
});

module.exports = mongoose.model("Landlord", LandlordSchema, "tblLandlord");