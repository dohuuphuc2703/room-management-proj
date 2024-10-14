const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const AdminSchema = new Schema({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: "User",
    unique: true,
    required: true,
  }
});

module.exports = mongoose.model("Admin", AdminSchema, "tblAdmin");