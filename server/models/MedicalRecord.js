const mongoose = require('mongoose');

const MedicalRecordSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    patientEmail: { type: String, required: true, lowercase: true },
    patientName: { type: String, default: '' },
    title: { type: String, required: true },
    type: { type: String, default: 'Diagnostic Lab Report' },
    date: { type: String, default: () => new Date().toISOString().split('T')[0] },
    fileName: { type: String, default: '' },
    fileData: { type: String, default: '' } // Base64 document data
  },
  { timestamps: true }
);

module.exports = mongoose.model('MedicalRecord', MedicalRecordSchema);