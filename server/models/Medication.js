import mongoose from "mongoose";

const medSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    exactTime: { type: String, default: "08:00" },
    days: { type: String, default: "Everyday / Daily" },
    dose: { type: String, default: "1 Tablet" },
    patientName: { type: String, required: true },
    patientEmail: { type: String, required: true, lowercase: true },
    patientPhone: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.model("Medication", medSchema);