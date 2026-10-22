const mongoose = require('mongoose');

const TriageLogSchema = new mongoose.Schema(
  {
    patientEmail: { type: String, default: '' },
    patientName: { type: String, default: 'Patient' },
    query: { type: String, required: true },
    condition: { type: String, default: 'Symptom Analysis' },
    guidance: { type: String, required: true },
    source: { type: String, default: 'Gemini AI via Backend' },
    date: { type: String, default: () => new Date().toISOString().split('T')[0] },
    time: { type: String, default: () => new Date().toLocaleTimeString() }
  },
  { timestamps: true }
);

module.exports = mongoose.models.TriageLog || mongoose.model('TriageLog', TriageLogSchema);