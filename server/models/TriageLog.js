import mongoose from "mongoose";

const triageSchema = new mongoose.Schema(
  {
    patientName: { type: String, required: true },
    patientEmail: { type: String, required: true, lowercase: true },
    query: { type: String, required: true },
    condition: { type: String, required: true },
    date: { type: String, default: () => new Date().toLocaleDateString() },
    time: { type: String, default: () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }
  },
  { timestamps: true }
);

export default mongoose.model("TriageLog", triageSchema);