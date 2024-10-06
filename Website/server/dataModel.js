const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
  humidity: {
    type: Number,
    required: true,
  },
  temperature: {
    type: Number,
    required: true,
  },
  lpg: {
    type: Number,
    required: true,
  },
  co: {
    type: Number,
    required: true,
  },
  smoke: {
    type: Number,
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
  isFireDetected: {
    type: Boolean,
    required: true,
  },
  
}, { timestamps: true });

const Data = mongoose.model('data', dataSchema);

module.exports = Data;
