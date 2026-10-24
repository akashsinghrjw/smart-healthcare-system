const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  qualification: { type: String, required: true },
  specialization: { type: String, required: true },
  hospitalName: { type: String, required: true },
  location: { type: String, required: true },
  fees: { type: Number, required: true },
  phone: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);