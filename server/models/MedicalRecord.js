import mongoose from "mongoose";

const recordSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: { type: String, default: "Diagnostic Lab Report" },
    patientName: { type: String, required: true },
    patientEmail: { type: String, required: true, lowercase: true },
    date: { type: String, default: () => new Date().toISOString().split("T")[0] },
    fileData: { type: String, default: "" },
    fileName: { type: String, default: "Document File" }
  },
  { timestamps: true }
);

export default mongoose.model("MedicalRecord", recordSchema);