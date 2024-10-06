const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  phone: String,
  latitude: Number,
  longitude: Number,
},{ timestamps: true });

const User = mongoose.model("user", userSchema);
module.exports = User;
