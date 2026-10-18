const mongoose = require('mongoose');

const MedicationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    patientEmail: { type: String, required: true, lowercase: true },
    patientName: { type: String, default: '' },
    patientPhone: { type: String, default: '' },
    name: { type: String, required: true },
    exactTime: { type: String, default: '08:00' },
    days: { type: String, default: 'Everyday / Daily' },
    dose: { type: String, default: '1 Tablet' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Medication', MedicationSchema);