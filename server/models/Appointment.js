const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  doctorEmail: { type: String, lowercase: true, trim: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  patientName: { type: String, required: true },
  patientEmail: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  receiptId: { type: String },
  prescription: { type: String, default: '' },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Appointment', appointmentSchema);