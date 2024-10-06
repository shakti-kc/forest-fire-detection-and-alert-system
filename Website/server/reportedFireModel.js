const mongoose = require('mongoose');

const reportedFireSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

const ReportedFire = mongoose.model('ReportedFire', reportedFireSchema);

module.exports = ReportedFire;
